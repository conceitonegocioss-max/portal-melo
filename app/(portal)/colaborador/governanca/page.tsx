"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/src/lib/auth";

type Indicador = {
  titulo: string;
  valor: number | string;
  icone: string;
  descricao: string;
};

const TOTAL_TREINAMENTOS = 16;
const TOTAL_POLITICAS = 10;
const TOTAL_PROCEDIMENTOS = 6;
const TOTAL_SGQ = 4;
const TOTAL_DOCUMENTOS_INSTITUCIONAIS = 1;
const TOTAL_TERMOS_OBRIGATORIOS = 1;
const PROXIMA_REVISAO = "02/2027";

function formatarPerfil(perfil: string) {
  return perfil || "COLABORADOR";
}

export default function GovernancaPage() {
  const [nome, setNome] = useState("");
  const [perfil, setPerfil] = useState("");

  useEffect(() => {
    const session: any = getSession();
    if (!session) return;
    setNome(session.nome || "");
    setPerfil(session.perfil || "");
  }, []);

  const totalDocumentos = TOTAL_POLITICAS + TOTAL_PROCEDIMENTOS + TOTAL_SGQ + TOTAL_DOCUMENTOS_INSTITUCIONAIS + TOTAL_TERMOS_OBRIGATORIOS;

  const indicadores: Indicador[] = useMemo(
    () => [
      {
        titulo: "Treinamentos obrigatórios",
        valor: TOTAL_TREINAMENTOS,
        icone: "🎓",
        descricao: "Conteúdos obrigatórios disponíveis para os colaboradores.",
      },
      {
        titulo: "Políticas institucionais",
        valor: TOTAL_POLITICAS,
        icone: "📘",
        descricao: "Diretrizes internas de governança, segurança, privacidade e riscos.",
      },
      {
        titulo: "Procedimentos internos",
        valor: TOTAL_PROCEDIMENTOS,
        icone: "🧩",
        descricao: "Procedimentos operacionais e controles formais documentados.",
      },
      {
        titulo: "Documentos SGQ",
        valor: TOTAL_SGQ,
        icone: "🗂️",
        descricao: "Materiais vinculados ao Sistema de Gestão da Qualidade.",
      },
      {
        titulo: "Termos obrigatórios",
        valor: TOTAL_TERMOS_OBRIGATORIOS,
        icone: "🔐",
        descricao: "Documentos que exigem ciência individual do colaborador.",
      },
      {
        titulo: "Próxima revisão",
        valor: PROXIMA_REVISAO,
        icone: "📅",
        descricao: "Referência de revisão documental do ciclo atual.",
      },
    ],
    []
  );

  return (
    <main className="section gray">
      <div className="container govPage">
        <div style={{ marginBottom: 12 }}>
          <Link href="/colaborador" className="btn btn-outline small">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <div className="section-title">
          <h2>Central de Governança</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 920 }}>
          Painel institucional do Portal do Colaborador com resumo dos treinamentos, documentos, políticas, procedimentos e termos obrigatórios disponíveis para consulta e apoio às atividades.
        </p>

        <div className="govTop">
          <div className="govUserCard">
            <div className="govMini">Sessão atual</div>
            <div className="govUserName">{nome || "Usuário"}</div>
            <div className="govUserSub">Perfil: <strong>{formatarPerfil(perfil)}</strong></div>
          </div>

          <div className="govUserCard govSoft">
            <div className="govMini">Escopo do portal</div>
            <div className="govUserName">Governança documental</div>
            <div className="govUserSub">Treinamentos, materiais, políticas, scripts e termos obrigatórios.</div>
          </div>
        </div>

        <div className="govGrid">
          {indicadores.map((item) => (
            <div className="govCard" key={item.titulo}>
              <div className="govIcon">{item.icone}</div>
              <div className="govValue">{item.valor}</div>
              <div className="govTitle">{item.titulo}</div>
              <div className="govDesc">{item.descricao}</div>
            </div>
          ))}
        </div>

        <div className="govBox">
          <h3>Status geral de conformidade</h3>

          <div className="govLine">
            <span>Total de documentos controlados no portal</span>
            <strong>{totalDocumentos}</strong>
          </div>
          <div className="govLine">
            <span>Biblioteca documental disponível em Materiais & Políticas</span>
            <strong>Ativa</strong>
          </div>
          <div className="govLine">
            <span>Termo de Confidencialidade com ciência individual</span>
            <strong>Ativo</strong>
          </div>
          <div className="govLine">
            <span>Treinamentos obrigatórios disponíveis</span>
            <strong>Ativos</strong>
          </div>
          <div className="govLine">
            <span>Próxima revisão documental prevista</span>
            <strong>{PROXIMA_REVISAO}</strong>
          </div>
        </div>

        <div className="govBox">
          <h3>Mapa do Portal do Colaborador</h3>

          <div className="govMap">
            <Link className="govNode" href="/colaborador/treinamentos">
              <span>🎓</span>
              <strong>Treinamentos</strong>
              <small>Conteúdos obrigatórios</small>
            </Link>
            <Link className="govNode" href="/colaborador/provas">
              <span>📝</span>
              <strong>Provas</strong>
              <small>Avaliações vinculadas</small>
            </Link>
            <Link className="govNode" href="/colaborador/materiais">
              <span>📄</span>
              <strong>Materiais & Políticas</strong>
              <small>Biblioteca documental</small>
            </Link>
            <Link className="govNode" href="/colaborador/termo-de-confidencialidade">
              <span>🔐</span>
              <strong>Termo</strong>
              <small>Ciência individual</small>
            </Link>
            <Link className="govNode" href="/colaborador/auditoria/scripts">
              <span>🧾</span>
              <strong>Scripts</strong>
              <small>Roteiros operacionais</small>
            </Link>
          </div>
        </div>

        <style jsx global>{`
          .govPage { max-width: 1180px; }
          .govTop { margin-top: 16px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }
          .govUserCard { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:18px; padding:16px; box-shadow:0 10px 24px rgba(15,23,42,.05); }
          .govSoft { background:linear-gradient(180deg,#fff,#f7f9ff); }
          .govMini { font-size:11px; font-weight:900; opacity:.62; text-transform:uppercase; }
          .govUserName { margin-top:5px; font-size:18px; font-weight:900; color:#0a2a6a; }
          .govUserSub { margin-top:5px; font-size:12px; font-weight:700; opacity:.75; }
          .govGrid { margin-top:16px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
          .govCard { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:18px; padding:18px; box-shadow:0 10px 24px rgba(15,23,42,.05); }
          .govIcon { font-size:24px; }
          .govValue { margin-top:8px; font-size:30px; line-height:1; font-weight:900; color:#0a2a6a; }
          .govTitle { margin-top:8px; font-size:14px; font-weight:900; color:#0b1f3a; }
          .govDesc { margin-top:6px; font-size:12px; line-height:1.45; font-weight:700; opacity:.68; }
          .govBox { margin-top:18px; background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:18px; padding:18px; box-shadow:0 10px 24px rgba(15,23,42,.05); }
          .govBox h3 { margin:0 0 12px; color:#0a2a6a; font-size:18px; }
          .govLine { display:flex; justify-content:space-between; gap:12px; padding:11px 0; border-bottom:1px dashed rgba(10,42,106,.12); font-size:13px; font-weight:700; }
          .govLine:last-child { border-bottom:0; }
          .govLine strong { color:#0a2a6a; white-space:nowrap; }
          .govMap { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
          .govNode { text-decoration:none; color:inherit; background:#f8faff; border:1px solid rgba(10,42,106,.1); border-radius:16px; padding:14px; display:grid; gap:5px; transition:.15s ease; }
          .govNode:hover { transform:translateY(-1px); border-color:rgba(10,42,106,.25); box-shadow:0 8px 18px rgba(15,23,42,.06); }
          .govNode span { font-size:22px; }
          .govNode strong { color:#0a2a6a; font-size:13px; }
          .govNode small { opacity:.68; font-weight:700; }
          @media (max-width: 900px) { .govTop,.govGrid,.govMap{grid-template-columns:1fr;} }
        `}</style>
      </div>
    </main>
  );
}
