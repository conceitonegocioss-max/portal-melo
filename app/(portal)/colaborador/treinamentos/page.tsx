"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";

type Treinamento = {
  id: string;
  titulo: string;
  descricao: string;
  pasta: string;
  categoria: string;
  publico: string;
  capa?: string;
  provaHref?: string;
};

type ProgressoItem = {
  status: "Pendente" | "Concluído";
  dataISO: string;
};

type ProgressoPorTreino = Record<string, ProgressoItem>;

const CAPA_PADRAO = "/treinamentos/capas/institucional.jpg";

const METADATA_PADRAO = {
  responsavel: "Área de Qualidade e Compliance",
  versao: "2.0",
  proximaRevisao: "02/2027",
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function keyByCpf(cpf: string) {
  return `portal_treinamentos_progress_v1_${cpf}`;
}

const TREINAMENTOS: Treinamento[] = [
  { id: "abertura-de-contas", titulo: "Abertura de Contas", descricao: "Procedimentos e orientações para abertura de contas.", pasta: "abertura-de-contas", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "atendimento-ao-cliente", titulo: "Atendimento ao Cliente", descricao: "Boas práticas de atendimento e postura profissional.", pasta: "atendimento-ao-cliente", categoria: "Atendimento", publico: "Todos", capa: CAPA_PADRAO },
  { id: "basico-consorcio", titulo: "Básico de Consórcio", descricao: "Conceitos essenciais e funcionamento do consórcio.", pasta: "basico-consorcio", categoria: "Consórcio", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "codigo-de-etica-e-conduta", titulo: "Código de Ética e Conduta", descricao: "Conduta profissional, integridade e boas práticas.", pasta: "codigo-de-etica-e-conduta", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "credito-responsavel", titulo: "Crédito Responsável", descricao: "Práticas para concessão responsável e orientações ao cliente.", pasta: "credito-responsavel", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "lgpd", titulo: "LGPD", descricao: "Lei Geral de Proteção de Dados e boas práticas.", pasta: "lgpd", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "lista-de-mailing", titulo: "Lista de Mailing", descricao: "Boas práticas no uso de listas e abordagem a clientes.", pasta: "lista-de-mailing", categoria: "Atendimento", publico: "Todos", capa: CAPA_PADRAO },
  { id: "ourocapp", titulo: "Ourocap", descricao: "Produto Ourocap: conceitos e orientações comerciais.", pasta: "ourocapp", categoria: "Produtos", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "pld-ft", titulo: "PLD-FT", descricao: "Prevenção à lavagem de dinheiro e financiamento ao terrorismo.", pasta: "pld-ft", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "prevencao-a-fraude", titulo: "Prevenção à Fraude", descricao: "Identificação de riscos e boas práticas antifraude.", pasta: "prevencao-a-fraude", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "produtos-modalidades-credito", titulo: "Produtos e Modalidades de Crédito", descricao: "Visão geral de produtos e modalidades de crédito.", pasta: "produtos-modalidades-credito", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "publico-vulneravel", titulo: "Público Vulnerável", descricao: "Boas práticas de atendimento e cuidados com público vulnerável.", pasta: "publico-vulneravel", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "resolucao-autorregulacao", titulo: "Resolução e Autorregulação", descricao: "Regras, diretrizes e condutas esperadas.", pasta: "resolucao-autorregulacao", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "resumo-contratual", titulo: "Resumo Contratual", descricao: "Pontos essenciais de contratos e orientações.", pasta: "resumo-contratual", categoria: "Institucional", publico: "Todos", capa: CAPA_PADRAO },
  { id: "seguranca-da-informacao", titulo: "Segurança da Informação", descricao: "Boas práticas e condutas de segurança.", pasta: "seguranca-da-informacao", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "seguridade", titulo: "Seguridade", descricao: "Produtos e orientações gerais de seguridade.", pasta: "seguridade", categoria: "Produtos", publico: "Agente de Crédito", capa: CAPA_PADRAO },
];

export default function TreinamentosPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sessionCpf, setSessionCpf] = useState("");
  const [sessionNome, setSessionNome] = useState("");
  const [sessionPerfil, setSessionPerfil] = useState("");
  const [sessionEmpresa, setSessionEmpresa] = useState("");

  const [progresso, setProgresso] = useState<ProgressoPorTreino>({});

  const totalTreinos = TREINAMENTOS.length;

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    const cpf = onlyDigits(session.cpf || "");
    setSessionCpf(cpf);
    setSessionNome(session.nome || "");
    setSessionPerfil(session.perfil || "");
    setSessionEmpresa(session.empresa || "");

    const raw = localStorage.getItem(keyByCpf(cpf));
    if (raw) {
      try {
        setProgresso(JSON.parse(raw));
      } catch {
        setProgresso({});
      }
    }
  }, [router]);

  const concluidos = useMemo(() => {
    return Object.values(progresso || {}).filter((x) => x?.status === "Concluído").length;
  }, [progresso]);

  const pct = useMemo(() => {
    return totalTreinos > 0 ? Math.round((concluidos / totalTreinos) * 100) : 0;
  }, [concluidos, totalTreinos]);

  function salvarProgresso(novo: ProgressoPorTreino) {
    setProgresso(novo);
    if (sessionCpf) localStorage.setItem(keyByCpf(sessionCpf), JSON.stringify(novo));
  }

  function limparProgressoLocal() {
    if (!sessionCpf) return;
    localStorage.removeItem(keyByCpf(sessionCpf));
    setProgresso({});
    alert("✅ Progresso limpo neste navegador (para este CPF).");
  }

  function statusDoTreino(id: string): "Pendente" | "Concluído" {
    return progresso?.[id]?.status ?? "Pendente";
  }

  async function registrarEventoCentral(payload: any) {
    try {
      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // não bloqueia o uso
    }
  }

  async function marcarConcluido(t: Treinamento) {
    if (statusDoTreino(t.id) === "Concluído") return;

    const dataISO = new Date().toISOString();

    const novo: ProgressoPorTreino = {
      ...(progresso || {}),
      [t.id]: { status: "Concluído", dataISO },
    };

    salvarProgresso(novo);

    await registrarEventoCentral({
      type: "TREINAMENTO_CONCLUIDO",
      module: "treinamentos",
      entityId: t.id,
      entityTitle: t.titulo,
      actorCpf: sessionCpf,
      actorNome: sessionNome,
      actorPerfil: sessionPerfil,
      actorEmpresa: sessionEmpresa,
      atISO: dataISO,
      obs: "Marcou como concluído",
      meta: {
        pasta: t.pasta,
        categoria: t.categoria,
        publico: t.publico,
        versao: METADATA_PADRAO.versao,
        proximaRevisao: METADATA_PADRAO.proximaRevisao,
        responsavel: METADATA_PADRAO.responsavel,
      },
    });

    alert(`✅ "${t.titulo}" marcado como concluído.`);
  }

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        <div style={{ marginBottom: 12 }}>
          <Link href="/colaborador" className="btn btn-outline small">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <div className="section-title">
          <h2>Treinamentos Obrigatórios</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 900 }}>
          Acesse os materiais e marque como concluído ao finalizar.
        </p>

        <div className="trProgress">
          <div className="trProgressTop">
            <div>
              <strong>Progresso:</strong> {concluidos} / {totalTreinos} ({pct}%)
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="trHint">O progresso fica salvo por CPF neste navegador.</div>

              <button type="button" className="miniBtn" onClick={limparProgressoLocal}>
                Limpar progresso deste navegador
              </button>
            </div>
          </div>

          <div className="trBar" aria-label="Barra de progresso">
            <div className="trFill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="treinos-grid">
            {TREINAMENTOS.map((t) => {
              const status = statusDoTreino(t.id);
              const isConcluido = status === "Concluído";
              const hrefTreino = `/treinamentos/${t.pasta}/material.pdf`;
              const hrefProva = t.provaHref || `/colaborador/provas?treinamento=${encodeURIComponent(t.id)}`;

              return (
                <div className="treino-card" key={t.id}>
                  <div className="treino-cover">
                    <img src={t.capa || CAPA_PADRAO} alt="" />
                  </div>

                  <div className="treino-body">
                    <div className="treino-tags">
                      <span className="treino-tag">{t.categoria}</span>
                      <span className="treino-tag">{t.publico}</span>
                      <span className="treino-tag">{status}</span>
                    </div>

                    <h3 className="treino-title">{t.titulo}</h3>

                    <div className="treino-meta">
                      <div>
                        <strong>Responsável:</strong> {METADATA_PADRAO.responsavel}
                      </div>
                      <div>
                        <strong>Versão:</strong> {METADATA_PADRAO.versao}
                      </div>
                      <div>
                        <strong>Próxima revisão:</strong> {METADATA_PADRAO.proximaRevisao}
                      </div>
                    </div>

                    <p className="treino-desc">{t.descricao}</p>

                    <div className="treino-actions">
                      <a className="btn btn-yellow" style={{ width: "100%", textAlign: "center" }} href={hrefTreino} target="_blank" rel="noreferrer">
                        Abrir treinamento
                      </a>

                      <a
                        className="btn btn-ghost"
                        style={{
                          width: "100%",
                          textAlign: "center",
                          border: "1px dashed rgba(10,42,106,.25)",
                          background: "#f3f6fc",
                          color: "#5b6f95",
                        }}
                        href={hrefProva}
                      >
                        Fazer prova
                      </a>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={isConcluido}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          border: "1px dashed rgba(10,42,106,.25)",
                          background: isConcluido ? "#eaf7ef" : "#f6f9ff",
                          color: isConcluido ? "#1b7a3a" : "#0a2a6a",
                          opacity: isConcluido ? 0.7 : 1,
                          cursor: isConcluido ? "not-allowed" : "pointer",
                        }}
                        onClick={() => marcarConcluido(t)}
                      >
                        {isConcluido ? "✅ Concluído" : "Marcar como concluído"}
                      </button>

                      <div className="treino-status">
                        Status: <strong>{status}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx global>{`
          .trProgress {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.08);
            border-radius: 14px;
            padding: 12px;
            margin-top: 10px;
          }
          .trProgressTop {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 10px;
          }
          .trHint {
            font-size: 12px;
            opacity: 0.7;
          }
          .trBar {
            width: 100%;
            height: 10px;
            border-radius: 999px;
            overflow: hidden;
            background: #e9edf5;
          }
          .trFill {
            height: 10px;
            background: #0b3b8a;
            border-radius: 999px;
          }

          .miniBtn {
            border: 1px solid rgba(10, 42, 106, 0.14);
            background: rgba(255, 255, 255, 0.9);
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            color: #0a2a6a;
            cursor: pointer;
            white-space: nowrap;
          }
          .miniBtn:hover {
            background: rgba(10, 42, 106, 0.06);
            border-color: rgba(10, 42, 106, 0.2);
          }

          .treinos-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }
          @media (max-width: 1100px) {
            .treinos-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 760px) {
            .treinos-grid {
              grid-template-columns: 1fr;
            }
          }

          .treino-meta {
            font-size: 12px;
            opacity: 0.9;
            margin: 8px 0 10px;
            padding: 8px 10px;
            border-radius: 10px;
            background: #f4f6fb;
            border: 1px solid rgba(0, 0, 0, 0.06);
          }
          .treino-meta div {
            margin-bottom: 2px;
          }
        `}</style>
      </div>
    </main>
  );
}
