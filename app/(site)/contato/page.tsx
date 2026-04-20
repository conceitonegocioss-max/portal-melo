import Link from "next/link";

export default function ContatoPage() {
  const whatsappLink =
    "https://wa.me/5584981417224?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20e%20tirar%20algumas%20d%C3%BAvidas.";

  const horario = [
    { dia: "Segunda a Sexta", hora: "08:00 às 17:00" },
    { dia: "Sábado", hora: "Fechado" },
    { dia: "Domingo", hora: "Fechado" },
  ];

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
            📞 Canais Oficiais de Atendimento
          </span>

          <h1
            style={{
              margin: "16px 0 0",
              color: "#0a3fb0",
              fontSize: 42,
              fontWeight: 1000,
              letterSpacing: -0.8,
              lineHeight: 1.05,
            }}
          >
            Contato
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
              fontSize: 16,
            }}
          >
            Fale com um especialista pelos nossos canais oficiais. O atendimento
            e a formalização seguem conforme a instituição financeira, o produto
            contratado e as diretrizes aplicáveis, com foco em clareza,
            segurança e conformidade.
          </p>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a
              className="btn btn-yellow"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              FALAR NO WHATSAPP
            </a>

            <Link className="btn btn-outline" href="/produtos">
              VER PRODUTOS
            </Link>

            <Link className="btn btn-outline" href="/privacidade-lgpd">
              PRIVACIDADE / LGPD
            </Link>

            <Link className="btn btn-outline" href="/">
              ← VOLTAR AO INÍCIO
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <div className="contato-grid">
            <div className="contato-card">
              <h2 className="contato-card-title">WhatsApp principal</h2>

              <p className="contato-card-text">
                Atendimento rápido, direto e acompanhado do início ao fim. Para
                agilizar, informe nome, cidade/UF, produto de interesse e melhor
                horário para retorno.
              </p>

              <div style={{ marginTop: 16 }}>
                <a
                  className="btn btn-yellow"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ABRIR WHATSAPP
                </a>
              </div>

              <div className="contato-box-warn">
                <strong>Dica:</strong> mensagens fora do horário comercial serão
                respondidas no próximo dia útil.
              </div>
            </div>

            <div className="contato-card">
              <h2 className="contato-card-title">Horário de funcionamento</h2>

              <p className="contato-card-text">
                Atendimento em horário comercial. Nosso time responde mensagens
                conforme a disponibilidade operacional abaixo.
              </p>

              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gap: 10,
                }}
                role="table"
                aria-label="Horário de funcionamento"
              >
                {horario.map((item) => (
                  <div className="contato-schedule-row" key={item.dia}>
                    <span className="contato-schedule-day">{item.dia}</span>
                    <span className="contato-schedule-time">{item.hora}</span>
                  </div>
                ))}
              </div>

              <p className="contato-note">
                <strong>Observação:</strong> não há atendimento aos sábados,
                domingos e feriados.
              </p>
            </div>

            <div className="contato-card">
              <h2 className="contato-card-title">Transparência e conformidade</h2>

              <p className="contato-card-text">
                Atendemos com orientações claras e registro das etapas do
                atendimento, priorizando segurança, conformidade e respeito ao
                cliente. As condições e requisitos variam conforme o produto e a
                instituição financeira.
              </p>

              <p className="contato-card-text" style={{ marginTop: 10 }}>
                Para informações sobre privacidade e tratamento de dados, acesse
                nossa página de{" "}
                <Link
                  href="/privacidade-lgpd"
                  style={{ textDecoration: "underline" }}
                >
                  Privacidade / LGPD
                </Link>
                .
              </p>

              <div className="contato-pillrow">
                <span className="how-pill">Conformidade</span>
                <span className="how-pill">LGPD</span>
                <span className="how-pill">Processos padronizados</span>
                <span className="how-pill">Atendimento humanizado</span>
              </div>

              <div style={{ marginTop: 16 }}>
                <Link className="btn btn-outline" href="/encarregado">
                  FALAR COM O ENCARREGADO
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            background:
              "linear-gradient(135deg, rgba(255,212,0,0.12) 0%, rgba(255,255,255,1) 100%)",
            borderRadius: 22,
            padding: 24,
            border: "1px solid rgba(10,42,106,0.08)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0a2a6a",
              fontSize: 26,
              fontWeight: 1000,
            }}
          >
            Atendimento institucional
          </h2>

          <p
            style={{
              marginTop: 12,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.7,
              maxWidth: 920,
            }}
          >
            Para um atendimento mais eficiente, utilize sempre os canais
            oficiais e informe o produto desejado, seus dados básicos de contato
            e a melhor forma para retorno. Demandas relacionadas à privacidade e
            proteção de dados pessoais devem ser direcionadas ao canal do
            Encarregado.
          </p>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a
              className="btn btn-yellow"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              INICIAR ATENDIMENTO
            </a>

            <Link className="btn btn-outline" href="/encarregado">
              CANAL DO ENCARREGADO
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}