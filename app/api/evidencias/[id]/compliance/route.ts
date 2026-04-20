import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";
import { writeAuditLog } from "@/src/lib/audit";

function onlyDigits(v: unknown) {
  return String(v ?? "").replace(/\D/g, "");
}

function pickCpf(c: any) {
  return onlyDigits(c?.cpf ?? c?.CPF ?? c?.documento ?? c?.documentoCpf ?? c?.doc ?? c?.id);
}

function pickNome(c: any) {
  return String(
    c?.nome ?? c?.name ?? c?.colaborador ?? c?.funcionario ?? c?.fullName ?? ""
  ).trim();
}

function pickEmpresa(c: any) {
  return String(
    c?.empresa ?? c?.empresaNome ?? c?.company ?? c?.unidade ?? c?.filial ?? ""
  ).trim();
}

function isActiveColaborador(c: any) {
  const ativo = c?.ativo;
  const status = String(c?.status ?? "").toUpperCase();
  const desligado = c?.desligado;

  if (typeof ativo === "boolean") return ativo;
  if (typeof desligado === "boolean") return !desligado;
  if (status) return status !== "INATIVO" && status !== "DESLIGADO";
  return true;
}

type ExpectedColab = {
  cpf: string;
  nome: string;
  empresa: string;
};

type AckLite = {
  cpf: string;
  name: string | null;
  acknowledgedAt: Date;
};

async function loadColaboradores() {
  const mod: any = await import("@/src/data/colaboradores");
  const list = mod?.COLABORADORES ?? mod?.colaboradores ?? mod?.default ?? [];
  return Array.isArray(list) ? list : [];
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.cpf) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("includeInactive") === "1";
  const empresaFilter = (url.searchParams.get("empresa") ?? "").trim();

  const { id: evidenceId } = await context.params;

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { versions: { orderBy: { version: "desc" } } },
  });

  if (!evidence) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const currentVersion = evidence.currentVersion ?? 0;

  if (currentVersion <= 0) {
    return NextResponse.json({
      evidence,
      currentVersion,
      stats: { expected: 0, signed: 0, pending: 0, compliancePct: 0 },
      signed: [],
      pending: [],
      filter: { empresa: empresaFilter || null, includeInactive },
    });
  }

  const colaboradoresRaw = await loadColaboradores();

  const expectedAll: ExpectedColab[] = colaboradoresRaw
    .filter((c: any) => (includeInactive ? true : isActiveColaborador(c)))
    .map((c: any) => ({
      cpf: pickCpf(c),
      nome: pickNome(c) || "—",
      empresa: pickEmpresa(c) || "—",
    }))
    .filter((c: ExpectedColab) => c.cpf.length > 0);

  const expected: ExpectedColab[] = empresaFilter
    ? expectedAll.filter(
        (c: ExpectedColab) =>
          c.empresa.toLowerCase() === empresaFilter.toLowerCase()
      )
    : expectedAll;

  const acks: AckLite[] = await prisma.evidenceAcknowledgement.findMany({
    where: { evidenceId, version: currentVersion },
    select: { cpf: true, name: true, acknowledgedAt: true },
  });

  const signedSet = new Set(acks.map((a: AckLite) => onlyDigits(a.cpf)));

  const signed = expected
    .filter((c: ExpectedColab) => signedSet.has(onlyDigits(c.cpf)))
    .map((c: ExpectedColab) => {
      const ack = acks.find(
        (a: AckLite) => onlyDigits(a.cpf) === onlyDigits(c.cpf)
      );

      return {
        ...c,
        acknowledgedAt: ack?.acknowledgedAt?.toISOString() ?? null,
      };
    });

  const pending = expected.filter(
    (c: ExpectedColab) => !signedSet.has(onlyDigits(c.cpf))
  );

  const stats = {
    expected: expected.length,
    signed: signed.length,
    pending: pending.length,
    compliancePct:
      expected.length === 0
        ? 0
        : Math.round((signed.length / expected.length) * 100),
  };

  await writeAuditLog({
    action: "VIEW",
    actorCpf: session.cpf,
    actorName: session.nome ?? null,
    entity: "EvidenceCompliance",
    entityId: evidenceId,
    metadata: { evidenceId, currentVersion, empresaFilter, includeInactive },
  });

  return NextResponse.json({
    evidence,
    currentVersion,
    stats,
    signed,
    pending,
    filter: { empresa: empresaFilter || null, includeInactive },
  });
}