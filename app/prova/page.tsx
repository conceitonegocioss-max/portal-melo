"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type User = { nome: string; cpf: string; empresa: string };

type Question = {
  id: string;
  pergunta: string;
  alternativas: { key: "A" | "B" | "C" | "D"; texto: string }[];
  correta: "A" | "B" | "C" | "D";
};

function pushEvent(type: string, payload: any) {
  const raw = localStorage.getItem("portal_events") || "[]";
  const events = JSON.parse(raw);
  events.push({ type, at: new Date().toISOString(), ...payload });
  localStorage.setItem("portal_events", JSON.stringify(events));
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    pergunta:
      "A LGPD tem como objetivo principal:",
    alternativas: [
      { key: "A", texto: "Permitir o compartilhamento livre de dados pessoais" },
      { key: "B", texto: "Proteger dados pessoais e garantir direitos do titular" },
      { key: "C", texto: "Eliminar a necessidade de controles internos" },
      { key: "D", texto: "Substituir contratos por avisos verbais" },
    ],
    correta: "B",
  },
  {
    id: "q2",
    pergunta:
      "Para acessar o portal, o colaborador utiliza:",
    alternativas: [
      { key: "A", texto: "E-mail pessoal" },
      { key: "B", texto: "Usuário aleatório" },
      { key: "C", texto: "CPF (somente números)" },
      { key: "D", texto: "Senha padrão para todos" },
    ],
    correta: "C",
  },
  {
    id: "q3",
    pergunta:
      "O que é uma evidência útil para auditoria neste portal?",
    alternativas: [
      { key: "A", texto: "Registro de login e confirmação de leitura" },
      { key: "B", texto: "Somente prints do WhatsApp" },
      { key: "C", texto: "Somente conversa informal" },
      { key: "D", texto: "Nada precisa ser registrado" },
    ],
    correta: "A",
  },
  {
    id: "q4",
    pergunta:
      "A prova pode ser refeita:",
    alternativas: [
      { key: "A", texto: "Apenas 1 vez" },
      { key: "B", texto: "Somente com autorização da empresa" },
      { key: "C", texto: "Quantas vezes precisar, até atingir a nota mínima" },
      { key: "D", texto: "Nunca" },
    ],
    correta: "C",
  },
  {
    id: "q5",
    pergunta:
      "A prova só deve ser liberada após:",
    alternativas: [
      { key: "A", texto: "Confirmar leitura do treinamento (PDF)" },
      { key: "B", texto: "Pedir no grupo do WhatsApp" },
      { key: "C", texto: "Assistir um vídeo no YouTube" },
      { key: "D", texto: "Nada, pode fazer direto" },
    ],
    correta: "A",
  },
];

export default function ProvaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | "">>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("portal_user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  const leituraOk = useMemo(() => {
    if (!user) return false;
    const raw = localStorage.getItem("portal_readings") || "[]";
    const list = JSON.parse(raw) as { cpf: string; at: string }[];
    return list.some((x) => x.cpf === user.cpf);
  }, [user]);

  const score = useMemo(() => {
    let correct = 0;
    for (const q of QUESTIONS) {
      if (answers[q.id] && answers[q.id] === q.correta) correct++;
    }
    return Math.round((correct / QUESTIONS.length) * 100);
  }, [answers]);

  function marcar(qid: string, key: "A" | "B" | "C" | "D") {
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  }

  function enviar() {
    if (!user) return;

    // valida se respondeu tudo
    for (const q of QUESTIONS) {
      if (!answers[q.id]) {
        alert("Responda todas as questões antes de enviar.");
        return;
      }
    }

    setSubmitted(true);

    const passed = score >= 70;

    pushEvent("PROVA_ENVIADA", {
      cpf: user.cpf,
      empresa: user.empresa,
      nome: user.nome,
      nota: score,
      aprovado: passed ? "SIM" : "NAO",
    });

    if (passed) {
      localStorage.setItem(
        "portal_passed",
        JSON.stringify({ cpf: user.cpf, at: new Date().toISOString(), nota: score })
      );
      pushEvent("PROVA_APROVADA", {
        cpf: user.cpf,
        empresa: user.empresa,
        nome: user.nome,
        nota: score,
      });
    }
  }

  function tentarNovamente() {
    setSubmitted(false);
    setAnswers({});
    if (user) {
      pushEvent("PROVA_NOVA_TENTATIVA", {
        cpf: user.cpf,
        empresa: user.empresa,
        nome: user.nome,
      });
    }
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

  if (!leituraOk) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>Prova bloqueada</h1>
        <p>
          Você precisa <strong>confirmar a leitura</strong> do treinamento antes de fazer a prova.
        </p>
        <p>
          Vá em <Link href="/treinamentos">/treinamentos</Link> e clique em <strong>“Confirmar leitura”</strong>.
        </p>
        <p style={{ marginTop: 16 }}>
          <Link href="/colaborador">Voltar ao painel</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Prova (5 questões)</h1>
      <p>
        Nota mínima: <strong>70%</strong>. Você pode tentar quantas vezes precisar.
      </p>

      <div style={{ marginTop: 18, display: "grid", gap: 16, maxWidth: 900 }}>
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <strong>
                {idx + 1}) {q.pergunta}
              </strong>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {q.alternativas.map((a) => (
                <label
                  key={a.key}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: 8,
                    borderRadius: 10,
                    border: "1px solid #222",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === a.key}
                    onChange={() => marcar(q.id, a.key)}
                  />
                  <span>
                    <strong>{a.key}</strong> — {a.texto}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!submitted ? (
          <button
            onClick={enviar}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #555",
              background: "#0b5",
              color: "black",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Enviar prova
          </button>
        ) : (
          <>
            <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333" }}>
              Sua nota: <strong>{score}%</strong> —{" "}
              <strong>{score >= 70 ? "APROVADO" : "REPROVADO"}</strong>
            </div>

            {score < 70 ? (
              <button
                onClick={tentarNovamente}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #555",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Tentar novamente
              </button>
            ) : (
              <Link href="/colaborador" style={{ padding: "10px 14px" }}>
                Voltar ao painel
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  );
}
