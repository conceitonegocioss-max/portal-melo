"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DocTipo = "politica" | "procedimento" | "sgq" | "institucional";
type DocStatus = "vigente" | "atualizar";

type Documento = {
  id: string;
  titulo: string;
  tipo: DocTipo;
  status: DocStatus;
  arquivoPdf: string;
  descricao: string;
  responsavel: string;
  revisao: string;
};

const TAGS: Record<DocTipo, { label: string; badgeClass: string; icon: string }> = {
  politica: { label: "Política", badgeClass: "badge badge-blue", icon: "📘" },
  procedimento: { label: "Procedimento", badgeClass: "badge badge-green", icon: "🧩" },
  sgq: { label: "SGQ", badgeClass: "badge badge-purple", icon: "🗂️" },
  institucional: { label: "Institucional", badgeClass: "badge badge-gray", icon: "🏛️" },
};

const STATUS: Record<DocStatus, { label: string; badgeClass: string }> = {
  vigente: { label: "Vigente", badgeClass: "badge badge-ok" },
  atualizar: { label: "Revisar", badgeClass: "badge badge-warn" },
};

const DOCUMENTOS: Documento[] = [
  { id: "politica-atendimento", titulo: "Política de Atendimento ao Cliente", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-atendimento-ao-cliente.pdf", descricao: "Diretrizes de atendimento, postura e relacionamento com clientes.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "politica-prevencao-fraude", titulo: "Política de Prevenção à Fraude", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-prevencao-fraude.pdf", descricao: "Diretrizes de prevenção, detecção e resposta a fraudes.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "politica-privacidade", titulo: "Política de Privacidade de Dados (LGPD)", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-privacidade-dados.pdf", descricao: "Regras de privacidade, tratamento e proteção de dados pessoais.", responsavel: "DPO / Compliance", revisao: "02/2027" },
  { id: "politica-seguranca-firewall", titulo: "Política de Segurança da Informação e Uso de Firewall", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-seguranca-informacao-firewall.pdf", descricao: "Controles e boas práticas de segurança da informação e uso de infraestrutura.", responsavel: "TI / Compliance", revisao: "02/2027" },
  { id: "politica-concessao-acessos", titulo: "Política de Concessão de Acesso aos Sistemas e Aplicativos Internos", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-concessao-acesso-sistemas-aplicativos-internos.pdf", descricao: "Regras para concessão, manutenção e revogação de acessos internos.", responsavel: "Qualidade / TI", revisao: "02/2027" },
  { id: "politica-governanca", titulo: "Política de Governança", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-governanca.pdf", descricao: "Princípios, responsabilidades e diretrizes de governança corporativa.", responsavel: "Diretoria / Compliance", revisao: "02/2027" },
  { id: "politica-portabilidade-credito", titulo: "Política de Portabilidade de Crédito", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-portabilidade-credito.pdf", descricao: "Normas e controles aplicáveis ao processo de portabilidade de crédito.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "politica-rh", titulo: "Política de Recursos Humanos", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-recursos-humanos.pdf", descricao: "Diretrizes institucionais relacionadas à gestão de pessoas e conduta interna.", responsavel: "RH", revisao: "02/2027" },
  { id: "politica-incidentes", titulo: "Política de Gestão de Incidentes", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-gestao-incidentes.pdf", descricao: "Fluxos e responsabilidades para identificação, tratamento e comunicação de incidentes.", responsavel: "TI / Compliance", revisao: "02/2027" },
  { id: "politica-vulnerabilidades", titulo: "Política de Gestão de Vulnerabilidades", tipo: "politica", status: "vigente", arquivoPdf: "/materiais/politicas/politica-gestao-vulnerabilidades-ti.pdf", descricao: "Diretrizes de segurança para gestão de vulnerabilidades de sistemas e infraestrutura.", responsavel: "TI / Compliance", revisao: "02/2027" },

  { id: "sgq-inventario-tratamento-dados", titulo: "Inventário de Tratamento de Dados", tipo: "sgq", status: "vigente", arquivoPdf: "/materiais/sgq/sgq-inventario-tratamento-dados.pdf", descricao: "Registro institucional de operações e fluxos de tratamento de dados.", responsavel: "DPO / Compliance", revisao: "02/2027" },
  { id: "sgq-manual-gestao-planejamento-fin", titulo: "Manual de Gestão e Planejamento Financeiro", tipo: "sgq", status: "vigente", arquivoPdf: "/materiais/sgq/sgq-manual-gestao-planejamento-financeiro.pdf", descricao: "Documento de referência para controles e organização financeira interna.", responsavel: "Financeiro / Diretoria", revisao: "02/2027" },
  { id: "sgq-manual-atendimento-etico", titulo: "Manual para um Atendimento Ético e Transparente", tipo: "sgq", status: "vigente", arquivoPdf: "/materiais/sgq/sgq-manual-atendimento-etico-transparente.pdf", descricao: "Manual orientativo para conduta ética e transparência no atendimento.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "proc-plano-anual-auditoria", titulo: "Plano Anual de Auditoria Interna", tipo: "sgq", status: "vigente", arquivoPdf: "/materiais/sgq/sgq-plano-anual-auditoria-interna.pdf", descricao: "Planejamento anual das atividades e frentes de auditoria interna.", responsavel: "Auditoria Interna", revisao: "02/2027" },

  { id: "proc-auditoria-interna", titulo: "Procedimento de Auditoria Interna", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/procedimento-auditoria-interna.pdf", descricao: "Fluxo operacional para execução e registro de auditorias internas.", responsavel: "Auditoria Interna", revisao: "02/2027" },
  { id: "proc-prevencao-fraude", titulo: "Procedimento de Prevenção à Fraude", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/procedimento-prevencao-fraude.pdf", descricao: "Procedimentos formais de apoio ao controle e prevenção de fraudes.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "proc-concessao-acessos-sistemas", titulo: "Procedimento para Concessão de Acesso aos Sistemas", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/procedimento-concessao-acesso-sistemas.pdf", descricao: "Fluxo operacional para concessão, alteração e revogação de acessos.", responsavel: "Qualidade / TI", revisao: "02/2027" },
  { id: "proc-contratacao-desenvolvimento", titulo: "Procedimento para Contratação e Desenvolvimento", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/procedimento-contratacao-desenvolvimento.pdf", descricao: "Procedimento de contratação, integração e desenvolvimento de colaboradores e parceiros.", responsavel: "RH / Qualidade", revisao: "02/2027" },
  { id: "proc-tratamento-mailing", titulo: "Procedimento para Tratamento de Lista de Mailing", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/procedimento-tratamento-lista-mailing.pdf", descricao: "Procedimento formal para uso, controle e tratamento de listas de mailing.", responsavel: "Qualidade e Compliance", revisao: "02/2027" },
  { id: "proc-concessao-acessos-chavej-portal", titulo: "Concessão de Acessos (Chave J e Portal do Correspondente)", tipo: "procedimento", status: "vigente", arquivoPdf: "/materiais/procedimentos/concessao-acessos.pdf", descricao: "Procedimento operacional para concessão de acessos a ambientes críticos.", responsavel: "Qualidade / TI", revisao: "02/2027" },

  { id: "institucional-termo-adocao-sgq", titulo: "Termo de Adoção Institucional – SGQ", tipo: "institucional", status: "vigente", arquivoPdf: "/materiais/termos/termo-adocao-institucional-sgq.pdf", descricao: "Documento institucional de formalização e adesão ao Sistema de Gestão da Qualidade.", responsavel: "Diretoria / Qualidade", revisao: "02/2027" },
];

function DocRow({ doc }: { doc: Documento }) {
  const tipo = TAGS[doc.tipo];
  const status = STATUS[doc.status];

  return (
    <div className="doc-row">
      <div className="doc-left">
        <div className="doc-title">
          <span className="doc-icon" aria-hidden="true">{tipo.icon}</span>
          <span>{doc.titulo}</span>
        </div>
        <div className="doc-meta">
          <span className={tipo.badgeClass}>{tipo.label}</span>
          <span className={status.badgeClass}>{status.label}</span>
          <span className="meta-pill">Revisão: {doc.revisao}</span>
          <span className="meta-pill">Resp.: {doc.responsavel}</span>
        </div>
        <div className="doc-sub">{doc.descricao}</div>
      </div>
      <div className="doc-actions">
        <a className="btn btn-yellow btn-sm" href={doc.arquivoPdf} target="_blank" rel="noopener noreferrer">Abrir</a>
        <a className="btn btn-outline btn-sm" href={doc.arquivoPdf} download>Baixar</a>
      </div>
    </div>
  );
}

function SectionBox({ title, subtitle, docs }: { title: string; subtitle: string; docs: Documento[] }) {
  if (!docs.length) return null;

  return (
    <div className="box">
      <div className="box-head">
        <div>
          <h3 className="box-title">{title}</h3>
          <p className="box-sub">{subtitle}</p>
        </div>
        <div className="box-count">{docs.length}</div>
      </div>
      <div className="doc-list">{docs.map((d) => <DocRow key={d.id} doc={d} />)}</div>
    </div>
  );
}

export default function MateriaisPage() {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | DocTipo>("TODOS");

  const docsFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return DOCUMENTOS.filter((doc) => {
      const okTipo = filtroTipo === "TODOS" || doc.tipo === filtroTipo;
      const okBusca = !q || doc.titulo.toLowerCase().includes(q) || doc.descricao.toLowerCase().includes(q) || doc.responsavel.toLowerCase().includes(q);
      return okTipo && okBusca;
    });
  }, [busca, filtroTipo]);

  const grupos = useMemo(() => ({
    politicas: docsFiltrados.filter((d) => d.tipo === "politica"),
    sgq: docsFiltrados.filter((d) => d.tipo === "sgq"),
    procedimentos: docsFiltrados.filter((d) => d.tipo === "procedimento"),
    institucionais: docsFiltrados.filter((d) => d.tipo === "institucional"),
  }), [docsFiltrados]);

  const resumo = useMemo(() => ({
    total: DOCUMENTOS.length,
    politicas: DOCUMENTOS.filter((d) => d.tipo === "politica").length,
    procedimentos: DOCUMENTOS.filter((d) => d.tipo === "procedimento").length,
    sgq: DOCUMENTOS.filter((d) => d.tipo === "sgq").length,
    institucionais: DOCUMENTOS.filter((d) => d.tipo === "institucional").length,
  }), []);

  return (
    <main className="section gray">
      <div className="container materiaisPage">
        <div className="section-title">
          <h2>Materiais & Políticas</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 920 }}>
          Biblioteca documental para consulta dos colaboradores. Os documentos abaixo integram a base de políticas, procedimentos e materiais internos divulgados no Portal do Colaborador para suporte operacional e evidência de auditoria.
        </p>

        <div className="docResumoGrid">
          <div className="docResumo"><strong>{resumo.total}</strong><span>Documentos</span></div>
          <div className="docResumo"><strong>{resumo.politicas}</strong><span>Políticas</span></div>
          <div className="docResumo"><strong>{resumo.procedimentos}</strong><span>Procedimentos</span></div>
          <div className="docResumo"><strong>{resumo.sgq}</strong><span>SGQ</span></div>
          <div className="docResumo"><strong>{resumo.institucionais}</strong><span>Institucional</span></div>
        </div>

        <div className="docFilters card">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por documento, responsável ou descrição..." />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "TODOS" | DocTipo)}>
            <option value="TODOS">Todas as categorias</option>
            <option value="politica">Políticas</option>
            <option value="sgq">SGQ</option>
            <option value="procedimento">Procedimentos</option>
            <option value="institucional">Institucionais</option>
          </select>
        </div>

        <SectionBox title="📘 Políticas Institucionais" subtitle="Diretrizes internas obrigatórias para governança, segurança, privacidade, RH e prevenção de riscos." docs={grupos.politicas} />
        <SectionBox title="🗂️ Sistema de Gestão da Qualidade (SGQ)" subtitle="Documentos formais de apoio, gestão, qualidade e estrutura institucional." docs={grupos.sgq} />
        <SectionBox title="🧩 Procedimentos Internos" subtitle="Procedimentos e manuais utilizados como evidência formal em auditorias internas e externas." docs={grupos.procedimentos} />
        <SectionBox title="🏛️ Documentos Institucionais" subtitle="Documentos institucionais complementares de formalização, adesão e governança." docs={grupos.institucionais} />

        {docsFiltrados.length === 0 ? <div className="card emptyBox">Nenhum documento encontrado com os filtros selecionados.</div> : null}

        <div className="mt-18">
          <Link className="btn btn-outline" href="/colaborador">← Voltar para Área do Colaborador</Link>
        </div>

        <style jsx global>{`
          .materiaisPage { max-width: 1180px; }
          .docResumoGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:14px;margin-bottom:14px}
          .docResumo{background:#fff;border:1px solid rgba(10,42,106,.1);border-radius:16px;padding:14px;box-shadow:0 8px 20px rgba(15,23,42,.05)}
          .docResumo strong{display:block;font-size:24px;line-height:1;color:#0a2a6a;font-weight:900}.docResumo span{display:block;margin-top:5px;font-size:12px;font-weight:800;opacity:.7}
          .docFilters{padding:14px!important;border-radius:18px!important;border:1px solid rgba(10,42,106,.1)!important;background:linear-gradient(180deg,#fff,#f8faff)!important;display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
          .docFilters input,.docFilters select{border:1px solid rgba(10,42,106,.12);border-radius:14px;background:#fff;padding:11px 12px;font-weight:800;outline:none}.docFilters input{flex:1;min-width:260px}.docFilters select{min-width:210px}
          .box{background:#fff;border-radius:18px;padding:14px;border:1px solid rgba(0,0,0,.08);box-shadow:0 8px 22px rgba(0,0,0,.05);margin-top:16px}
          .box-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:6px 6px 12px 6px;border-bottom:1px dashed rgba(0,0,0,.12)}
          .box-title{margin:0;font-weight:900;font-size:15px;color:#0b1f3a}.box-sub{margin:6px 0 0 0;font-size:12px;font-weight:700;color:rgba(0,0,0,.65);max-width:820px}
          .box-count{min-width:34px;height:34px;border-radius:999px;background:rgba(11,59,138,.06);border:1px solid rgba(11,59,138,.14);display:flex;align-items:center;justify-content:center;font-weight:900;color:rgba(0,0,0,.7)}
          .doc-list{margin-top:12px;display:flex;flex-direction:column;gap:10px}.doc-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px;border:1px solid rgba(0,0,0,.08);border-radius:14px;background:rgba(255,255,255,.9)}
          .doc-left{min-width:0;flex:1}.doc-title{display:flex;align-items:center;gap:10px;font-weight:900;color:#0b1f3a;font-size:14px;line-height:1.2}.doc-icon{width:28px;height:28px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:rgba(11,59,138,.06);border:1px solid rgba(11,59,138,.14);flex:0 0 auto}
          .doc-meta{margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.doc-sub{margin-top:8px;font-size:12px;font-weight:700;color:rgba(0,0,0,.62);max-width:920px;line-height:1.45}.doc-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end;min-width:160px}
          .btn-sm{padding:10px 12px!important;font-size:12px!important;border-radius:999px!important}.badge,.meta-pill{font-size:11px;font-weight:900;padding:6px 10px;border-radius:999px;border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.04);color:rgba(0,0,0,.75);line-height:1;white-space:nowrap}.meta-pill{font-weight:800;color:rgba(0,0,0,.68)}
          .badge-blue{background:rgba(11,59,138,.06);border-color:rgba(11,59,138,.14);color:rgba(11,59,138,.95)}.badge-green{background:rgba(20,180,90,.1);border-color:rgba(20,180,90,.22);color:rgba(14,122,61,1)}.badge-purple{background:rgba(110,60,210,.08);border-color:rgba(110,60,210,.18);color:rgba(90,40,170,1)}.badge-gray{background:rgba(80,80,80,.08);border-color:rgba(80,80,80,.16);color:rgba(70,70,70,1)}.badge-ok{background:rgba(20,180,90,.1);border-color:rgba(20,180,90,.22);color:rgba(14,122,61,1)}.badge-warn{background:rgba(247,198,0,.12);border-color:rgba(247,198,0,.26);color:rgba(140,104,0,1)}
          .emptyBox{padding:16px!important;border-radius:18px!important;margin-top:14px;font-weight:800;opacity:.75}
          @media(max-width:900px){.docResumoGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.doc-row{flex-direction:column}.doc-actions{justify-content:flex-start;min-width:0}.docFilters input,.docFilters select{width:100%;min-width:0}}
        `}</style>
      </div>
    </main>
  );
}
