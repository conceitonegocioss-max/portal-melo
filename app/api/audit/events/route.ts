import { NextResponse } from "next/server";
import { writeAuditLog } from "@/src/lib/audit";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      message: "Rota de auditoria ativa no banco.",
    });
  } catch {
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