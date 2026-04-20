import Link from "next/link";

export default function OurocapPage() {
  const itens = [
    {
      title: "PU (Pagamento Único)",
      desc: "Modalidade com pagamento único, conforme regras e disponibilidade do produto.",
    },
    {
      title: "PM (Pagamento Mensal/Parcelado)",
      desc: "Modalidade com pagamentos parcelados, com orientação e acompanhamento.",
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
            <h1 className="product-title">Ourocap / Capitalização</h1>
            <p className="product-lead">
              Solução de capitalização com orientação transparente e registro de evidências.
              Atuamos com clareza, responsabilidade e suporte durante todo o processo.
            </p>

            <div className="product-tags">
              <span className="tag">Transparência</span>
              <span className="tag">Orientação</span>
              <span className="tag">Conformidade</span>
            </div>

            <div className="product-actions">
              <Link className="btn btn-yellow" href="/contato">
                QUERO INFORMAÇÕES
              </Link>

              <Link className="btn btn-outline" href="/privacidade-lgpd">
                LGPD / PRIVACIDADE
              </Link>
            </div>
          </div>

          <div className="product-hero-right">
            <div
              className="product-banner"
              style={{ backgroundImage: "url(/imagens/ourocap.png)" }}
              aria-label="Imagem representando capitalização"
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
          <strong>Observação:</strong> este produto possui regras específicas. Consulte termos,
          condições e disponibilidade antes da contratação.
        </div>
      </div>
    </main>
  );
}
