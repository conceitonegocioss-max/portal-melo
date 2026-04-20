import { NextResponse } from "next/server";
import { appendEventLog, clearEventLog, listEventLog } from "@/src/lib/auditevents";

export async function GET() {
  try {
    const items = await listEventLog();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, items: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await appendEventLog({
      type: body?.type || "OUTRO",
      atISO: body?.atISO || new Date().toISOString(),

      actorCpf: body?.actorCpf ? String(body.actorCpf) : undefined,
      actorNome: body?.actorNome ? String(body.actorNome) : undefined,
      actorPerfil: body?.actorPerfil ? String(body.actorPerfil) : undefined,
      actorEmpresa: body?.actorEmpresa ? String(body.actorEmpresa) : undefined,

      targetCpf: body?.targetCpf ? String(body.targetCpf) : undefined,

      module: body?.module ? String(body.module) : undefined,
      entityId: body?.entityId ? String(body.entityId) : undefined,
      entityTitle: body?.entityTitle ? String(body.entityTitle) : undefined,

      meta: typeof body?.meta === "object" && body.meta !== null ? body.meta : undefined,
      obs: body?.obs ? String(body.obs) : undefined,

      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await clearEventLog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}