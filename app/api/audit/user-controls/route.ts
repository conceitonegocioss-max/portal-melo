import { NextResponse } from "next/server";
import { writeAuditLog } from "@/src/lib/audit";
import { prisma } from "@/src/lib/prisma";

const ACTION_USER_STATUS = "USUARIO_STATUS_ATUALIZADO";
const ACTION_CERT = "CERTIFICACAO_ATUALIZADA";

type Metadata = Record<string, unknown>;

function safeParse(value: string | null): Metadata {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function asText(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [ACTION_USER_STATUS, ACTION_CERT],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10000,
    });

    const userStatus: Record<string, string> = {};
    const certificacoes: Record<string, Record<string, { status?: string; vencimento?: string }>> = {};
    const historico = logs.map((log) => {
      const meta = safeParse(log.metadata);
      return {
        id: String(log.id),
        atISO: asText(meta.atISO) || log.createdAt.toISOString(),
        action: log.action,
        actorCpf: log.actorCpf || "",
        actorNome: log.actorName || "",
        targetId: asText(meta.targetId) || log.entityId || "",
        targetCpf: asText(meta.targetCpf),
        targetNome: asText(meta.targetNome) || log.entity || "",
        campo: asText(meta.campo),
        antes: meta.antes,
        depois: meta.depois,
      };
    });

    for (const log of logs) {
      const meta = safeParse(log.metadata);
      const targetId = asText(meta.targetId) || log.entityId || "";
      if (!targetId) continue;

      if (log.action === ACTION_USER_STATUS) {
        if (!userStatus[targetId]) {
          userStatus[targetId] = asText(meta.depois);
        }
        continue;
      }

      if (log.action === ACTION_CERT) {
        const tipo = asText(meta.tipo);
        const campo = asText(meta.campo);
        if (!tipo || !campo) continue;

        if (!certificacoes[targetId]) certificacoes[targetId] = {};
        if (!certificacoes[targetId][tipo]) certificacoes[targetId][tipo] = {};

        if (certificacoes[targetId][tipo][campo as "status" | "vencimento"] === undefined) {
          certificacoes[targetId][tipo][campo as "status" | "vencimento"] = asText(meta.depois);
        }
      }
    }

    return NextResponse.json({ ok: true, userStatus, certificacoes, historico });
  } catch (error) {
    console.error("user-controls GET error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const control = asText(body.control);
    const actorCpf = asText(body.actorCpf);
    const actorNome = asText(body.actorNome);
    const targetId = asText(body.targetId);
    const targetCpf = asText(body.targetCpf);
    const targetNome = asText(body.targetNome);
    const empresa = asText(body.empresa);
    const atISO = new Date().toISOString();

    if (!targetId || !targetNome) {
      return NextResponse.json({ ok: false, error: "target_required" }, { status: 400 });
    }

    if (control === "usuarioStatus") {
      await writeAuditLog({
        action: ACTION_USER_STATUS,
        actorCpf,
        actorName: actorNome || null,
        entity: targetNome,
        entityId: targetId,
        metadata: {
          atISO,
          module: "usuarios-perfis",
          targetId,
          targetCpf,
          targetNome,
          empresa,
          campo: "statusUsuario",
          antes: body.antes ?? "",
          depois: body.depois ?? "",
          obs: "Alteração de status de usuário realizada pela tela Usuários & Perfis.",
        },
      });

      return NextResponse.json({ ok: true, atISO });
    }

    if (control === "certificacao") {
      const tipo = asText(body.tipo);
      const campo = asText(body.campo);
      if (!tipo || !campo) {
        return NextResponse.json({ ok: false, error: "cert_fields_required" }, { status: 400 });
      }

      await writeAuditLog({
        action: ACTION_CERT,
        actorCpf,
        actorName: actorNome || null,
        entity: targetNome,
        entityId: targetId,
        metadata: {
          atISO,
          module: "controle-certificacoes",
          targetId,
          targetCpf,
          targetNome,
          empresa,
          tipo,
          campo,
          antes: body.antes ?? "",
          depois: body.depois ?? "",
          obs: "Alteração de controle de certificação realizada pela tela Controle de Certificações.",
        },
      });

      return NextResponse.json({ ok: true, atISO });
    }

    return NextResponse.json({ ok: false, error: "invalid_control" }, { status: 400 });
  } catch (error) {
    console.error("user-controls POST error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
