export default function HowSection() {
  return (
    <section className="how" id="como-funciona">
      <div className="container">
        <div className="how-header">
          <h2>Como funciona nosso atendimento</h2>
          <p>
            Atendimento seguro, acompanhado do início ao fim, com transparência e responsabilidade.
          </p>
        </div>

        <div className="how-steps">
          <article className="how-card">
            <div className="how-badge">1</div>
            <h3>Primeiro contato</h3>
            <p>Você fala com um atendente especializado pelos nossos canais oficiais.</p>
          </article>

          <article className="how-card">
            <div className="how-badge">2</div>
            <h3>Análise do perfil</h3>
            <p>Avaliamos sua necessidade e elegibilidade com critérios e conformidade.</p>
          </article>

          <article className="how-card">
            <div className="how-badge">3</div>
            <h3>Melhor solução</h3>
            <p>Apresentamos a melhor opção com clareza, sem promessas irreais.</p>
          </article>

          <article className="how-card">
            <div className="how-badge">4</div>
            <h3>Acompanhamento</h3>
            <p>Você recebe orientação em cada etapa até a finalização do processo.</p>
          </article>
        </div>

        <div className="how-actions">
          <a
            className="btn btn-yellow"
            href="https://wa.me/5584981417224?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20e%20tirar%20algumas%20d%C3%BAvidas."
            target="_blank"
            rel="noopener noreferrer"
          >
            FALAR NO WHATSAPP
          </a>

          <a className="btn btn-ghost" href="/produtos">
            Ver produtos
          </a>

          <a className="btn btn-outline-yellow" href="/contato">
            Ver contato
          </a>
        </div>

        <div className="how-trust">
          <span className="how-pill">Correspondente Autorizado</span>
          <span className="how-pill">Processos padronizados</span>
          <span className="how-pill">Conformidade e LGPD</span>
        </div>
      </div>
    </section>
  );
}
