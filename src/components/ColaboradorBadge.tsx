"use client";

import { useEffect, useState } from "react";
import { clearSession, getSession } from "../lib/auth";

type Perfil = "ADMIN" | "COLABORADOR" | "";

export default function ColaboradorBadge() {
  const [nome, setNome] = useState<string>("");
  const [perfil, setPerfil] = useState<Perfil>("");

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setNome(session.nome || "");
    setPerfil((session.perfil || "") as Perfil);
  }, []);

  async function registrarLogout() {
    try {
      const session = getSession();

      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LOGOUT",
          module: "auth",
          entityId: session?.cpf ? String(session.cpf) : "",
          entityTitle: session?.nome ? String(session.nome) : "",
          actorCpf: session?.cpf ? String(session.cpf) : "",
          actorNome: session?.nome ? String(session.nome) : "",
          actorPerfil: session?.perfil ? String(session.perfil) : "",
          actorEmpresa: session?.empresa ? String(session.empresa) : "",
          obs: "Logout realizado",
          atISO: new Date().toISOString(),
        }),
      });
    } catch {
      // não bloqueia logout
    }
  }

  if (!nome) return null;

  return (
    <header className="colaboradorHeader" role="banner">
      <div className="colaboradorHeaderInner">
        <div className="colaboradorInfo">
          <span className="colaboradorNome">
            <span className="colaboradorLabel">Sessão:</span>
            <span className="colaboradorNomeText">{nome}</span>
          </span>

          {perfil === "ADMIN" && <span className="perfilAdminBadge">ADMIN</span>}
        </div>

        <button
          className="btnLogout"
          type="button"
          onClick={async () => {
            await registrarLogout();
            clearSession();
            window.location.href = "/colaborador/login";
          }}
          aria-label="Sair do Portal do Colaborador"
          title="Sair"
        >
          Sair
        </button>
      </div>

      <style jsx>{`
        .colaboradorHeader {
          width: 100%;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
        }

        .colaboradorHeaderInner {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .colaboradorInfo {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: nowrap;
          min-width: 0;
          max-width: calc(100% - 90px);
        }

        .colaboradorNome {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          font-weight: 800;
          font-size: 14px;
          color: #111;
          white-space: nowrap;
        }

        .colaboradorNomeText {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 68vw;
        }

        .colaboradorLabel {
          font-weight: 900;
          opacity: 0.65;
        }

        .perfilAdminBadge {
          flex: 0 0 auto;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 900;
          border-radius: 999px;
          background: rgba(30, 64, 175, 0.08);
          color: #1e40af;
          border: 1px solid rgba(30, 64, 175, 0.2);
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .btnLogout {
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          border: 1px solid rgba(10, 42, 106, 0.18);
          background: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          color: rgba(0, 0, 0, 0.75);
          flex: 0 0 auto;
        }

        .btnLogout:hover {
          background: rgba(10, 42, 106, 0.06);
          border-color: rgba(10, 42, 106, 0.25);
        }

        @media (max-width: 760px) {
          .colaboradorHeaderInner {
            width: min(1180px, calc(100% - 28px));
          }

          .colaboradorNome {
            font-size: 13px;
          }

          .colaboradorNomeText {
            max-width: 52vw;
          }
        }
      `}</style>
    </header>
  );
}