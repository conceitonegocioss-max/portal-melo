"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  nome: string;
  cpf: string;
  empresa: string;
};

function pushEvent(type: string, payload: any) {
  const raw = localStorage.getItem("portal_events") || "[]";
  const events = JSON.parse(raw);
  events.push({ type, at: new Date().toISOString(), ...payload });
  localStorage.setItem("portal_events", JSON.stringify(events));
}

export default function TreinamentosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("portal_user");
    const parsed = u ? JSON.parse(u) : null;
    setUser(parsed);

    if (parsed) {
      const raw = localStorage.getItem("portal_readings") || "[]";
      const list = JSON.parse(raw) as { cpf: string }[];
      if (list.some((x) => x.cpf === parsed.cpf)) {
        setConfirmado(true);
      }
    }
  }, []);

  function confirmarLeitura() {
    if (!user) return;

    const raw = localStorage.getItem("portal_readings") || "[]";
    const list = JSON.parse(raw);

    // evita duplicar
    if (!list.some((x: any) => x.cpf === user.cpf)) {
      list.push({
        cpf: user.cpf,
        nome: user.nome,
        empresa: user.empresa,
        at: new Date().toISOString(),
      });
      localStorage.setItem("portal_readings", JSON.stringify(list));
    }

    pushEvent("LEITURA_CONFIRMADA", {
      cpf: user.cpf,
      nome: user.nome,
      empresa: user.empresa,
    });

    setConfirmado(true);
    alert("Leitura confirmada com sucesso.");
  }

  if (!user) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>Você não está logado</h1>
        <p>
          Vá para <Link href="/login">/login</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Treinamento Institucional</h1>

      <p>
        Leia atentamente o material abaixo. Após a leitura completa, clique em
        <strong> “Confirmar leitura”</strong>.
      </p>

      {/* PDF */}
      <div style={{ marginTop: 20 }}>
        <iframe
          src="/treinamento-lgpd.pdf"
          width="100%"
          height="600"
          style={{ border: "1px solid #333", borderRadius: 12 }}
        />
      </div>

      {/* Ações */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        {!confirmado ? (
          <button
            onClick={confirmarLeitura}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#0b5",
              color: "black",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Confirmar leitura
          </button>
        ) : (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #333",
            }}
          >
            ✅ Leitura confirmada
          </div>
        )}

        <Link
          href="/colaborador"
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #555",
            color: "white",
            textDecoration: "none",
          }}
        >
          Voltar ao painel
        </Link>

        {confirmado && (
          <Link
            href="/prova"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#1b4dff",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Ir para a prova
          </Link>
        )}
      </div>
    </main>
  );
}

