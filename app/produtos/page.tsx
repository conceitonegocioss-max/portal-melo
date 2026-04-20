"use client";

import Link from "next/link";

export default function ProdutosPage() {
  const produtos = [
    {
      title: "Crédito",
      desc: "Soluções de crédito com segurança e conformidade.",
      href: "/produtos/credito",
      img: "/imagens/credito.png",
    },
    {
      title: "Consórcio",
      desc: "Planejamento para aquisição de bens e serviços.",
      href: "/produtos/consorcio",
      img: "/imagens/consorcio.png",
    },
    {
      title: "Ourocap / Capitalização",
      desc: "Capitalização com orientação clara e registro de evidências.",
      href: "/produtos/ourocap",
      img: "/imagens/ourocap.png",
    },
    {
      title: "Abertura de Conta",
      desc: "Abertura PF/PJ e orientações de boas práticas.",
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
          <h2>Nossos Serviços</h2>
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
      </div>
    </main>
  );
}