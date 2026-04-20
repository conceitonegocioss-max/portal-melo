"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import TrustStrip from "../components/TrustStrip";
import HowSection from "../components/HowSection";

export default function HomePage() {
  const slides = useMemo(
    () => [
      {
        title: (
          <>
            Atendimento <span className="hl">rápido</span> e com{" "}
            <span className="hl">clareza</span>.
          </>
        ),
        subtitle:
          "Orientação segura do início ao fim, com transparência e responsabilidade.",
        primaryHref: "/contato",
        primaryText: "FALAR NO WHATSAPP",
        secondaryHref: "/produtos",
        secondaryText: "VER SERVIÇOS",
      },
      {
        title: (
          <>
            Soluções para <span className="hl">crédito</span> e{" "}
            <span className="hl">planejamento</span>.
          </>
        ),
        subtitle:
          "Crédito, Consórcio, Ourocap e Conta — com acompanhamento em cada etapa.",
        primaryHref: "/produtos",
        primaryText: "VER SERVIÇOS",
        secondaryHref: "/contato",
        secondaryText: "FALAR AGORA",
      },
      {
        title: (
          <>
            Processo <span className="hl">simples</span>. Acompanhamento{" "}
            <span className="hl">total</span>.
          </>
        ),
        subtitle: "Você entende tudo antes de decidir. Sem promessas irreais.",
        primaryHref: "#como-funciona",
        primaryText: "VER COMO FUNCIONA",
        secondaryHref: "/contato",
        secondaryText: "FALAR NO WHATSAPP",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const pauseUntilRef = useRef<number>(0);

  const goTo = (index: number) => {
    setActive(index);
    pauseUntilRef.current = Date.now() + 12000;
  };

  const prev = () => goTo((active - 1 + slides.length) % slides.length);
  const next = () => goTo((active + 1) % slides.length);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActive((prev) => (prev + 1) % slides.length);
    }, 9000);

    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <>
      <section
        className="hero hero-home"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(11,79,217,0.92) 0%, rgba(10,63,176,0.82) 34%, rgba(10,63,176,0.34) 60%, rgba(10,63,176,0.18) 100%), url('/imagens/hero-bg.jpg')",
        }}
      >
        <div className="container hero-home-inner">
          <div className="hero-glass">
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

            <div className="hero-cert-box">
              <span className="hero-cert-text">
                🔒 Certificado e em conformidade com diretrizes do setor
              </span>

              <div className="hero-cert-logos">
                <img
                  src="/selos/selo-promotiva.png"
                  alt="Selo de Qualidade Promotiva 2025"
                  className="hero-selo-promotiva"
                />

                <img
                  src="/selos/selo-febraban.png"
                  alt="Certificação FEBRABAN Correspondente Consignado"
                  className="hero-selo-febraban"
                />
              </div>
            </div>

            <div className="carousel-nav mt-18">
              <button
                className="carousel-btn"
                onClick={prev}
                aria-label="Slide anterior"
                type="button"
              >
                ◀
              </button>

              <div className="dots-row" style={{ marginTop: 0 }}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={`dot-btn ${i === active ? "active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Ir para slide ${i + 1}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                className="carousel-btn"
                onClick={next}
                aria-label="Próximo slide"
                type="button"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Quem Somos</h2>
            <div className="bar" />
          </div>

          <p className="section-text">
            Somos um Correspondente Autorizado do Banco do Brasil, especializado
            em soluções financeiras, com atuação pautada pela ética,
            transparência e conformidade. Trabalhamos com processos
            padronizados e foco em qualidade operacional, oferecendo
            atendimento seguro, claro e eficiente do início ao fim da jornada
            do cliente.
          </p>

          <div className="mission-box mt-18">
            <h3>Nossa missão</h3>
            <p>
              Oferecer serviços de correspondência bancária com excelência,
              proporcionando soluções financeiras acessíveis, seguras e
              confiáveis. Atuamos com ética, transparência e responsabilidade,
              buscando sempre a satisfação e o sucesso de nossos clientes e
              parceiros.
            </p>
          </div>

          <div className="mt-18">
            <Link className="btn btn-yellow" href="/quem-somos">
              SAIBA MAIS
            </Link>
          </div>
        </div>
      </section>

      <section className="section gray" id="produtos">
        <div className="container">
          <div className="section-title">
            <h2>Nossos Serviços</h2>
            <div className="bar" />
          </div>

          <div className="product-grid mt-18">
            <Link href="/produtos/credito" className="product-card">
              <div
                className="product-image"
                style={{ backgroundImage: "url(/imagens/credito.png)" }}
              />
              <div className="product-body">
                <h3>Crédito</h3>
                <p>
                  Orientação e condução do processo com foco em segurança,
                  clareza e conformidade.
                </p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/consorcio" className="product-card">
              <div
                className="product-image"
                style={{ backgroundImage: "url(/imagens/consorcio.png)" }}
              />
              <div className="product-body">
                <h3>Consórcio</h3>
                <p>
                  Planejamento para aquisição de bens e serviços, com
                  acompanhamento.
                </p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/ourocap" className="product-card">
              <div
                className="product-image"
                style={{ backgroundImage: "url(/imagens/ourocap.png)" }}
              />
              <div className="product-body">
                <h3>Ourocap / Capitalização</h3>
                <p>
                  Capitalização com orientação clara e registro de evidências.
                </p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>

            <Link href="/produtos/abertura-conta" className="product-card">
              <div
                className="product-image"
                style={{ backgroundImage: "url(/imagens/abertura-conta.png)" }}
              />
              <div className="product-body">
                <h3>Abertura de Conta</h3>
                <p>
                  Abertura PF/PJ e orientações de segurança e boas práticas.
                </p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div id="como-funciona">
        <HowSection />
      </div>

      <style jsx>{`
        .hero-home {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          padding: 84px 0 88px;
        }

        .hero-home-inner {
          min-height: 520px;
          display: flex;
          align-items: center;
        }

        .hero-glass {
          max-width: 620px;
          padding: 38px 34px;
          border-radius: 28px;
          background: rgba(7, 31, 84, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(6px);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.14);
        }

        .hero-glass :global(.hero-title) {
          margin: 0;
        }

        @media (max-width: 900px) {
          .hero-home {
            padding: 56px 0 64px;
            background-position: 68% center;
          }

          .hero-home-inner {
            min-height: 420px;
          }

          .hero-glass {
            max-width: 100%;
            padding: 26px 22px;
            border-radius: 22px;
          }
        }

        @media (max-width: 640px) {
          .hero-home {
            background-position: 72% center;
          }

          .hero-home-inner {
            min-height: 360px;
          }

          .hero-glass {
            padding: 22px 18px;
          }
        }
      `}</style>
    </>
  );
}