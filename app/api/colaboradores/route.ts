import { NextResponse } from "next/server";
import { COLABORADORES } from "@/src/data/colaboradores";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      items: COLABORADORES.map((c) => ({
        id: c.id,
        nome: c.nome,
        cpf: c.cpf,
        empresa: c.empresa,
        perfil: c.perfil,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erro ao carregar colaboradores." },
      { status: 500 }
    );
  }
}
