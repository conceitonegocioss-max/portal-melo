"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/src/lib/auth";

type Prova = {
  slug: string;
  titulo: string;
  produto: string;
  publico: string;
};

type Resultado = {
  nota: number;
  aprovado: boolean;
  tentativas: number;
  respondidoEm?: string;
};

const PROVAS: Prova[] = [
  { slug: "atendimento-ao-cliente", titulo: "Prova — Atendimento ao Cliente", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "codigo-de-etica", titulo: "Prova — Código de Ética e Conduta", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "credito-responsavel", titulo: "Prova — Crédito Responsável", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "autorregulacao-consignado", titulo: "Prova — Autorregulação do Consignado", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "fraude", titulo: "Prova — Prevenção à Fraude", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "lgpd", titulo: "Prova — LGPD", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "pldft", titulo: "Prova — PLDFT", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "seguranca-informacao", titulo: "Prova — Segurança da Informação", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "publico-vulneravel", titulo: "Prova — Atendimento Público Vulnerável", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "resumo-contratual", titulo: "Prova — Resumo Contratual", produto: "Todos os Produtos", publico: "Todos" },
  { slug: "produtos-consignado", titulo: "Prova — Produtos Modalidades do Crédito Consignado", produto: "Crédito", publico: "Agentes de Crédito" },
  { slug: "consorcio", titulo: "Prova — Básico de Consórcio", produto: "Consórcio", publico: "Agentes de Crédito" },
  { slug: "ourocap", titulo: "Prova — Ourocap", produto: "Capitalização", publico: "Agentes de Crédito" },
  { slug: "abertura-conta", titulo: "Prova — Abertura de Conta", produto: "Crédito", publico: "Agentes de Crédito" },
  { slug: "seguridade", titulo: "Prova — Seguridade", produto: "Crédito", publico: "Agentes de Crédito" },
  { slug: "portabilidade", titulo: "Prova — Portabilidade de Crédito", produto: "Crédito", publico: "Agentes de Crédito" },
  { slug: "mailing", titulo: "Prova — Tratamento e Uso da Lista de Mailing", produto: "Crédito", publico: "Equipe do Suporte" },
];

function onlyDigits(v: string) {
  return String(v || "").replace(/\D/g, "");
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function lerResultados(cpf: string): Record<string, Resultado> {
  try {
    const raw = localStorage.getItem("portal_exam_results_v1") || "{}";
    const all = JSON.parse(raw);
    return all?.[cpf] || all?.[onlyDigits(cpf)] || {};
  } catch {
    return {};
  }
}

export default function ProvasPage() {
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});

  useEffect(() => {
    const session = getSession();
    const cpf = onlyDigits(session?.cpf || "");
    if (cpf) setResultados(lerResultados(cpf));
  }, []);

  const resumo = useMemo(() => {
    const realizados = PROVAS.filter((p) => resultados[p.slug]).length;
    const aprovados = PROVAS.filter((p) => resultados[p.slug]?.aprovado).length;
    return { total: PROVAS.length, realizados, aprovados, pendentes: PROVAS.length - realizados };
  }, [resultados]);

  return (
    <main className="provasPage">
      <section className="provasWrap">
        <div className="topNav">
          <Link href="/colaborador" className="miniLink">← Área do Colaborador</Link>
          <Link href="/colaborador/treinamentos" className="miniLink">Treinamentos</Link>
        </div>

        <header className="headerBox">
          <div>
            <h1>Provas e Avaliações</h1>
            <div className="bar" />
            <p>Avaliações vinculadas aos treinamentos, utilizadas como critério de conformidade, controle interno e auditoria.</p>
          </div>
          <div className="summaryPill">
            <strong>{resumo.realizados}/{resumo.total}</strong>
            <span>realizadas</span>
          </div>
        </header>

        <div className="summaryGrid">
          <div className="summaryCard"><span>Total</span><strong>{resumo.total}</strong></div>
          <div className="summaryCard"><span>Realizadas</span><strong>{resumo.realizados}</strong></div>
          <div className="summaryCard"><span>Aprovadas</span><strong>{resumo.aprovados}</strong></div>
          <div className="summaryCard"><span>Pendentes</span><strong>{resumo.pendentes}</strong></div>
        </div>

        <div className="provasGrid">
          {PROVAS.map((prova) => {
            const resultado = resultados[prova.slug];
            const realizada = Boolean(resultado);
            const aprovado = Boolean(resultado?.aprovado);
            const bloqueada = realizada && aprovado;

            return (
              <article key={prova.slug} className={`provaCard ${realizada ? "realizada" : ""}`}>
                <div className="cardTop">
                  <h3>📄 {prova.titulo}</h3>
                  {realizada ? (
                    <span className={`statusPill ${aprovado ? "ok" : "bad"}`}>{aprovado ? "APROVADA" : "REPROVADA"}</span>
                  ) : (
                    <span className="statusPill pending">PENDENTE</span>
                  )}
                </div>

                <div className="metaGrid">
                  <span><strong>Produto:</strong> {prova.produto}</span>
                  <span><strong>Público:</strong> {prova.publico}</span>
                  <span><strong>Regra:</strong> 70% mínimo • até 3 tentativas</span>
                </div>

                {realizada ? (
                  <div className="resultadoBox">
                    <div><strong>Nota:</strong> {resultado.nota}%</div>
                    <div><strong>Tentativas:</strong> {resultado.tentativas || 1}</div>
                    {resultado.respondidoEm ? <div><strong>Realizada em:</strong> {formatDate(resultado.respondidoEm)}</div> : null}
                  </div>
                ) : null}

                <div className="actions">
                  <Link className={`mainBtn ${bloqueada ? "done" : ""}`} href={`/colaborador/provas/${prova.slug}`}>
                    {realizada ? (aprovado ? "Ver resultado" : "Tentar novamente") : "Iniciar prova"}
                  </Link>
                  <Link className="outlineBtn" href="/colaborador/treinamentos">Ver treinamentos</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <style jsx global>{`
        .provasPage { min-height: 100%; background:#f3f5f9; color:#0b2a6f; font-family:Arial,sans-serif; }
        .provasWrap { max-width:1180px; margin:0 auto; padding:22px 20px 34px; }
        .topNav { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
        .miniLink { text-decoration:none; border:1px solid #ccd6e6; background:#fff; color:#0b2a6f; border-radius:999px; padding:9px 13px; font-weight:900; font-size:12px; }
        .headerBox { display:flex; justify-content:space-between; align-items:flex-end; gap:18px; background:#fff; border:1px solid #dbe3f0; border-radius:20px; padding:20px 22px; box-shadow:0 8px 24px rgba(15,35,95,.05); }
        .headerBox h1 { margin:0; font-size:38px; line-height:1.05; font-weight:950; color:#0b2a6f; letter-spacing:-.02em; }
        .headerBox .bar { margin-top:12px; width:54px; height:5px; border-radius:999px; background:#f4c400; }
        .headerBox p { margin:14px 0 0; max-width:820px; font-size:15px; line-height:1.45; font-weight:750; color:#17326e; }
        .summaryPill { min-width:122px; border:1px solid #acdcbc; background:#ebf8ef; color:#1b9a57; border-radius:18px; padding:12px 16px; text-align:center; font-weight:900; }
        .summaryPill strong { display:block; font-size:22px; }
        .summaryPill span { display:block; font-size:12px; margin-top:2px; }
        .summaryGrid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:12px; }
        .summaryCard { background:#fff; border:1px solid #dbe3f0; border-radius:16px; padding:10px 12px; box-shadow:0 8px 20px rgba(15,35,95,.04); }
        .summaryCard span { display:block; font-size:11px; font-weight:900; color:#5b6980; }
        .summaryCard strong { display:block; margin-top:2px; font-size:21px; color:#0b2a6f; }
        .provasGrid { margin-top:14px; display:grid; grid-template-columns:repeat(auto-fit,minmax(330px,1fr)); gap:12px; }
        .provaCard { background:#fff; border:1px solid #e1e7f0; border-radius:18px; padding:16px; box-shadow:0 8px 20px rgba(15,35,95,.04); display:flex; flex-direction:column; gap:12px; }
        .provaCard.realizada { border-color:rgba(27,154,87,.28); }
        .cardTop { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .cardTop h3 { margin:0; font-size:16px; line-height:1.3; color:#0b2a6f; font-weight:950; }
        .statusPill { flex:0 0 auto; border-radius:999px; padding:6px 9px; font-size:10px; font-weight:950; border:1px solid transparent; }
        .statusPill.ok { color:#14884d; background:#ebf8ef; border-color:#acdcbc; }
        .statusPill.bad { color:#a22b2b; background:#fff4f4; border-color:#f1c8c8; }
        .statusPill.pending { color:#6f5b00; background:#fff8d6; border-color:#f0dc80; }
        .metaGrid { display:grid; gap:4px; color:#17326e; font-size:13px; font-weight:750; }
        .resultadoBox { display:grid; gap:3px; background:#f7f9ff; border:1px solid #dbe3f0; border-radius:14px; padding:10px 12px; color:#17326e; font-size:12px; font-weight:750; }
        .actions { margin-top:auto; display:grid; gap:8px; }
        .mainBtn, .outlineBtn { text-decoration:none; min-height:42px; border-radius:999px; display:flex; align-items:center; justify-content:center; font-weight:950; font-size:13px; }
        .mainBtn { background:#f4c400; color:#0b2a6f; border:1px solid #e0b900; }
        .mainBtn.done { background:#ebf8ef; border-color:#acdcbc; color:#14884d; }
        .outlineBtn { background:#fff; color:#0b2a6f; border:1px solid #ccd6e6; }
        @media (max-width:760px) {
          .provasWrap { padding:16px 14px 28px; }
          .headerBox { align-items:flex-start; flex-direction:column; padding:18px; }
          .headerBox h1 { font-size:30px; }
          .summaryGrid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .provasGrid { grid-template-columns:1fr; }
        }
      `}</style>
    </main>
  );
}
