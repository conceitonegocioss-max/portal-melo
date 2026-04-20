"use client";

import Link from "next/link";
import { useState } from "react";

type DocTipo = "politica" | "procedimento" | "termo" | "sgq" | "institucional";
type DocStatus = "vigente" | "atualizar";

type Documento = {
  id: string;
  titulo: string;
  tipo: DocTipo;
  status: DocStatus;
  arquivoPdf: string;
  versao?: string;
  data?: string;
  descricao?: string;
  obrigatorio?: boolean;
};

type SessionUser = {
  id?: string;
  nome?: string;
  cpf?: string;
  perfil?: string;
  empresa?: string;
};

const SESSION_KEY = "portal_colaborador_session_v1";

const TAGS: Record<DocTipo, { label: string; badgeClass: string; icon: string }> = {
  politica: { label: "Política", badgeClass: "badge badge-blue", icon: "📘" },
  procedimento: { label: "Procedimento", badgeClass: "badge badge-green", icon: "🧩" },
  termo: { label: "Termo", badgeClass: "badge badge-red", icon: "🔐" },
  sgq: { label: "SGQ", badgeClass: "badge badge-purple", icon: "🗂️" },
  institucional: { label: "Institucional", badgeClass: "badge badge-gray", icon: "🏛️" },
};

const STATUS: Record<DocStatus, { label: string; badgeClass: string }> = {
  vigente: { label: "Vigente", badgeClass: "badge badge-ok" },
  atualizar: { label: "Revisar", badgeClass: "badge badge-warn" },
};

const TERMOS: Documento[] = [
  {
    id: "termo-confidencialidade",
    titulo: "Termo de Confidencialidade",
    tipo: "termo",
    status: "vigente",
    arquivoPdf: "/materiais/termos/termo-confidencialidade-sgq.pdf",
    versao: "v3.0",
    data: "02/2027",
    obrigatorio: true,
    descricao:
      "Documento obrigatório para ciência e compromisso de sigilo, conformidade e boas práticas de tratamento das informações.",
  },
];

const POLITICAS: Documento[] = [
  {
    id: "politica-atendimento",
    titulo: "Política de Atendimento ao Cliente",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-atendimento-ao-cliente.pdf",
    descricao: "Diretrizes de atendimento, postura e relacionamento com clientes.",
  },
  {
    id: "politica-prevencao-fraude",
    titulo: "Política de Prevenção à Fraude",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-prevencao-fraude.pdf",
    descricao: "Diretrizes de prevenção, detecção e resposta a fraudes.",
  },
  {
    id: "politica-privacidade",
    titulo: "Política de Privacidade de Dados (LGPD)",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-privacidade-dados.pdf",
    descricao: "Regras de privacidade, tratamento e proteção de dados pessoais.",
  },
  {
    id: "politica-seguranca-firewall",
    titulo: "Política de Segurança da Informação e Uso de Firewall",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-seguranca-informacao-firewall.pdf",
    descricao: "Controles e boas práticas de segurança da informação e uso de infraestrutura.",
  },
  {
    id: "politica-concessao-acessos",
    titulo: "Política de Concessão de Acesso aos Sistemas e Aplicativos Internos",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-concessao-acesso-sistemas-aplicativos-internos.pdf",
    descricao: "Regras para concessão, manutenção e revogação de acessos internos.",
  },
  {
    id: "politica-governanca",
    titulo: "Política de Governança",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-governanca.pdf",
    descricao: "Princípios, responsabilidades e diretrizes de governança corporativa.",
  },
  {
    id: "politica-portabilidade-credito",
    titulo: "Política de Portabilidade de Crédito",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-portabilidade-credito.pdf",
    descricao: "Normas e controles aplicáveis ao processo de portabilidade de crédito.",
  },
  {
    id: "politica-rh",
    titulo: "Política de Recursos Humanos",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-recursos-humanos.pdf",
    descricao: "Diretrizes institucionais relacionadas à gestão de pessoas e conduta interna.",
  },
  {
    id: "politica-incidentes",
    titulo: "Política de Gestão de Incidentes",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-gestao-incidentes.pdf",
    descricao: "Fluxos e responsabilidades para identificação, tratamento e comunicação de incidentes.",
  },
  {
    id: "politica-vulnerabilidades",
    titulo: "Política de Gestão de Vulnerabilidades",
    tipo: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-gestao-vulnerabilidades-ti.pdf",
    descricao: "Diretrizes de segurança para gestão de vulnerabilidades de sistemas e infraestrutura.",
  },
];

const SGQ: Documento[] = [
  {
    id: "sgq-inventario-tratamento-dados",
    titulo: "Inventário de Tratamento de Dados",
    tipo: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-inventario-tratamento-dados.pdf",
    descricao: "Registro institucional de operações e fluxos de tratamento de dados.",
  },
  {
    id: "sgq-manual-gestao-planejamento-fin",
    titulo: "Manual de Gestão e Planejamento Financeiro",
    tipo: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-manual-gestao-planejamento-financeiro.pdf",
    descricao: "Documento de referência para controles e organização financeira interna.",
  },
  {
    id: "sgq-manual-atendimento-etico",
    titulo: "Manual para um Atendimento Ético e Transparente",
    tipo: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-manual-atendimento-etico-transparente.pdf",
    descricao: "Manual orientativo para conduta ética e transparência no atendimento.",
  },
  {
    id: "proc-plano-anual-auditoria",
    titulo: "Plano Anual de Auditoria Interna",
    tipo: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-plano-anual-auditoria-interna.pdf",
    descricao: "Planejamento anual das atividades e frentes de auditoria interna.",
  },
];

const PROCEDIMENTOS: Documento[] = [
  {
    id: "proc-auditoria-interna",
    titulo: "Procedimento de Auditoria Interna",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-auditoria-interna.pdf",
    descricao: "Fluxo operacional para execução e registro de auditorias internas.",
  },
  {
    id: "proc-prevencao-fraude",
    titulo: "Procedimento de Prevenção à Fraude",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-prevencao-fraude.pdf",
    descricao: "Procedimentos formais de apoio ao controle e prevenção de fraudes.",
  },
  {
    id: "proc-concessao-acessos-sistemas",
    titulo: "Procedimento para Concessão de Acesso aos Sistemas",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-concessao-acesso-sistemas.pdf",
    descricao: "Fluxo operacional para concessão, alteração e revogação de acessos.",
  },
  {
    id: "proc-contratacao-desenvolvimento",
    titulo: "Procedimento para Contratação e Desenvolvimento",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-contratacao-desenvolvimento.pdf",
    descricao:
      "Procedimento de contratação, integração e desenvolvimento de colaboradores e parceiros.",
  },
  {
    id: "proc-tratamento-mailing",
    titulo: "Procedimento para Tratamento de Lista de Mailing",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-tratamento-lista-mailing.pdf",
    descricao: "Procedimento formal para uso, controle e tratamento de listas de mailing.",
  },
  {
    id: "proc-concessao-acessos-chavej-portal",
    titulo: "Concessão de Acessos (Chave J e Portal do Correspondente)",
    tipo: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/concessao-acessos.pdf",
    descricao: "Procedimento operacional para concessão de acessos a ambientes críticos.",
  },
];

const INSTITUCIONAIS: Documento[] = [
  {
    id: "institucional-termo-adocao-sgq",
    titulo: "Termo de Adoção Institucional – SGQ",
    tipo: "institucional",
    status: "vigente",
    arquivoPdf: "/materiais/termos/termo-adocao-institucional-sgq.pdf",
    descricao: "Documento institucional de formalização e adesão ao Sistema de Gestão da Qualidade.",
  },
];

function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function DocRow({ doc }: { doc: Documento }) {
  const tipo = TAGS[doc.tipo];
  const status = STATUS[doc.status];

  return (
    <div className="doc-row">
      <div className="doc-left">
        <div className="doc-title">
          <span className="doc-icon" aria-hidden="true">
            {tipo.icon}
          </span>
          <span>{doc.titulo}</span>
        </div>

        <div className="doc-meta">
          <span className={tipo.badgeClass}>{tipo.label}</span>
          <span className={status.badgeClass}>{status.label}</span>
          {doc.obrigatorio ? <span className="badge badge-red">Obrigatório</span> : null}
          {doc.versao ? <span className="meta-pill">Versão: {doc.versao}</span> : null}
          {doc.data ? <span className="meta-pill">Revisão: {doc.data}</span> : null}
        </div>

        <div className="doc-sub">
          {doc.descricao || "Documento institucional para consulta, padronização e conformidade."}
        </div>
      </div>

      <div className="doc-actions">
        <a
          className="btn btn-yellow btn-sm"
          href={doc.arquivoPdf}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir
        </a>

        <a className="btn btn-outline btn-sm" href={doc.arquivoPdf} download>
          Baixar
        </a>
      </div>
    </div>
  );
}

function SectionBox({
  title,
  subtitle,
  docs,
}: {
  title: string;
  subtitle: string;
  docs: Documento[];
}) {
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

      <div className="doc-list">
        {docs.map((d) => (
          <DocRow key={d.id} doc={d} />
        ))}
      </div>
    </div>
  );
}

export default function MateriaisPage() {
  const termo = TERMOS[0];
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [loadingTermo, setLoadingTermo] = useState(false);

  async function handleAbrirTermo() {
    if (loadingTermo) return;

    setFeedback(null);
    setLoadingTermo(true);

    try {
      const session = getSessionUser();

      if (!session?.cpf || !session?.nome) {
        setFeedback({
          type: "error",
          text: "Não foi possível identificar a sessão do colaborador para registrar a ciência.",
        });
        return;
      }

      const response = await fetch("/api/audit/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "TERMO_ACEITO",
          actorCpf: session.cpf || "",
          actorNome: session.nome || "",
          actorPerfil: session.perfil || "",
          actorEmpresa: session.empresa || "",
          module: "termo",
          entityId: termo.id,
          entityTitle: termo.titulo,
          obs: "Ciência registrada ao abrir Termo de Confidencialidade pela Biblioteca de Governança.",
          meta: {
            documento: termo.titulo,
            documentoId: termo.id,
            documentoTipo: termo.tipo,
            versao: termo.versao || "",
            revisao: termo.data || "",
            arquivoPdf: termo.arquivoPdf,
            origem: "botao_abrir_termo_biblioteca_governanca",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao registrar ciência.");
      }

      setFeedback({
        type: "ok",
        text: `Ciência registrada com sucesso para ${session.nome} em ${new Date().toLocaleString(
          "pt-BR"
        )}.`,
      });

      window.open(termo.arquivoPdf, "_blank", "noopener,noreferrer");
    } catch {
      setFeedback({
        type: "error",
        text: "O termo não foi registrado. Tente novamente antes de prosseguir.",
      });
    } finally {
      setLoadingTermo(false);
    }
  }

  return (
    <main className="section gray">
      <div className="container">
        <div className="section-title">
          <h2>Biblioteca de Governança</h2>
          <div className="bar" />
        </div>

        <p className="section-text">
          Documentos institucionais para consulta: políticas internas, procedimentos, materiais do
          Sistema de Gestão da Qualidade e documentos obrigatórios de suporte às atividades.
        </p>

        <div className="highlight">
          <div className="highlight-top">
            <div className="highlight-title">🔐 Termo de Confidencialidade (Obrigatório)</div>
            <div className="highlight-badges">
              <span className="badge badge-red">Termo</span>
              <span className="badge badge-ok">Vigente</span>
            </div>
          </div>

          <div className="highlight-desc">
            Documento obrigatório para ciência e compromisso de sigilo, conformidade e boas práticas
            de tratamento das informações.
          </div>

          <div className="highlight-actions">
            <button
              type="button"
              className="btn btn-yellow"
              onClick={handleAbrirTermo}
              disabled={loadingTermo}
            >
              {loadingTermo ? "Registrando ciência..." : "Abrir termo (registrar ciência)"}
            </button>

            <a className="btn btn-outline" href={termo.arquivoPdf} download>
              Baixar
            </a>
          </div>

          {feedback ? (
            <div
              className={`feedback-box ${
                feedback.type === "ok" ? "feedback-ok" : "feedback-error"
              }`}
            >
              {feedback.text}
            </div>
          ) : null}
        </div>

        <SectionBox
          title="📘 Políticas Institucionais"
          subtitle="Diretrizes internas obrigatórias para governança, segurança, privacidade, RH e prevenção de riscos."
          docs={POLITICAS}
        />

        <SectionBox
          title="🗂️ Sistema de Gestão da Qualidade (SGQ)"
          subtitle="Documentos formais de apoio, gestão, qualidade e estrutura institucional."
          docs={SGQ}
        />

        <SectionBox
          title="🧩 Procedimentos Internos"
          subtitle="Procedimentos e manuais utilizados como evidência formal em auditorias internas e externas."
          docs={PROCEDIMENTOS}
        />

        <SectionBox
          title="🏛️ Documentos Institucionais"
          subtitle="Documentos institucionais complementares de formalização, adesão e governança."
          docs={INSTITUCIONAIS}
        />

        <div className="mt-18">
          <Link className="btn btn-outline" href="/colaborador">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <style jsx global>{`
          .highlight {
            background: #fff;
            border-radius: 18px;
            padding: 18px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
            margin-top: 14px;
            margin-bottom: 18px;
            position: relative;
            overflow: hidden;
          }

          .highlight::before {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 10% 10%, rgba(247, 198, 0, 0.18), transparent 55%);
            pointer-events: none;
          }

          .highlight-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            position: relative;
            z-index: 1;
          }

          .highlight-title {
            font-weight: 900;
            font-size: 16px;
            color: #0b1f3a;
          }

          .highlight-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .highlight-desc {
            margin-top: 10px;
            color: rgba(0, 0, 0, 0.7);
            font-size: 13px;
            font-weight: 600;
            position: relative;
            z-index: 1;
            max-width: 840px;
          }

          .highlight-actions {
            margin-top: 14px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
          }

          .feedback-box {
            margin-top: 14px;
            padding: 12px 14px;
            border-radius: 14px;
            position: relative;
            z-index: 1;
            font-size: 13px;
            font-weight: 800;
            line-height: 1.5;
          }

          .feedback-ok {
            background: rgba(20, 180, 90, 0.1);
            border: 1px solid rgba(20, 180, 90, 0.18);
            color: rgba(14, 122, 61, 1);
          }

          .feedback-error {
            background: rgba(210, 30, 30, 0.08);
            border: 1px solid rgba(210, 30, 30, 0.16);
            color: rgba(150, 20, 20, 1);
          }

          .box {
            background: #fff;
            border-radius: 18px;
            padding: 14px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
            margin-top: 16px;
          }

          .box-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 6px 6px 12px 6px;
            border-bottom: 1px dashed rgba(0, 0, 0, 0.12);
          }

          .box-title {
            margin: 0;
            font-weight: 900;
            font-size: 15px;
            color: #0b1f3a;
          }

          .box-sub {
            margin: 6px 0 0 0;
            font-size: 12px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.65);
            max-width: 820px;
          }

          .box-count {
            min-width: 34px;
            height: 34px;
            border-radius: 999px;
            background: rgba(11, 59, 138, 0.06);
            border: 1px solid rgba(11, 59, 138, 0.14);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            color: rgba(0, 0, 0, 0.7);
          }

          .doc-list {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .doc-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 12px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.9);
          }

          .doc-left {
            min-width: 0;
            flex: 1;
          }

          .doc-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 900;
            color: #0b1f3a;
            font-size: 14px;
            line-height: 1.2;
          }

          .doc-icon {
            width: 28px;
            height: 28px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(11, 59, 138, 0.06);
            border: 1px solid rgba(11, 59, 138, 0.14);
            flex: 0 0 auto;
          }

          .doc-meta {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .doc-sub {
            margin-top: 8px;
            font-size: 12px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.62);
            max-width: 920px;
            line-height: 1.45;
          }

          .meta-pill {
            font-size: 11px;
            font-weight: 800;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.08);
            color: rgba(0, 0, 0, 0.72);
          }

          .doc-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            min-width: 160px;
          }

          .btn-sm {
            padding: 10px 12px !important;
            font-size: 12px !important;
            border-radius: 999px !important;
          }

          .badge {
            font-size: 11px;
            font-weight: 900;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.75);
            line-height: 1;
            white-space: nowrap;
          }

          .badge-blue {
            background: rgba(11, 59, 138, 0.06);
            border-color: rgba(11, 59, 138, 0.14);
            color: rgba(11, 59, 138, 0.95);
          }

          .badge-green {
            background: rgba(20, 180, 90, 0.1);
            border-color: rgba(20, 180, 90, 0.22);
            color: rgba(14, 122, 61, 1);
          }

          .badge-red {
            background: rgba(210, 30, 30, 0.08);
            border-color: rgba(210, 30, 30, 0.18);
            color: rgba(150, 20, 20, 1);
          }

          .badge-purple {
            background: rgba(110, 60, 210, 0.08);
            border-color: rgba(110, 60, 210, 0.18);
            color: rgba(90, 40, 170, 1);
          }

          .badge-gray {
            background: rgba(80, 80, 80, 0.08);
            border-color: rgba(80, 80, 80, 0.16);
            color: rgba(70, 70, 70, 1);
          }

          .badge-ok {
            background: rgba(20, 180, 90, 0.1);
            border-color: rgba(20, 180, 90, 0.22);
            color: rgba(14, 122, 61, 1);
          }

          .badge-warn {
            background: rgba(247, 198, 0, 0.12);
            border-color: rgba(247, 198, 0, 0.26);
            color: rgba(140, 104, 0, 1);
          }

          @media (max-width: 780px) {
            .doc-row {
              flex-direction: column;
            }

            .doc-actions {
              justify-content: flex-start;
              min-width: 0;
            }

            .highlight-top {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </main>
  );
}