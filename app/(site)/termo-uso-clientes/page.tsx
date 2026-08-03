import Link from "next/link";

const sections = [
  {
    title: "1. Aceite do termo",
    text:
      "Ao utilizar os canais de atendimento, solicitar simulação, enviar documentos, fornecer dados pessoais ou dar continuidade ao atendimento, o cliente declara estar ciente das condições deste Termo de Uso e Aviso de Privacidade.",
  },
  {
    title: "2. Serviços prestados",
    text:
      "A empresa atua como correspondente bancário, realizando atendimento, orientação, simulação, recepção e encaminhamento de propostas de produtos e serviços financeiros, conforme regras da instituição financeira parceira e normas aplicáveis.",
  },
  {
    title: "3. Dados pessoais coletados",
    text:
      "Durante o atendimento, poderão ser coletados dados necessários à simulação, análise, contratação e formalização da operação, tais como nome, CPF, documento de identificação, dados bancários, dados de benefício, informações cadastrais e documentos exigidos pela instituição financeira.",
  },
  {
    title: "4. Finalidade do tratamento",
    text:
      "Os dados pessoais são utilizados para atendimento ao cliente, simulação de propostas, análise de crédito, formalização de operações, cumprimento de obrigações legais e regulatórias, comunicação com a instituição financeira e atendimento a demandas do titular.",
  },
  {
    title: "5. Compartilhamento de dados",
    text:
      "Os dados poderão ser compartilhados com a instituição financeira, rede gestora, parceiros operacionais e autoridades competentes, quando necessário para execução dos serviços, cumprimento de obrigações legais ou atendimento de solicitação do titular.",
  },
  {
    title: "6. Direitos dos usuários e titulares",
    text:
      "O cliente poderá solicitar informações sobre o tratamento de seus dados pessoais, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e demais direitos previstos na Lei Geral de Proteção de Dados Pessoais.",
  },
  {
    title: "7. Responsabilidades dos usuários",
    text:
      "O cliente é responsável por fornecer informações verdadeiras, atualizadas e completas, apresentar documentos legítimos, acompanhar as condições da proposta antes da contratação e não fornecer dados de terceiros sem autorização.",
  },
  {
    title: "8. Segurança e confidencialidade",
    text:
      "A empresa adota medidas internas de segurança, confidencialidade e controle de acesso para proteção dos dados pessoais, conforme Política de Privacidade de Dados, Política de Segurança da Informação e demais documentos institucionais aplicáveis.",
  },
];

export default function TermoUsoClientes() {
  return (
    <main className="section gray">
      <div className="container">
        <section
          style={{
            background:
              "linear-gradient(135deg, rgba(11,79,217,0.08) 0%, rgba(10,63,176,0.04) 100%)",
            border: "1px solid rgba(10,42,106,0.08)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "#eef3ff",
              border: "1px solid rgba(10,42,106,0.10)",
              color: "#0a2a6a",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            📄 Termos, Privacidade e Atendimento
          </span>

          <h1
            style={{
              margin: "16px 0 0",
              color: "#0a3fb0",
              fontSize: 40,
              fontWeight: 1000,
              letterSpacing: -0.8,
              lineHeight: 1.05,
            }}
          >
            Termo de Uso e Aviso de Privacidade para Clientes
          </h1>

          <div
            style={{
              width: 72,
              height: 6,
              background: "#ffd400",
              borderRadius: 999,
              marginTop: 12,
            }}
          />

          <p
            style={{
              marginTop: 18,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.7,
              maxWidth: 980,
              fontSize: 16,
            }}
          >
            Esta página apresenta as condições gerais de uso dos serviços prestados
            pelo correspondente bancário, bem como informações sobre coleta, uso,
            compartilhamento e proteção de dados pessoais dos clientes, em
            conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD.
          </p>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link className="btn btn-yellow" href="/encarregado">
              FALAR COM O ENCARREGADO
            </Link>
            <Link className="btn btn-outline" href="/politica-de-privacidade-de-dados.pdf" target="_blank" rel="noopener noreferrer">
              VER POLÍTICA DE PRIVACIDADE
            </Link>
            <Link className="btn btn-outline" href="/privacidade-lgpd">
              VER LGPD & PRIVACIDADE
            </Link>
            <Link className="btn btn-outline" href="/">
              ← VOLTAR AO INÍCIO
            </Link>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 22,
            padding: 24,
            border: "1px solid rgba(10,42,106,0.08)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0a2a6a",
              fontSize: 26,
              fontWeight: 1000,
            }}
          >
            Arcabouço legal e conceitos aplicáveis
          </h2>
          <p
            style={{
              marginTop: 12,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.8,
            }}
          >
            Este termo observa a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados
            Pessoais (LGPD), o Código de Defesa do Consumidor, normas do Banco
            Central do Brasil, diretrizes da instituição financeira parceira e demais
            normas legais, regulatórias, contratuais e institucionais aplicáveis.
          </p>
          <p
            style={{
              marginTop: 10,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.8,
            }}
          >
            Para fins deste termo, consideram-se dados pessoais as informações
            relacionadas a pessoa natural identificada ou identificável; titular é a
            pessoa a quem os dados se referem; e tratamento corresponde a qualquer
            operação realizada com dados pessoais, como coleta, utilização,
            armazenamento, compartilhamento e eliminação.
          </p>
        </section>

        <section style={{ marginTop: 24 }}>
          <div className="lgpd-grid">
            {sections.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 22,
                  border: "1px solid rgba(10,42,106,0.08)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0a2a6a",
                    fontSize: 21,
                    fontWeight: 1000,
                  }}
                >
                  {item.title}
                </h2>
                <p
                  style={{
                    marginTop: 12,
                    color: "#29416a",
                    fontWeight: 650,
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            background:
              "linear-gradient(135deg, rgba(255,212,0,0.12) 0%, rgba(255,255,255,1) 100%)",
            borderRadius: 22,
            padding: 24,
            border: "1px solid rgba(10,42,106,0.08)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0a2a6a",
              fontSize: 26,
              fontWeight: 1000,
            }}
          >
            Canal do Encarregado
          </h2>
          <p
            style={{
              marginTop: 12,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.7,
              maxWidth: 920,
            }}
          >
            Para dúvidas, solicitações ou exercício de direitos relacionados à LGPD,
            o cliente poderá acionar o Encarregado pelo Tratamento de Dados
            Pessoais, responsável por receber solicitações e prestar esclarecimentos
            sobre privacidade e proteção de dados.
          </p>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link className="btn btn-yellow" href="/encarregado">
              ACESSAR CANAL DO ENCARREGADO
            </Link>
            <Link className="btn btn-outline" href="/contato">
              CONTATO INSTITUCIONAL
            </Link>
          </div>
        </section>

        <p
          style={{
            marginTop: 24,
            color: "#5b6475",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </main>
  );
}
