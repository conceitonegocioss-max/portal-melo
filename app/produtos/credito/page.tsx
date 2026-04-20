import Link from "next/link";

export default function CreditoPage() {
  const itens = [
    {
      title: "Crédito Consignado",
      desc: "Parcelas com desconto em folha/benefício, com suporte completo e orientação segura.",
    },
    {
      title: "CDC",
      desc: "Crédito direto ao consumidor para necessidades diversas, com acompanhamento do início ao fim.",
    },
    {
      title: "Crédito Automático",
      desc: "Opção prática para correntistas, conforme análise e condições do Banco do Brasil.",
    },
    {
      title: "Crédito Benefício",
      desc: "Modalidade voltada a públicos elegíveis, com orientação e cuidado no processo.",
    },
    {
      title: "Portabilidade",
      desc: "Avaliação e orientação para levar seu crédito para melhores condições, quando aplicável.",
    },
    {
      title: "Seguro",
      desc: "Proteções e coberturas para sua tranquilidade (consulte disponibilidade e condições).",
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
            <h1 className="product-title">Crédito</h1>
            <p className="product-lead">
              Atuamos com soluções de crédito orientadas, seguras e com foco em conformidade.
              Nossa equipe apoia você em cada etapa, com clareza e responsabilidade.
            </p>

            <div className="product-tags">
              <span className="tag">Segurança</span>
              <span className="tag">Conformidade</span>
              <span className="tag">Atendimento humanizado</span>
            </div>

            <div className="product-actions">
              <Link className="btn btn-yellow" href="/contato">
                QUERO ATENDIMENTO
              </Link>

              <Link className="btn btn-outline" href="/privacidade-lgpd">
                LGPD / PRIVACIDADE
              </Link>
            </div>
          </div>

          <div className="product-hero-right">
            <div
              className="product-banner"
              style={{ backgroundImage: "url(/imagens/credito.png)" }}
              aria-label="Imagem representando crédito"
            />
          </div>
        </div>

        <div className="section-title mt-18">
          <h2>Opções disponíveis</h2>
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
          <strong>Observação:</strong> as modalidades, condições e elegibilidade dependem de análise,
          políticas do Banco do Brasil e disponibilidade do produto.
        </div>
      </div>
    </main>
  );
}
