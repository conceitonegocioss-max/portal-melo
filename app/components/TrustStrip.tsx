export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Selo de confiança">
      <div className="container trust-inner">
        <div className="trust-item">
          <span className="trust-icon">✅</span>
          <div>
            <strong>Correspondente Autorizado</strong>
            <div className="trust-sub">
              Atuação conforme diretrizes institucionais
            </div>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">🧾</span>
          <div>
            <strong>Processos padronizados</strong>
            <div className="trust-sub">
              Orientação do início ao fim do atendimento
            </div>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <div>
            <strong>Conformidade e LGPD</strong>
            <div className="trust-sub">
              Privacidade, transparência e responsabilidade
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
