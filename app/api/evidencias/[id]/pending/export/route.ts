import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";
import { writeAuditLog } from "@/src/lib/audit";

function safe(v: unknown) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
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
  const empresa = (url.searchParams.get("empresa") ?? "").trim();
  const includeInactive = url.searchParams.get("includeInactive") === "1";

  const { id: evidenceId } = await context.params;

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
  });

  if (!evidence) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const qs = new URLSearchParams();
  if (empresa) qs.set("empresa", empresa);
  if (includeInactive) qs.set("includeInactive", "1");

  const base = `${url.origin}/api/evidencias/${evidenceId}/compliance${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;

  const res = await fetch(base, {
    cache: "no-store",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  const json: any = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: json?.error || "COMPLIANCE_ERROR" },
      { status: 500 }
    );
  }

  const pending = json?.pending ?? [];
  const currentVersion = json?.currentVersion ?? evidence.currentVersion ?? 0;

  const header = [
    "evidenceId",
    "evidenceTitle",
    "currentVersion",
    "cpf",
    "nome",
    "empresa",
    "filtroEmpresa",
    "includeInactive",
  ].join(",");

  const csv = [
    header,
    ...pending.map((p: any) =>
      [
        safe(evidenceId),
        safe(evidence.title),
        safe(currentVersion),
        safe(p.cpf),
        safe(p.nome),
        safe(p.empresa),
        safe(empresa || ""),
        safe(includeInactive ? "1" : "0"),
      ].join(",")
    ),
  ].join("\n");

  await writeAuditLog({
    action: "EXPORT",
    actorCpf: session.cpf,
    actorName: session.nome ?? null,
    entity: "EvidencePending",
    entityId: evidenceId,
    metadata: {
      format: "CSV",
      count: pending.length,
      currentVersion,
      empresa,
      includeInactive,
    },
  });

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="pendencias_${evidenceId}_v${currentVersion}.csv"`,
    },
  });
}