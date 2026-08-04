"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

      <section className="section about-home">
        <div className="container">
          <div className="section-title">
            <h2>Quem Somos</h2>
            <div className="bar" />
          </div>

          <div className="about-intro">
            <p>
              Somos um Correspondente Autorizado Banco do Brasil, com atuação
              voltada ao atendimento, orientação e encaminhamento de soluções
              financeiras.
            </p>
            <p>
              Trabalhamos com processos padronizados, transparência,
              responsabilidade e foco na segurança do cliente em cada etapa do
              atendimento.
            </p>
          </div>

          <div className="mission-box mt-24">
            <h3>Nossa missão</h3>
            <p>
              Oferecer serviços de correspondência bancária com excelência,
              proporcionando atendimento claro, seguro e responsável. Atuamos
              com ética, transparência e conformidade, buscando orientar nossos
              clientes com cuidado em cada etapa do processo.
            </p>
          </div>

          <div className="about-cards mt-24">
            <div className="about-card">
              <span className="about-icon">💬</span>
              <h3>Atendimento claro</h3>
              <p>Orientação simples e acompanhamento durante o processo.</p>
            </div>

            <div className="about-card">
              <span className="about-icon">✅</span>
              <h3>Conformidade</h3>
              <p>
                Atuação alinhada às normas da instituição financeira parceira.
              </p>
            </div>

            <div className="about-card">
              <span className="about-icon">🔒</span>
              <h3>Privacidade e segurança</h3>
              <p>
                Proteção de dados, transparência e responsabilidade no
                atendimento.
              </p>
            </div>
          </div>

          <div className="mt-24">
            <Link className="btn btn-yellow" href="/quem-somos">
              SAIBA MAIS
            </Link>
          </div>
        </div>
      </section>

      <section className="section gray" id="produtos">
        <div className="container">
          <div className="section-title">
            <h2>Serviços de Correspondente Bancário</h2>
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
                  Orientação, simulação e encaminhamento de propostas de
                  crédito, conforme regras da instituição financeira.
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
                  Apoio e orientação sobre soluções de consórcio para aquisição
                  de bens e serviços.
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
                  Produtos de capitalização com orientação clara e atendimento
                  transparente.
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
                  Apoio na abertura de contas PF/PJ, conforme regras da
                  instituição financeira.
                </p>
              </div>
              <div className="product-action">
                <span className="btn btn-yellow">VER MAIS</span>
              </div>
            </Link>
          </div>

          <div className="card mt-24">
            <p style={{ margin: 0 }}>
              Atuamos como correspondente bancário, prestando atendimento,
              orientação e encaminhamento de propostas, conforme normas e
              diretrizes da instituição financeira parceira.
            </p>
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

        .about-home {
          padding-top: 72px;
          padding-bottom: 72px;
        }

        .about-intro {
          max-width: 920px;
          font-size: 18px;
          line-height: 1.75;
          color: #001b50;
          font-weight: 600;
        }

        .about-intro p {
          margin: 0 0 10px;
        }

        .mission-box {
          max-width: 940px;
          padding: 24px 26px;
          border-radius: 20px;
          border: 1px solid #e3e8f3;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 14px 34px rgba(0, 27, 80, 0.08);
        }

        .mission-box h3 {
          margin: 0 0 10px;
          color: #002c77;
          font-size: 24px;
        }

        .mission-box p {
          margin: 0;
          color: #001b50;
          line-height: 1.65;
          font-weight: 600;
        }

        .about-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .about-card {
          padding: 22px 22px 24px;
          border-radius: 18px;
          border: 1px solid #e3e8f3;
          background: #ffffff;
          box-shadow: 0 14px 34px rgba(0, 27, 80, 0.08);
        }

        .about-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #f4f7ff;
          margin-bottom: 12px;
          font-size: 20px;
        }

        .about-card h3 {
          margin: 0 0 8px;
          color: #002c77;
          font-size: 20px;
        }

        .about-card p {
          margin: 0;
          color: #001b50;
          line-height: 1.55;
          font-weight: 600;
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

          .about-cards {
            grid-template-columns: 1fr;
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

          .about-intro {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}
