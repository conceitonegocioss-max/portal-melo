"use client";

import Link from "next/link";

export default function ProdutosPage() {
  const produtos = [
    {
      title: "Crédito",
      desc: "Orientação, simulação e encaminhamento de propostas de crédito, conforme regras da instituição financeira.",
      href: "/produtos/credito",
      img: "/imagens/credito.png",
    },
    {
      title: "Consórcio",
      desc: "Apoio e orientação sobre soluções de consórcio para aquisição de bens e serviços.",
      href: "/produtos/consorcio",
      img: "/imagens/consorcio.png",
    },
    {
      title: "Ourocap / Capitalização",
      desc: "Produtos de capitalização com orientação clara e atendimento transparente.",
      href: "/produtos/ourocap",
      img: "/imagens/ourocap.png",
    },
    {
      title: "Abertura de Conta",
      desc: "Apoio na abertura de contas PF/PJ, conforme regras da instituição financeira.",
      href: "/produtos/abertura-conta",
      img: "/imagens/abertura-conta.png",
    },
  ];

  return (
    <main className="section gray">
      <div className="container">
        <Link className="btn btn-outline" href="/" style={{ marginBottom: 18 }}>
          ← Voltar para o início
        </Link>

        <div className="section-title">
          <h2>Serviços de Correspondente Bancário</h2>
          <div className="bar" />
        </div>

        <div className="product-grid mt-18">
          {produtos.map((p) => (
            <Link key={p.href} href={p.href} className="product-card">
              <div
                className="product-image"
                style={{ backgroundImage: `url(${p.img})` }}
              />

              <div className="product-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>

              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card mt-24">
          <p style={{ margin: 0 }}>
            Atuamos como correspondente bancário, prestando atendimento, orientação
            e encaminhamento de propostas, conforme normas e diretrizes da
            instituição financeira parceira.
          </p>
        </div>
      </div>
    </main>
  );
}
