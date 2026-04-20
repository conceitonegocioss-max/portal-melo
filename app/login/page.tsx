"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function isValidCPF(cpf: string) {
  // validação simples (tamanho). Podemos colocar validação completa depois.
  return onlyDigits(cpf).length === 11;
}

export default function LoginPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("MELO NEGOCIOS");
  const [erro, setErro] = useState("");

  const cpfDigits = useMemo(() => onlyDigits(cpf), [cpf]);

  function entrar() {
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (!isValidCPF(cpfDigits)) {
      setErro("CPF inválido. Digite 11 números.");
      return;
    }

    const user = {
      cpf: cpfDigits,
      nome: nome.trim(),
      empresa,
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem("portal_user", JSON.stringify(user));

    // registra presença de login
    const events = JSON.parse(localStorage.getItem("portal_events") || "[]");
    events.push({
      type: "LOGIN",
      cpf: cpfDigits,
      empresa,
      at: new Date().toISOString(),
    });
    localStorage.setItem("portal_events", JSON.stringify(events));

    router.push("/colaborador");
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Área do Colaborador</h1>
      <p>Faça login com CPF para acessar treinamentos e provas.</p>

      <div style={{ marginTop: 20, maxWidth: 420, display: "grid", gap: 10 }}>
        <label>
          <div>Nome</div>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: João da Silva"
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
        </label>

        <label>
          <div>CPF (somente números)</div>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="00000000000"
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Digitado: {cpfDigits}
          </div>
        </label>

        <label>
          <div>Empresa</div>
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          >
            <option>MELO NEGOCIOS</option>
            <option>CONCEITO NEGOCIOS</option>
            <option>MC NEGOCIOS</option>
            <option>GERA AÇÃO NEGOCIOS</option>
          </select>
        </label>

        {erro ? (
          <div style={{ color: "tomato", marginTop: 6 }}>{erro}</div>
        ) : null}

        <button
          onClick={entrar}
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#0a58ca",
            color: "white",
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </div>
    </main>
  );
}
