import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";
import { writeAuditLog } from "@/src/lib/audit";
import type { EvidenceAcknowledgement } from "@prisma/client";

function safe(v: unknown) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

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
  });

  if (!evidence) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const rows: EvidenceAcknowledgement[] =
    await prisma.evidenceAcknowledgement.findMany({
      where: { evidenceId },
      orderBy: [{ version: "desc" }, { acknowledgedAt: "desc" }],
    });

  const header = [
    "evidenceId",
    "evidenceTitle",
    "version",
    "cpf",
    "name",
    "acknowledgedAt",
    "ip",
    "userAgent",
  ].join(",");

  const csv = [
    header,
    ...rows.map((r: EvidenceAcknowledgement) =>
      [
        safe(evidenceId),
        safe(evidence.title),
        safe(r.version),
        safe(r.cpf),
        safe(r.name),
        safe(r.acknowledgedAt.toISOString()),
        safe(r.ip),
        safe(r.userAgent),
      ].join(",")
    ),
  ].join("\n");

  await writeAuditLog({
    action: "EXPORT",
    actorCpf: session.cpf,
    actorName: session.nome ?? null,
    entity: "EvidenceAcknowledgement",
    entityId: evidenceId,
    metadata: { format: "CSV", count: rows.length },
  });

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="ciencias_${evidenceId}.csv"`,
    },
  });
}