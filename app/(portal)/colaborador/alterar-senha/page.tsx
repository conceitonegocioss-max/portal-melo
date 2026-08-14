"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession, setSession } from "@/src/lib/auth";

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    setCpf(session.cpf);
    setNome(session.nome || "");
    setReady(true);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErro(null);
    setSucesso(null);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos para alterar a senha.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não conferem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          cpf,
          senhaAtual,
          novaSenha,
          confirmarSenha,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok || !data?.user) {
        throw new Error(data?.message || "Não foi possível alterar a senha.");
      }

      setSession({ ...data.user, mustChangePassword: false });
      setSucesso("Senha cadastrada com sucesso. Redirecionando para o portal...");

      setTimeout(() => {
        router.replace("/colaborador");
      }, 900);
    } catch (error: any) {
      setErro(error?.message || "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  }

  function sair() {
    clearSession();
    router.replace("/colaborador/login");
  }

  if (!ready) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-wrap">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <img src="/logo.png" alt="Logo" className="login-logo" />
            <div className="login-brand-text">
              <div className="login-brand-title">Alteração obrigatória de senha</div>
              <div className="login-brand-sub">Portal do Colaborador</div>
            </div>
          </div>

          <h1 className="login-title">Cadastre sua senha pessoal</h1>
          <p className="login-subtitle">
            Olá{nome ? `, ${nome}` : ""}. Para continuar usando o portal, substitua a senha inicial/provisória por uma senha pessoal.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-label">CPF</label>
            <input className="login-input" value={cpf} disabled />

            <label className="login-label">Senha atual</label>
            <input
              className="login-input"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Senha inicial ou senha atual"
              type="password"
              autoComplete="current-password"
            />

            <label className="login-label">Nova senha</label>
            <input
              className="login-input"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              type="password"
              autoComplete="new-password"
            />

            <label className="login-label">Confirmar nova senha</label>
            <input
              className="login-input"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a nova senha novamente"
              type="password"
              autoComplete="new-password"
            />

            <div className="login-notice">
              🔐 A senha em texto não será armazenada. O registro da alteração ficará salvo para fins de segurança e auditoria.
            </div>

            {erro && <div className="login-error">⚠️ {erro}</div>}
            {sucesso && <div className="login-success">✅ {sucesso}</div>}

            <button className="btn btn-yellow login-btn" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar nova senha"}
            </button>

            <button type="button" className="login-secondary" onClick={sair}>
              Sair e voltar ao login
            </button>
          </form>
        </div>
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
          width: min(540px, 92vw);
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
        .login-input:disabled {
          background: #f3f5f9;
          opacity: 0.8;
        }
        .login-input:focus {
          border-color: rgba(11, 59, 138, 0.35);
          box-shadow: 0 0 0 4px rgba(11, 59, 138, 0.08);
        }
        .login-error,
        .login-success,
        .login-notice {
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }
        .login-error {
          border: 1px solid rgba(210, 30, 30, 0.18);
          background: rgba(210, 30, 30, 0.06);
          color: rgba(140, 0, 0, 0.95);
        }
        .login-success {
          border: 1px solid rgba(27, 122, 58, 0.18);
          background: #eaf7ef;
          color: #0f5132;
        }
        .login-notice {
          background: #f7f9ff;
          border: 1px solid rgba(10, 42, 106, 0.1);
          color: rgba(0, 0, 0, 0.7);
        }
        .login-btn {
          width: 100%;
          margin-top: 10px;
          border-radius: 999px !important;
          padding: 12px 14px !important;
          font-weight: 900 !important;
        }
        .login-secondary {
          width: 100%;
          margin-top: 8px;
          border-radius: 999px;
          padding: 11px 14px;
          border: 1px solid rgba(10, 42, 106, 0.14);
          background: #fff;
          font-weight: 900;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
