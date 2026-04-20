"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/src/lib/auth";

type DocumentoCategoria = "politica" | "sgq" | "procedimento" | "institucional" | "termo";

type Documento = {
  id: string;
  titulo: string;
  categoria: DocumentoCategoria;
  restrito?: boolean;
};

type Indicador = {
  titulo: string;
  valor: number;
  icone: string;
};

const DOCUMENTOS: Documento[] = [
  { id: "termo-confidencialidade", titulo: "Termo de Confidencialidade", categoria: "termo" },

  { id: "politica-atendimento", titulo: "Política de Atendimento ao Cliente", categoria: "politica" },
  { id: "politica-concessao-acessos", titulo: "Política de Concessão de Acesso aos Sistemas e Aplicativos Internos", categoria: "politica" },
  { id: "politica-incidentes", titulo: "Política de Gestão de Incidentes", categoria: "politica" },
  { id: "politica-vulnerabilidades", titulo: "Política de Gestão de Vulnerabilidades", categoria: "politica" },
  { id: "politica-governanca", titulo: "Política de Governança", categoria: "politica" },
  { id: "politica-portabilidade-credito", titulo: "Política de Portabilidade de Crédito", categoria: "politica" },
  { id: "politica-prevencao-fraude", titulo: "Política de Prevenção à Fraude", categoria: "politica" },
  { id: "politica-privacidade", titulo: "Política de Privacidade de Dados (LGPD)", categoria: "politica" },
  { id: "politica-rh", titulo: "Política de Recursos Humanos", categoria: "politica" },
  { id: "politica-seguranca-firewall", titulo: "Política de Segurança da Informação e Uso de Firewall", categoria: "politica" },

  { id: "sgq-inventario-tratamento-dados", titulo: "Inventário de Tratamento de Dados", categoria: "sgq" },
  { id: "sgq-manual-gestao-planejamento-fin", titulo: "Manual de Gestão e Planejamento Financeiro", categoria: "sgq" },
  { id: "sgq-manual-atendimento-etico", titulo: "Manual para um Atendimento Ético e Transparente", categoria: "sgq" },

  { id: "proc-plano-anual-auditoria", titulo: "Plano Anual de Auditoria Interna", categoria: "procedimento" },
  { id: "proc-auditoria-interna", titulo: "Procedimento de Auditoria Interna", categoria: "procedimento" },
  { id: "proc-prevencao-fraude", titulo: "Procedimento de Prevenção à Fraude", categoria: "procedimento" },
  { id: "proc-concessao-acessos-sistemas", titulo: "Procedimento para Concessão de Acesso aos Sistemas", categoria: "procedimento" },
  { id: "proc-contratacao-desenvolvimento", titulo: "Procedimento para Contratação e Desenvolvimento", categoria: "procedimento" },
  { id: "proc-tratamento-mailing", titulo: "Procedimento para Tratamento de Lista de Mailing", categoria: "procedimento", restrito: true },
  { id: "proc-concessao-acessos-chavej-portal", titulo: "Concessão de Acessos (Chave J e Portal do Correspondente)", categoria: "procedimento" },

  { id: "institucional-termo-adocao-sgq", titulo: "Termo de Adoção Institucional – SGQ", categoria: "institucional" },
];

const TOTAL_TREINAMENTOS = 16;

function formatarPerfil(perfil: string) {
  return perfil || "COLABORADOR";
}

export default function GovernancaPage() {
  const [nome, setNome] = useState("");
  const [perfil, setPerfil] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    setNome(session.nome || "");
    setPerfil(session.perfil || "");
  }, []);

  const totais = useMemo(() => {
    return {
      politicas: DOCUMENTOS.filter((d) => d.categoria === "politica").length,
      procedimentos: DOCUMENTOS.filter((d) => d.categoria === "procedimento").length,
      sgq: DOCUMENTOS.filter((d) => d.categoria === "sgq").length,
      institucionais: DOCUMENTOS.filter((d) => d.categoria === "institucional").length,
      termos: DOCUMENTOS.filter((d) => d.categoria === "termo").length,
      restritos: DOCUMENTOS.filter((d) => d.restrito).length,
    };
  }, []);

  const indicadores: Indicador[] = useMemo(
    () => [
      {
        titulo: "Políticas Institucionais",
        valor: totais.politicas,
        icone: "📘",
      },
      {
        titulo: "Procedimentos Internos",
        valor: totais.procedimentos,
        icone: "🧩",
      },
      {
        titulo: "Documentos SGQ",
        valor: totais.sgq,
        icone: "🗂️",
      },
      {
        titulo: "Treinamentos Obrigatórios",
        valor: TOTAL_TREINAMENTOS,
        icone: "🎓",
      },
      {
        titulo: "Documentos Institucionais",
        valor: totais.institucionais,
        icone: "🏛️",
      },
      {
        titulo: "Documentos Restritos",
        valor: totais.restritos,
        icone: "🔒",
      },
    ],
    [totais]
  );

  return (
    <main className="section gray">
      <div className="container">
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
          Painel institucional de acompanhamento de políticas, procedimentos, documentos do Sistema de Gestão da Qualidade,
          treinamentos obrigatórios e estrutura de conformidade do portal.
        </p>

        <div className="gov-top">
          <div className="gov-user">
            <div className="gov-user-title">Sessão atual</div>
            <div className="gov-user-name">{nome || "Usuário"}</div>
            <div className="gov-user-sub">Perfil: {formatarPerfil(perfil)}</div>
          </div>

          <div className="gov-user gov-user-soft">
            <div className="gov-user-title">Escopo monitorado</div>
            <div className="gov-user-name">Governança documental</div>
            <div className="gov-user-sub">Políticas, procedimentos, SGQ, termos e treinamentos</div>
          </div>
        </div>

        <div className="govern-grid">
          {indicadores.map((item, i) => (
            <div className="gov-card" key={i}>
              <div className="gov-icon">{item.icone}</div>
              <div className="gov-number">{item.valor}</div>
              <div className="gov-title">{item.titulo}</div>
            </div>
          ))}
        </div>

        <div className="gov-box">
          <h3>Status de Conformidade</h3>

          <div className="gov-line">
            <span>Políticas institucionais cadastradas</span>
            <strong>{totais.politicas}</strong>
          </div>

          <div className="gov-line">
            <span>Procedimentos internos cadastrados</span>
            <strong>{totais.procedimentos}</strong>
          </div>

          <div className="gov-line">
            <span>Documentos do SGQ</span>
            <strong>{totais.sgq}</strong>
          </div>

          <div className="gov-line">
            <span>Documentos institucionais</span>
            <strong>{totais.institucionais}</strong>
          </div>

          <div className="gov-line">
            <span>Termos obrigatórios</span>
            <strong>{totais.termos}</strong>
          </div>

          <div className="gov-line">
            <span>Próxima revisão prevista</span>
            <strong>02/2027</strong>
          </div>
        </div>

        <div className="gov-box">
          <h3>Mapa do Sistema de Governança</h3>

          <div className="gov-structure">
            <div className="gov-node">📘 Políticas</div>
            <div className="gov-node">🧩 Procedimentos</div>
            <div className="gov-node">🗂️ SGQ</div>
            <div className="gov-node">🎓 Treinamentos</div>
            <div className="gov-node">🔐 Termos</div>
            <div className="gov-node">🧾 Auditoria</div>
          </div>
        </div>

        <div className="gov-box">
          <h3>Resumo Executivo</h3>

          <div className="gov-summary">
            <div className="gov-summary-card">
              <div className="gov-summary-title">Base documental</div>
              <div className="gov-summary-text">
                O portal mantém uma biblioteca institucional organizada por categoria, com políticas, procedimentos,
                documentos do SGQ e termos obrigatórios.
              </div>
            </div>

            <div className="gov-summary-card">
              <div className="gov-summary-title">Treinamentos</div>
              <div className="gov-summary-text">
                O ambiente considera atualmente <strong>{TOTAL_TREINAMENTOS}</strong> treinamentos obrigatórios vinculados ao
                processo de conformidade.
              </div>
            </div>

            <div className="gov-summary-card">
              <div className="gov-summary-title">Controle de acesso</div>
              <div className="gov-summary-text">
                Há <strong>{totais.restritos}</strong> documento(s) com acesso restrito por perfil, reforçando governança e
                segregação de acesso.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gov-top {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .gov-user {
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
        }

        .gov-user-soft {
          background: linear-gradient(180deg, #ffffff, #f7f9ff);
        }

        .gov-user-title {
          font-size: 12px;
          font-weight: 900;
          opacity: 0.65;
        }

        .gov-user-name {
          font-size: 20px;
          font-weight: 900;
          color: #0b3b8a;
          margin-top: 6px;
        }

        .gov-user-sub {
          font-size: 13px;
          font-weight: 700;
          opacity: 0.8;
          margin-top: 6px;
        }

        .govern-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .gov-card {
          background: #fff;
          border-radius: 16px;
          padding: 22px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          text-align: center;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
        }

        .gov-icon {
          font-size: 26px;
        }

        .gov-number {
          font-size: 32px;
          font-weight: 900;
          margin-top: 6px;
          color: #0b3b8a;
        }

        .gov-title {
          font-size: 13px;
          margin-top: 6px;
          font-weight: 700;
          opacity: 0.85;
        }

        .gov-box {
          margin-top: 24px;
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
        }

        .gov-box h3 {
          margin-bottom: 12px;
          color: #0b1f3a;
        }

        .gov-line {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
          font-size: 14px;
        }

        .gov-line:last-child {
          border-bottom: none;
        }

        .gov-structure {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .gov-node {
          background: #f5f7fb;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-weight: 700;
          text-align: center;
        }

        .gov-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .gov-summary-card {
          background: #f8faff;
          border: 1px solid rgba(10, 42, 106, 0.08);
          border-radius: 14px;
          padding: 14px;
        }

        .gov-summary-title {
          font-weight: 900;
          color: #0a2a6a;
          margin-bottom: 8px;
        }

        .gov-summary-text {
          font-size: 13px;
          line-height: 1.5;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.72);
        }

        @media (max-width: 1000px) {
          .gov-top {
            grid-template-columns: 1fr;
          }

          .govern-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .gov-structure {
            grid-template-columns: repeat(2, 1fr);
          }

          .gov-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .govern-grid {
            grid-template-columns: 1fr;
          }

          .gov-structure {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}