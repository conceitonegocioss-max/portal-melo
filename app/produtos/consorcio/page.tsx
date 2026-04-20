import Link from "next/link";

export default function ConsorcioPage() {
  const itens = [
    {
      title: "Auto",
      desc: "Planejamento para aquisição de veículo com parcelas e acompanhamento do processo.",
    },
    {
      title: "Moto",
      desc: "Opção para conquistar sua moto com organização financeira e suporte na contratação.",
    },
    {
      title: "Imóveis",
      desc: "Consórcio para compra ou construção, com orientação e atendimento responsável.",
    },
    {
      title: "Outros bens móveis",
      desc: "Alternativa para bens diversos, conforme regras e disponibilidade do consórcio.",
    },
    {
      title: "Pesados",
      desc: "Opções voltadas a veículos e equipamentos de maior valor, conforme elegibilidade.",
    },
  ];

  return (
    <main className="section">
      <div className="container">
        <div className="back-row">
          <Link className="back-btn" href="/produtos">
            ← Voltar para Produtos
          </Link>
        </div>

        <div className="product-hero">
          <div className="product-hero-left">
            <h1 className="product-title">Consórcio</h1>
            <p className="product-lead">
              Opções para compra de bens e serviços com planejamento e acompanhamento.
              Atuamos com orientação clara e suporte em todo o processo.
            </p>

            <div className="product-tags">
              <span className="tag">Planejamento</span>
              <span className="tag">Acompanhamento</span>
              <span className="tag">Conformidade</span>
            </div>

            <div className="product-actions">
              <Link className="btn btn-yellow" href="/contato">
                QUERO SIMULAR
              </Link>

              <Link className="btn btn-outline" href="/privacidade-lgpd">
                LGPD / PRIVACIDADE
              </Link>
            </div>
          </div>

          <div className="product-hero-right">
            <div
              className="product-banner"
              style={{ backgroundImage: "url(/imagens/consorcio.png)" }}
              aria-label="Imagem representando consórcio"
            />
          </div>
        </div>

        <div className="section-title mt-18">
          <h2>Modalidades</h2>
          <div className="bar" />
        </div>

        <div className="subgrid mt-18">
          {itens.map((item) => (
            <div className="subcard" key={item.title}>
              <div className="subcard-head">
                <h3>{item.title}</h3>
              </div>
              <p>{item.desc}</p>

              <div className="subcard-foot">
                <Link className="btn btn-yellow small" href="/contato">
                  FALAR COM A EQUIPE
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="notice mt-18">
          <strong>Observação:</strong> condições, prazos e contemplação seguem regras do produto e
          disponibilidade. Consulte os termos e orientações oficiais.
        </div>
      </div>
    </main>
  );
}
