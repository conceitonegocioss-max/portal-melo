import { NextResponse } from "next/server";
import { writeAuditLog } from "@/src/lib/audit";
import { prisma } from "@/src/lib/prisma";

type ProgressItem = {
  status: "Concluído";
  dataISO: string;
};

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function safeParseMetadata(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const actorCpf = onlyDigits(url.searchParams.get("actorCpf") || url.searchParams.get("cpf") || "");
    const action = url.searchParams.get("action") || "TREINAMENTO_CONCLUIDO";
    const moduleFilter = url.searchParams.get("module") || "treinamentos";

    if (!actorCpf) {
      return NextResponse.json({
        ok: true,
        message: "Rota de auditoria ativa no banco.",
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        actorCpf,
        action,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 1000,
    });

    const progress: Record<string, ProgressItem> = {};

    for (const log of logs) {
      if (!log.entityId) continue;

      const metadata = safeParseMetadata(log.metadata);
      const logModule = String(metadata.module || "");

      if (moduleFilter && logModule && logModule !== moduleFilter) continue;

      const atISO = String(metadata.atISO || log.createdAt.toISOString());

      progress[log.entityId] = {
        status: "Concluído",
        dataISO: atISO,
      };
    }

    return NextResponse.json({
      ok: true,
      actorCpf,
      action,
      module: moduleFilter,
      progress,
    });
  } catch (error) {
    console.error("audit events GET error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await writeAuditLog({
      action: String(body?.type || "OUTRO"),
      actorCpf: String(body?.actorCpf || body?.cpf || ""),
      actorName: String(body?.actorNome || body?.nome || "") || null,
      entity: String(body?.entityTitle || body?.module || "Sistema"),
      entityId: body?.entityId ? String(body.entityId) : null,
      metadata: {
        atISO: String(body?.atISO || new Date().toISOString()),
        actorPerfil: String(body?.actorPerfil || body?.perfil || ""),
        actorEmpresa: String(body?.actorEmpresa || body?.empresa || ""),
        targetCpf: body?.targetCpf ? String(body.targetCpf) : "",
        module: body?.module ? String(body.module) : "",
        entityTitle: body?.entityTitle ? String(body.entityTitle) : "",
        meta: typeof body?.meta === "object" && body?.meta !== null ? body.meta : {},
        obs: body?.obs ? String(body.obs) : "",
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("audit events POST error:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
