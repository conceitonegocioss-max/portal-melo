import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";
import { writeAuditLog } from "@/src/lib/audit";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.cpf) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: evidenceId } = await context.params;

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { versions: { orderBy: { version: "desc" } } },
  });

  if (!evidence) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const acks = await prisma.evidenceAcknowledgement.findMany({
    where: { evidenceId },
    orderBy: [{ version: "desc" }, { acknowledgedAt: "desc" }],
  });

  await writeAuditLog({
    action: "VIEW",
    actorCpf: session.cpf,
    actorName: session.nome ?? null,
    entity: "EvidenceAcknowledgementList",
    entityId: evidenceId,
    metadata: { evidenceId },
  });

  return NextResponse.json({ evidence, acks });
}