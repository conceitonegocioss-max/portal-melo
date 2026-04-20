"use client";

import Link from "next/link";

type Prova = {
  slug: string;
  titulo: string;
  produto: string;
  publico: string;
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

export default function ProvasPage() {
  return (
    <main
      style={{
        minHeight: "100%",
        background: "#f3f5f9",
        color: "#0b2a6f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "34px 24px 48px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 54,
            lineHeight: 1.05,
            fontWeight: 800,
            color: "#0b2a6f",
            letterSpacing: "-0.02em",
          }}
        >
          Provas e Avaliações
        </h1>

        <div
          style={{
            marginTop: 14,
            width: 60,
            height: 6,
            borderRadius: 999,
            background: "#f4c400",
          }}
        />

        <p
          style={{
            marginTop: 22,
            marginBottom: 0,
            fontSize: 18,
            lineHeight: 1.5,
            color: "#17326e",
            fontWeight: 700,
            maxWidth: 980,
          }}
        >
          Avaliações vinculadas aos treinamentos, utilizadas como critério de conformidade,
          controle interno e auditoria.
        </p>

        <div
          style={{
            marginTop: 26,
            background: "#ffffff",
            border: "1px solid #dbe3f0",
            borderRadius: 24,
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            boxShadow: "0 8px 24px rgba(15, 35, 95, 0.05)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                color: "#0b2a6f",
                fontWeight: 800,
              }}
            >
              Acesso às provas
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                color: "#5b6980",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Seu acesso está liberado. Selecione uma prova para iniciar.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #acdcbc",
              background: "#ebf8ef",
              color: "#1b9a57",
              borderRadius: 999,
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            ✅ Acesso liberado
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 18,
          }}
        >
          {PROVAS.map((prova) => (
            <article
              key={prova.slug}
              style={{
                background: "#ffffff",
                border: "1px solid #e1e7f0",
                borderRadius: 24,
                padding: 22,
                boxShadow: "0 8px 24px rgba(15, 35, 95, 0.04)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: "#0b2a6f",
                  fontWeight: 800,
                }}
              >
                📄 {prova.titulo}
              </h3>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gap: 6,
                  color: "#17326e",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Produto:</strong> {prova.produto}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Público:</strong> {prova.publico}
                </p>
              </div>

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  color: "#0b2a6f",
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                Regra: 70% mínimo • até 3 tentativas
              </p>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gap: 12,
                }}
              >
                <Link
                  href={`/colaborador/provas/${prova.slug}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    borderRadius: 999,
                    background: "#f4c400",
                    color: "#0b2a6f",
                    fontWeight: 800,
                    fontSize: 15,
                    border: "1px solid #e0b900",
                  }}
                >
                  Iniciar prova
                </Link>

                <Link
                  href="/colaborador/treinamentos"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    borderRadius: 999,
                    background: "#ffffff",
                    color: "#0b2a6f",
                    fontWeight: 800,
                    fontSize: 15,
                    border: "1px solid #ccd6e6",
                  }}
                >
                  Ver treinamentos
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/colaborador"
            style={{
              textDecoration: "none",
              borderRadius: 999,
              border: "1px solid #ccd6e6",
              background: "#ffffff",
              color: "#0b2a6f",
              padding: "12px 18px",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            ← Área do Colaborador
          </Link>

          <Link
            href="/colaborador/treinamentos"
            style={{
              textDecoration: "none",
              borderRadius: 999,
              border: "1px solid #ccd6e6",
              background: "#ffffff",
              color: "#0b2a6f",
              padding: "12px 18px",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            ← Treinamentos
          </Link>
        </div>

        <footer
          style={{
            marginTop: 46,
            paddingBottom: 16,
            textAlign: "center",
            color: "#6f7b8f",
            fontSize: 14,
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          <div>© 2026 — Portal do Colaborador</div>
          <div>Uso interno e restrito aos colaboradores</div>
          <div>Área de Qualidade e Compliance</div>
        </footer>
      </section>
    </main>
  );
}