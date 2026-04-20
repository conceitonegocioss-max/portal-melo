import Link from "next/link";

export default function Encarregado() {
  return (
    <main className="section gray">
      <div className="container">
        <section
          style={{
            background:
              "linear-gradient(135deg, rgba(11,79,217,0.08) 0%, rgba(10,63,176,0.04) 100%)",
            border: "1px solid rgba(10,42,106,0.08)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "#eef3ff",
              border: "1px solid rgba(10,42,106,0.10)",
              color: "#0a2a6a",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            📬 Canal do Encarregado
          </span>

          <h1
            style={{
              margin: "16px 0 0",
              color: "#0a3fb0",
              fontSize: 42,
              fontWeight: 1000,
              letterSpacing: -0.8,
            }}
          >
            Encarregado pelo Tratamento de Dados (DPO)
          </h1>

          <div
            style={{
              width: 72,
              height: 6,
              background: "#ffd400",
              borderRadius: 999,
              marginTop: 12,
            }}
          />

          <p
            style={{
              marginTop: 18,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.7,
              maxWidth: 980,
            }}
          >
            Este é o canal oficial do Encarregado pelo Tratamento de Dados
            Pessoais, responsável por receber solicitações e comunicações
            relacionadas à LGPD, prestar esclarecimentos e atuar como ponto de
            contato para titulares de dados e autoridades.
          </p>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              className="btn btn-yellow"
              href="mailto:encarregado@conceitonegocioss.com"
            >
              ENVIAR E-MAIL
            </a>

            <a
              className="btn btn-outline"
              href="tel:+5584981417224"
            >
              LIGAR
            </a>

            <Link className="btn btn-outline" href="/privacidade-lgpd">
              VER LGPD
            </Link>

            <Link className="btn btn-outline" href="/">
              ← VOLTAR AO INÍCIO
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <div className="encarregado-grid">
            <div className="encarregado-card">
              <h2 className="encarregado-title">Finalidade do canal</h2>
              <p className="encarregado-text">
                Canal destinado a demandas de privacidade, proteção de dados e
                exercício de direitos do titular.
              </p>
            </div>

            <div className="encarregado-card">
              <h2 className="encarregado-title">Quando acionar</h2>
              <p className="encarregado-text">
                Para solicitar acesso, correção, exclusão, portabilidade,
                revogação de consentimento ou esclarecimentos.
              </p>
            </div>
          </div>
        </section>

        <section className="encarregado-box">
          <h2 className="encarregado-title-big">
            Como solicitar atendimento
          </h2>

          <ul className="encarregado-list">
            <li>Informe seu nome completo.</li>
            <li>Descreva sua solicitação.</li>
            <li>Inclua dados para identificação.</li>
            <li>Pode ser necessária validação de identidade.</li>
          </ul>
        </section>

        <section className="encarregado-highlight">
          <h2 className="encarregado-title-big">
            Contato do Encarregado
          </h2>

          <div className="encarregado-contact">
            <p>
              E-mail: <strong>encarregado@conceitonegocioss.com</strong>
            </p>

            <p>
              Telefone:{" "}
              <a href="tel:+5584981417224">
                <strong>(84) 98141-7224</strong>
              </a>
            </p>

            <p>
              Prazo de resposta: conforme legislação aplicável.
            </p>
          </div>

          <div style={{ marginTop: 18 }}>
            <a
              className="btn btn-yellow"
              href="mailto:encarregado@conceitonegocioss.com"
            >
              CONTATAR ENCARREGADO
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}