import Link from "next/link";

export default function PrivacidadeLGPD() {
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
            🔐 Privacidade e Proteção de Dados
          </span>

          <h1
            style={{
              margin: "16px 0 0",
              color: "#0a3fb0",
              fontSize: 42,
              fontWeight: 1000,
              letterSpacing: -0.8,
              lineHeight: 1.05,
            }}
          >
            LGPD & Privacidade
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
            Esta página reúne informações sobre privacidade e proteção de dados
            pessoais, em conformidade com a Lei nº 13.709/2018 (LGPD). Nosso
            compromisso é tratar dados com segurança, transparência, finalidade
            legítima e controles compatíveis com boas práticas de governança.
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

            <Link className="btn btn-outline" href="/contato">
              CANAL DE CONTATO
            </Link>

            <Link className="btn btn-outline" href="/">
              ← VOLTAR AO INÍCIO
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <div className="lgpd-grid">
            <div
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
                  fontSize: 22,
                  fontWeight: 1000,
                }}
              >
                Coleta e uso de dados
              </h2>
              <p
                style={{
                  marginTop: 12,
                  color: "#29416a",
                  fontWeight: 650,
                  lineHeight: 1.7,
                }}
              >
                Coletamos os dados estritamente necessários para atendimento,
                análise, relacionamento e prestação de serviços, observando a
                finalidade informada, a base legal aplicável e o princípio da
                minimização.
              </p>
            </div>

            <div
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
                  fontSize: 22,
                  fontWeight: 1000,
                }}
              >
                Segurança e controles
              </h2>
              <p
                style={{
                  marginTop: 12,
                  color: "#29416a",
                  fontWeight: 650,
                  lineHeight: 1.7,
                }}
              >
                Adotamos medidas técnicas e administrativas voltadas à proteção
                das informações, incluindo controles internos, padronização de
                processos, segregação de acesso e registros formais quando
                aplicável.
              </p>
            </div>

            <div
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
                  fontSize: 22,
                  fontWeight: 1000,
                }}
              >
                Compartilhamento
              </h2>
              <p
                style={{
                  marginTop: 12,
                  color: "#29416a",
                  fontWeight: 650,
                  lineHeight: 1.7,
                }}
              >
                O compartilhamento de dados ocorre somente quando necessário para
                execução do serviço, cumprimento de obrigação legal ou regulatória,
                atendimento de solicitação do titular ou outra hipótese prevista
                em lei.
              </p>
            </div>

            <div
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
                  fontSize: 22,
                  fontWeight: 1000,
                }}
              >
                Direitos do titular
              </h2>
              <p
                style={{
                  marginTop: 12,
                  color: "#29416a",
                  fontWeight: 650,
                  lineHeight: 1.7,
                }}
              >
                O titular pode solicitar confirmação de tratamento, acesso,
                correção, anonimização, eliminação, portabilidade e demais medidas
                previstas na LGPD, por meio do canal do Encarregado.
              </p>
            </div>
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
            Principais diretrizes
          </h2>

          <ul
            style={{
              marginTop: 16,
              paddingLeft: 20,
              color: "#29416a",
              fontWeight: 650,
              lineHeight: 1.9,
            }}
          >
            <li>Coleta limitada ao mínimo necessário para atendimento e prestação de serviços.</li>
            <li>Tratamento orientado por finalidade, necessidade, adequação e transparência.</li>
            <li>Registros e evidências de controle quando aplicável para governança e auditoria.</li>
            <li>Compartilhamento apenas quando necessário e com fundamento legal.</li>
            <li>Adoção de medidas de segurança compatíveis com o contexto do tratamento.</li>
          </ul>
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
            Para exercer direitos relacionados aos seus dados pessoais, registrar
            solicitação ou obter esclarecimentos sobre privacidade e tratamento
            de dados, utilize o canal oficial do Encarregado pelo Tratamento de
            Dados Pessoais.
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