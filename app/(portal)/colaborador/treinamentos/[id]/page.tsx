import Link from "next/link";

const TRAININGS: Record<
  string,
  { title: string; pdfPath: string; description: string }
> = {
  "atendimento-ao-cliente": {
    title: "Atendimento ao Cliente",
    pdfPath: "/treinamentos/atendimento-ao-cliente.pdf",
    description:
      "Treinamento obrigatório sobre padrões de atendimento, comunicação clara e boas práticas.",
  },
  "codigo-de-etica": {
    title: "Código de Ética e Conduta",
    pdfPath: "/treinamentos/codigo-de-etica.pdf",
    description:
      "Diretrizes de conduta, integridade, postura profissional e conformidade institucional.",
  },
  "resumo-contratual": {
    title: "Resumo Contratual",
    pdfPath: "/treinamentos/resumo-contratual.pdf",
    description:
      "Conceitos essenciais e orientações para comunicação adequada de condições e responsabilidades.",
  },
  "credito-responsavel": {
    title: "Crédito Responsável",
    pdfPath: "/treinamentos/credito-responsavel.pdf",
    description:
      "Boas práticas de concessão e orientação ao cliente com transparência e responsabilidade.",
  },
};

function fallbackTraining(id: string) {
  return {
    title: id.replaceAll("-", " "),
    pdfPath: `/treinamentos/${id}.pdf`,
    description:
      "Treinamento obrigatório. Caso o PDF ainda não tenha sido publicado, adicione o arquivo em /public/treinamentos.",
  };
}

export default function TreinamentoPage({
  params,
}: {
  params: { id: string };
}) {
  const t = TRAININGS[params.id] ?? fallbackTraining(params.id);

  return (
    <main className="section gray">
      <div className="container">
        <div className="section-title">
          <h2>{t.title}</h2>
          <div className="bar" />
        </div>

        <p className="section-text">{t.description}</p>

        <div className="notice mt-18">
          Para fins de auditoria, o colaborador deverá estudar o material e concluir
          a avaliação com aprovação mínima.
        </div>

        <div
          className="product-grid mt-18"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {/* PDF */}
          <div className="product-card">
            <div className="product-body">
              <h3>📄 Material (PDF)</h3>
              <p>Abra o PDF para leitura ou faça o download.</p>
            </div>
            <div className="product-action" style={{ display: "flex", gap: 10 }}>
              <a
                className="btn btn-yellow"
                href={t.pdfPath}
                target="_blank"
                rel="noreferrer"
              >
                Abrir PDF
              </a>
              <a className="btn btn-outline" href={t.pdfPath} download>
                Baixar PDF
              </a>
            </div>
          </div>

          {/* PROVA */}
          <div className="product-card">
            <div className="product-body">
              <h3>📝 Prova</h3>
              <p>
                Avaliação vinculada ao treinamento.
                <br />
                <strong>Regra:</strong> mínimo 70% de acerto • até 3 tentativas
              </p>
            </div>
            <div className="product-action">
              <Link
                className="btn btn-yellow"
                href={`/colaborador/provas/${params.id}`}
              >
                Iniciar prova
              </Link>
            </div>
          </div>
        </div>

        {/* BOTÕES DE VOLTAR */}
        <div className="mt-18" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-outline" href="/colaborador/treinamentos">
            ← Voltar para treinamentos
          </Link>

          <Link className="btn btn-outline" href="/colaborador">
            ← Área do Colaborador
          </Link>
        </div>
      </div>
    </main>
  );
}
