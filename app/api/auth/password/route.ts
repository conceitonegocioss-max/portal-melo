import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { COLABORADORES } from "@/src/data/colaboradores";

function onlyDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
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

function passwordHash(cpf: string, password: string) {
  const secret = process.env.PASSWORD_HASH_SECRET || "portal-colaborador-salt-v1";
  return crypto
    .createHash("sha256")
    .update(`${secret}:${onlyDigits(cpf)}:${String(password || "")}`)
    .digest("hex");
}

function senhaInicial(user: { cpf: string; senha?: string }) {
  const cpf = onlyDigits(user.cpf);
  return String(user.senha || cpf.slice(-4));
}

async function buscarHashAtual(cpf: string) {
  const cpfLimpo = onlyDigits(cpf);
  const log = await prisma.auditLog.findFirst({
    where: {
      action: "PORTAL_SENHA_ALTERADA",
      actorCpf: cpfLimpo,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!log) return null;
  const metadata = safeParseMetadata(log.metadata);
  const meta =
    typeof metadata.meta === "object" && metadata.meta !== null
      ? (metadata.meta as Record<string, unknown>)
      : metadata;

  const hash = String(meta.passwordHash || "");
  return hash || null;
}

async function validarSenha(user: (typeof COLABORADORES)[number], senha: string) {
  const cpf = onlyDigits(user.cpf);
  const hashAtual = await buscarHashAtual(cpf);

  if (hashAtual) {
    return {
      ok: hashAtual === passwordHash(cpf, senha),
      mustChangePassword: false,
      origem: "senha_cadastrada",
    };
  }

  const inicial = senhaInicial(user);
  return {
    ok: senha === inicial || senha === cpf.slice(-4),
    mustChangePassword: true,
    origem: "senha_inicial",
  };
}

function publicUser(user: (typeof COLABORADORES)[number], mustChangePassword: boolean) {
  return {
    id: user.id,
    nome: user.nome,
    cpf: onlyDigits(user.cpf),
    perfil: user.perfil,
    empresa: user.empresa || "",
    status: user.status,
    mustChangePassword,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || "login");
    const cpf = onlyDigits(body?.cpf);

    const user = COLABORADORES.find((c) => onlyDigits(c.cpf) === cpf);

    if (!user) {
      return NextResponse.json({ ok: false, message: "CPF ou senha inválidos." }, { status: 401 });
    }

    if (user.status === "INATIVO") {
      return NextResponse.json({ ok: false, message: "Usuário inativo." }, { status: 403 });
    }

    if (action === "login") {
      const senha = String(body?.senha || "");
      const validacao = await validarSenha(user, senha);

      if (!validacao.ok) {
        return NextResponse.json({ ok: false, message: "CPF ou senha inválidos." }, { status: 401 });
      }

      return NextResponse.json({
        ok: true,
        user: publicUser(user, validacao.mustChangePassword),
        mustChangePassword: validacao.mustChangePassword,
      });
    }

    if (action === "change") {
      const senhaAtual = String(body?.senhaAtual || "");
      const novaSenha = String(body?.novaSenha || "");
      const confirmarSenha = String(body?.confirmarSenha || "");

      const validacao = await validarSenha(user, senhaAtual);
      if (!validacao.ok) {
        return NextResponse.json({ ok: false, message: "Senha atual inválida." }, { status: 401 });
      }

      if (novaSenha !== confirmarSenha) {
        return NextResponse.json({ ok: false, message: "A nova senha e a confirmação não conferem." }, { status: 400 });
      }

      if (novaSenha.length < 6) {
        return NextResponse.json({ ok: false, message: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 });
      }

      if (/^\d{4}$/.test(novaSenha) || novaSenha === senhaInicial(user) || novaSenha === cpf.slice(-4)) {
        return NextResponse.json({ ok: false, message: "A nova senha não pode ser igual à senha inicial." }, { status: 400 });
      }

      const atISO = new Date().toISOString();

      await prisma.auditLog.create({
        data: {
          action: "PORTAL_SENHA_ALTERADA",
          actorCpf: cpf,
          actorName: user.nome,
          entity: "Senha do Portal do Colaborador",
          entityId: cpf,
          metadata: JSON.stringify({
            atISO,
            actorPerfil: user.perfil,
            actorEmpresa: user.empresa || "",
            module: "auth",
            entityTitle: "Alteração de senha",
            meta: {
              origem: validacao.origem,
              passwordHash: passwordHash(cpf, novaSenha),
              algoritmo: "sha256-salt-v1",
              observacao: "Senha alterada pelo colaborador. A senha em texto não é armazenada.",
            },
            obs: "Senha provisória substituída por senha cadastrada pelo colaborador.",
          }),
        },
      });

      return NextResponse.json({
        ok: true,
        user: publicUser(user, false),
        mustChangePassword: false,
      });
    }

    return NextResponse.json({ ok: false, message: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("password auth error:", error);
    return NextResponse.json({ ok: false, message: "Erro interno ao processar a senha." }, { status: 500 });
  }
}
