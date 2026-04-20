"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const slides = useMemo(
    () => [
      {
        title: (
          <>
            Mais comodidade e praticidade pra <span className="hl">você</span>.
          </>
        ),
        subtitle:
          "Somos um Correspondente Autorizado do Banco do Brasil, atuando com soluções financeiras com atendimento humanizado e foco em conformidade.",
        primaryHref: "/contato",
        primaryText: "FALE AGORA COM A GENTE",
        secondaryHref: "/produtos",
        secondaryText: "VER SERVIÇOS",
      },
      {
        title: (
          <>
            Nossa <span className="hl">missão</span>.
          </>
        ),
        subtitle:
          "Oferecer serviços de correspondência bancária com excelência, proporcionando soluções financeiras acessíveis, seguras e confiáveis em todo o Brasil. Atuamos com ética, transparência e responsabilidade, buscando sempre a satisfação e o sucesso de nossos clientes e parceiros.",
        primaryHref: "/quem-somos",
        primaryText: "CONHECER QUEM SOMOS",
        secondaryHref: "/privacidade-lgpd",
        secondaryText: "LGPD / PRIVACIDADE",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500); // troca a cada 4,5s
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <main>
      {/* HERO (CARROSSEL) */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">{slide.title}</h1>

            <p className="hero-subtitle">{slide.subtitle}</p>

            <div className="hero-actions">
              <Link className="btn btn-yellow" href={slide.primaryHref}>
                {slide.primaryText}
              </Link>

              <Link className="btn btn-ghost" href={slide.secondaryHref}>
                {slide.secondaryText}
              </Link>
            </div>

            {/* dots clicáveis */}
            <div className="dots-row">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`dot-btn ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* bolinhas decorativas do lado direito */}
          <div className="hero-dots" aria-hidden="true">
            <span className="dot dot-yellow" />
            <span className="dot dot-white" />
          </div>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Quem Somos</h2>
            <div className="bar" />
          </div>

          <p className="section-text">
            Somos um Correspondente Autorizado do Banco do Brasil, especializado em soluções
            financeiras, com atuação pautada pela ética, transparência e conformidade. Trabalhamos com
            processos padronizados e foco em qualidade operacional, oferecendo atendimento seguro,
            claro e eficiente do início ao fim da jornada do cliente.
          </p>

          <div className="mt-18">
            <Link className="btn btn-yellow" href="/quem-somos">
              SAIBA MAIS
            </Link>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="section gray">
        <div className="container">
          <div className="section-title">
            <h2>Nossos Serviços</h2>
            <div className="bar" />
          </div>

          <div className="product-grid mt-18">
            <Link href="/produtos/credito" className="product-card">
              <div className="product-image" style={{ backgroundImage: "url(/imagens/credito.png)" }} />
              <div className="product-body">
                <h3>Crédito</h3>
                <p>Orientação e condução do processo com foco em segurança, clareza e conformidade.</p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/consorcio" className="product-card">
              <div className="product-image" style={{ backgroundImage: "url(/imagens/consorcio.png)" }} />
              <div className="product-body">
                <h3>Consórcio</h3>
                <p>Planejamento para aquisição de bens e serviços, com acompanhamento.</p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/ourocap" className="product-card">
              <div className="product-image" style={{ backgroundImage: "url(/imagens/ourocap.png)" }} />
              <div className="product-body">
                <h3>Ourocap / Capitalização</h3>
                <p>Capitalização com orientação clara e registro de evidências.</p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/abertura-conta" className="product-card">
              <div className="product-image" style={{ backgroundImage: "url(/imagens/abertura-conta.png)" }} />
              <div className="product-body">
                <h3>Abertura de Conta</h3>
                <p>Abertura PF/PJ e orientações de segurança e boas práticas.</p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
