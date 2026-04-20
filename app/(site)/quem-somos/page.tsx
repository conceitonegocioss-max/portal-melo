import Link from "next/link";

export default function QuemSomos() {
  return (
    <main className="container" style={{ padding: "34px 0 70px" }}>
      <h1
        style={{
          color: "#0a3fb0",
          fontSize: 44,
          fontWeight: 1000,
          letterSpacing: -0.8,
        }}
      >
        Quem Somos
      </h1>

      <div
        style={{
          width: 70,
          height: 6,
          background: "#ffea00",
          borderRadius: 999,
          marginTop: 10,
        }}
      />

      <p
        style={{
          marginTop: 18,
          color: "#5b6475",
          fontWeight: 650,
          lineHeight: 1.7,
          maxWidth: 980,
        }}
      >
        Somos um Correspondente Autorizado do Banco do Brasil, especializado em
        soluções financeiras, com atuação pautada pela ética, transparência e
        conformidade. Trabalhamos com processos padronizados e foco em qualidade
        operacional, oferecendo atendimento seguro, claro e eficiente do início ao
        fim da jornada do cliente.
      </p>

      <h2 style={{ marginTop: 28, color: "#0a3fb0" }}>Nossa missão</h2>
      <p
        style={{
          marginTop: 10,
          color: "#5b6475",
          fontWeight: 650,
          lineHeight: 1.7,
          maxWidth: 980,
        }}
      >
        Oferecer serviços de correspondência bancária com excelência,
        proporcionando soluções financeiras acessíveis, seguras e confiáveis em
        todo o Brasil. Atuamos com ética, transparência e responsabilidade,
        buscando sempre a satisfação e o sucesso de nossos clientes e parceiros.
      </p>

      <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/produtos">
          VER SERVIÇOS
        </Link>
        <Link className="btn btn-yellow" href="/contato">
          CONTATO
        </Link>
        <Link className="btn btn-ghost" href="/privacidade-lgpd">
          LGPD / PRIVACIDADE
        </Link>
      </div>
    </main>
  );
}
