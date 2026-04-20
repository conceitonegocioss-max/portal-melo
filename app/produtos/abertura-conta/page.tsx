import Link from "next/link";

export default function AberturaContaPage() {
  const itens = [
    {
      title: "Conta PF (Pessoa Física)",
      desc: "Apoio na abertura de conta, com orientações de segurança e boas práticas.",
    },
    {
      title: "Conta PJ (Pessoa Jurídica)",
      desc: "Suporte para abertura e regularização, com atenção a documentos e conformidade.",
    },
    {
      title: "Portabilidade de Salário",
      desc: "Orientação para solicitar e acompanhar a portabilidade, conforme regras aplicáveis.",
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
            <h1 className="product-title">Abertura de Conta</h1>
            <p className="product-lead">
              Suporte no processo de abertura e orientações de segurança e boas práticas.
              Atendimento claro, padronizado e com foco em conformidade.
            </p>

            <div className="product-tags">
              <span className="tag">PF</span>
              <span className="tag">PJ</span>
              <span className="tag">Boas práticas</span>
            </div>

            <div className="product-actions">
              <Link className="btn btn-yellow" href="/contato">
                QUERO ABRIR CONTA
              </Link>

              <Link className="btn btn-outline" href="/privacidade-lgpd">
                LGPD / PRIVACIDADE
              </Link>
            </div>
          </div>

          <div className="product-hero-right">
            <div
              className="product-banner"
              style={{ backgroundImage: "url(/imagens/abertura-conta.png)" }}
              aria-label="Imagem representando abertura de conta"
            />
          </div>
        </div>

        <div className="section-title mt-18">
          <h2>Opções</h2>
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
          <strong>Observação:</strong> a abertura e portabilidade dependem de análise, documentos
          e regras do Banco do Brasil.
        </div>
      </div>
    </main>
  );
}
