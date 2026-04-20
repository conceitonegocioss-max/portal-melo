import Link from "next/link";

export default function ConsignadoPage() {
  return (
    <main className="section white">
      <div className="container">
        <div className="section-title">
          <h2>Crédito Consignado</h2>
          <div className="bar" />
        </div>

        <p className="section-text">
          O crédito consignado é uma modalidade com parcelas descontadas diretamente
          na folha/benefício, podendo oferecer condições competitivas conforme perfil
          e elegibilidade. A orientação e o acompanhamento garantem clareza e segurança
          durante todo o processo.
        </p>

        <ul className="info-list">
          <li>Atendimento e orientação do início ao fim</li>
          <li>Transparência nas informações e condições</li>
          <li>Processo organizado e padronizado</li>
        </ul>

        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/contato" className="btn btn-primary">
            Falar com a equipe
          </Link>
          <Link href="/produtos/credito" className="btn btn-ghost">
            Voltar para Crédito
          </Link>
        </div>
      </div>
    </main>
  );
}
