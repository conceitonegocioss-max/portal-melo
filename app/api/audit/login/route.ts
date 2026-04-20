import { NextResponse } from "next/server";
import { appendLoginLog } from "@/src/lib/auditlogin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ define action de forma compatível
    // - se vier action, usa
    // - senão, se vier sucesso boolean, converte
    const action =
      (body?.action as "LOGIN_OK" | "LOGIN_FALHA" | "LOGOUT" | undefined) ||
      (body?.sucesso === true ? "LOGIN_OK" : body?.sucesso === false ? "LOGIN_FALHA" : "LOGIN_OK");

    await appendLoginLog({
      action,
      cpf: String(body?.cpf || ""),
      nome: String(body?.nome || ""),
      perfil: String(body?.perfil || ""),
      empresa: String(body?.empresa || ""),
      atISO: String(body?.atISO || new Date().toISOString()),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
      userAgent: req.headers.get("user-agent") || "",
      obs: body?.motivo ? String(body.motivo) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
