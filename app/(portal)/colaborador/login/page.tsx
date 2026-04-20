"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { normalizeCpf, setSession } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";

export default function ColaboradorLoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function registrarLoginAudit(payload: any) {
    try {
      await fetch("/api/audit/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  }

  async function registrarEventoCentral(payload: any) {
    try {
      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErro(null);
    setLoading(true);

    const cpfLimpo = normalizeCpf(cpf);

    if (!cpfLimpo || !senha) {
      setLoading(false);
      setErro("Informe CPF e senha para continuar.");
      return;
    }

    const user = COLABORADORES.find(
      (c) => normalizeCpf(c.cpf) === cpfLimpo && c.senha === senha
    );

    if (!user) {
      const atISO = new Date().toISOString();

      await registrarLoginAudit({
        cpf: cpfLimpo,
        nome: "",
        perfil: "",
        empresa: "",
        atISO,
        sucesso: false,
        motivo: "CPF ou senha inválidos",
      });

      await registrarEventoCentral({
        type: "LOGIN_FALHA",
        module: "auth",
        entity: "Login",
        entityId: cpfLimpo,
        cpf: cpfLimpo,
        nome: "",
        perfil: "",
        empresa: "",
        atISO,
        obs: "CPF ou senha inválidos",
      });

      setLoading(false);
      setErro("CPF ou senha inválidos. Verifique e tente novamente.");
      return;
    }

    const session = {
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      perfil: user.perfil,
      empresa: user.empresa || "",
    };

    setSession(session);

    const atISO = new Date().toISOString();

    await registrarLoginAudit({
      cpf: session.cpf,
      nome: session.nome,
      perfil: session.perfil,
      empresa: session.empresa,
      atISO,
      sucesso: true,
    });

    await registrarEventoCentral({
      type: "LOGIN_OK",
      module: "auth",
      entity: "Login",
      entityId: normalizeCpf(session.cpf),
      cpf: session.cpf,
      nome: session.nome,
      perfil: session.perfil,
      empresa: session.empresa,
      atISO,
      obs: "",
    });

    router.replace("/colaborador");
  }

  return (
    <main className="login-wrap">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <img src="/logo.png" alt="Logo" className="login-logo" />
            <div className="login-brand-text">
              <div className="login-brand-title">Área do Colaborador</div>
              <div className="login-brand-sub">
                Correspondente Autorizado MaisBB
              </div>
            </div>
          </div>

          <h1 className="login-title">Login do Colaborador</h1>
          <p className="login-subtitle">
            Acesse com seu CPF e senha para visualizar treinamentos e provas.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label className="login-label">CPF</label>
            <input
              className="login-input"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Somente números"
              inputMode="numeric"
              autoComplete="username"
            />

            <label className="login-label">Senha</label>
            <input
              className="login-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              type="password"
              autoComplete="current-password"
            />

            {erro && <div className="login-error">⚠️ {erro}</div>}

            <button className="btn btn-yellow login-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="login-links">
              <Link href="/" className="login-link">
                ⬅ Voltar ao site
              </Link>
              <span className="login-help">
                Dúvidas? Procure seu gestor/qualidade.
              </span>
            </div>
          </form>
        </div>

        <footer className="login-footer" aria-label="Rodapé institucional">
          <div className="login-footer-line">
            © 2026 <strong>Correspondente Autorizado MaisBB</strong>
          </div>
          <div className="login-footer-line">
            Ambiente restrito • Uso exclusivo de colaboradores • Acesso
            monitorado • LGPD
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .login-wrap {
          min-height: 100vh;
          width: 100%;
          background: #f3f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 24px;
        }
        .login-card {
          width: min(520px, 92vw);
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(10, 42, 106, 0.12);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.1);
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .login-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 12px;
          background: rgba(11, 59, 138, 0.06);
          border: 1px solid rgba(11, 59, 138, 0.14);
          padding: 8px;
        }
        .login-brand-title {
          font-weight: 900;
          font-size: 14px;
          color: #0b1f3a;
          line-height: 1.1;
        }
        .login-brand-sub {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.72;
          margin-top: 3px;
        }
        .login-title {
          margin: 10px 0 6px;
          font-weight: 900;
          font-size: 20px;
          color: #0b1f3a;
        }
        .login-subtitle {
          margin: 0 0 14px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.65);
          line-height: 1.4;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .login-label {
          font-size: 12px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.7);
          margin-top: 6px;
        }
        .login-input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(10, 42, 106, 0.14);
          padding: 12px 14px;
          background: #fff;
          outline: none;
          font-weight: 700;
        }
        .login-input:focus {
          border-color: rgba(11, 59, 138, 0.35);
          box-shadow: 0 0 0 4px rgba(11, 59, 138, 0.08);
        }
        .login-error {
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(210, 30, 30, 0.18);
          background: rgba(210, 30, 30, 0.06);
          color: rgba(140, 0, 0, 0.95);
          font-size: 12px;
          font-weight: 800;
        }
        .login-btn {
          width: 100%;
          margin-top: 10px;
          border-radius: 999px !important;
          padding: 12px 14px !important;
          font-weight: 900 !important;
        }
        .login-links {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .login-link {
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }
        .login-help {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.7;
        }
        .login-footer {
          width: min(560px, 100%);
          text-align: center;
          opacity: 0.75;
          font-size: 12px;
          line-height: 1.35;
          padding-bottom: 8px;
        }
        .login-footer-line {
          padding: 2px 0;
        }
      `}</style>
    </main>
  );
}