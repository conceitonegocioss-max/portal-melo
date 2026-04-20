"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { getSession } from "@/src/lib/auth";

const ROUTES = {
  HOME: "/colaborador",
  EVIDENCIAS: "/colaborador/auditoria/evidencias",
  DOCUMENTOS_INTERNOS: "/colaborador/auditoria/documentos-internos",
  USUARIOS: "/colaborador/auditoria/usuarios",
  ACESSOS: "/colaborador/auditoria/acessos",
  LOGINS: "/colaborador/auditoria/logins",
  EVENTS: "/colaborador/auditoria/events",
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export default function AuditoriaHomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // ✅ começa aberto
  const [openGov, setOpenGov] = useState(true);

  // ✅ evita duplicar evento (dev/strict mode)
  const didLogRef = useRef(false);

  async function registrarEventoCentral(payload: any) {
    // ✅ Não trava a tela se a API falhar
    try {
      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // não bloqueia o acesso
    }
  }

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;

    setReady(true);

    // ✅ registra acesso à área admin (somente 1 vez)
    if (!didLogRef.current) {
      didLogRef.current = true;

      const session = getSession();
      const atISO = new Date().toISOString();

      const cpf = onlyDigits(session?.cpf || "");

      registrarEventoCentral({
        type: "ADMIN_AREA_ACESSO",
        module: "auditoria",
        entity: "AuditoriaHome",
        entityId: "home",
        entityTitle: "Auditoria & Evidências",
        cpf,
        nome: session?.nome || "",
        perfil: session?.perfil || "",
        empresa: session?.empresa || "",
        atISO,
        obs: "",
        meta: {
          route: "/colaborador/auditoria",
        },
      });
    }
  }, [router]);

  const govBtnLabel = useMemo(() => (openGov ? "Recolher" : "Detalhes"), [openGov]);

  if (!ready) {
    return (
      <main className="section gray" aria-busy="true">
        <div className="container">
          <p style={{ opacity: 0.85, fontWeight: 700 }}>Validando permissões de acesso…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        <div className="adminHeader">
          <h1 className="adminTitle">Auditoria & Evidências — Governança e Controles Internos (Admin)</h1>
          <div className="bar" />
          <p className="adminDesc">
            Acesso restrito a perfis administrativos. Este ambiente consolida registros formais de governança, evidências e
            documentos internos, destinados à auditoria interna e ao atendimento de requisitos de compliance, LGPD/PLDFT e controles
            operacionais. Recomenda-se registrar apenas informações necessárias, objetivas e verificáveis.
          </p>
        </div>

        <div className="adminGrid">
          {/* ✅ GOVERNANÇA (FULL WIDTH) */}
          <section className={`adminCard govCard ${openGov ? "expanded" : ""}`} aria-label="Governança e Perfis">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                🧩
              </div>

              <div className="adminCardHeadText">
                <div className="adminCardTitleRow">
                  <div>
                    <div className="adminCardTitle">Governança & Perfis</div>
                    <div className="adminCardText">
                      Estrutura formal de perfis administrativos do Portal do Colaborador: responsabilidades, segregação de funções e
                      critérios de acesso. Base para rastreabilidade e conformidade em auditorias internas.
                    </div>
                  </div>

                  <button type="button" className="miniBtn" onClick={() => setOpenGov((v) => !v)} aria-expanded={openGov}>
                    {govBtnLabel}
                  </button>
                </div>
              </div>
            </div>

            {openGov ? (
              <div className="govDetailsGrid">
                <div className="govBox">
                  <div className="govBoxTitle">Perfis Administrativos do Portal</div>

                  <div className="tableWrap" role="region" aria-label="Perfis Administrativos do Portal">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Perfil</th>
                          <th>Finalidade</th>
                          <th>Capacidade operacional</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="mono">ADMIN_GESTOR</td>
                          <td>Diretrizes e governança</td>
                          <td>Não operacional</td>
                        </tr>
                        <tr>
                          <td className="mono">ADMIN_COMPLIANCE</td>
                          <td>Operação e registro de evidências</td>
                          <td>Operacional</td>
                        </tr>
                        <tr>
                          <td className="mono">ADMIN_AUDITORIA</td>
                          <td>Verificação e acompanhamento técnico</td>
                          <td>Somente leitura</td>
                        </tr>
                        <tr>
                          <td className="mono">COLABORADOR</td>
                          <td>Usuário final</td>
                          <td>Conteúdos, termos e confirmações</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="govNote">
                    Referência formal: a governança de acessos e segregação de funções é definida em documento interno vigente,
                    disponível em <strong>Documentos Internos</strong>, para fins de auditoria interna e compliance.
                  </div>

                  <div className="govActionRow">
                    <Link className="btn btn-outline" href={ROUTES.DOCUMENTOS_INTERNOS} style={{ width: "100%", textAlign: "center" }}>
                      Abrir documento de governança (Documentos Internos)
                    </Link>
                  </div>
                </div>

                <div className="govBox">
                  <div className="govBoxTitle">Distribuição Atual de Perfis (Admin)</div>

                  <div className="tableWrap" role="region" aria-label="Distribuição Atual de Perfis">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Pessoa</th>
                          <th>Perfil</th>
                          <th>Justificativa de segregação</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Micaele da Silva Melo</td>
                          <td className="mono">ADMIN_GESTOR</td>
                          <td>Governança e decisão estratégica</td>
                        </tr>
                        <tr>
                          <td>Thaise Morais da Silva</td>
                          <td className="mono">ADMIN_COMPLIANCE</td>
                          <td>Execução e registro de evidências</td>
                        </tr>
                        <tr>
                          <td>Cynthia Mylena Lopes de Andrade</td>
                          <td className="mono">ADMIN_COMPLIANCE</td>
                          <td>Execução e registro de evidências</td>
                        </tr>
                        <tr>
                          <td>Wantuiller de Oliveira Trindade</td>
                          <td className="mono">ADMIN_AUDITORIA (read-only)</td>
                          <td>Verificação técnica, sem poder operacional</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="govHint">
                    Próximo passo (planejado): incluir uma tela auditável de “Atualizar distribuição de perfis”, sem necessidade de
                    edição de código.
                  </div>
                </div>
              </div>
            ) : (
              <div className="govCollapsedHint">
                Clique em <strong>Detalhes</strong> para visualizar perfis e distribuição atual.
              </div>
            )}
          </section>

          {/* ✅ CENTRAL DE EVIDÊNCIAS */}
          <section className="adminCard" aria-label="Central de Evidências">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                🧾
              </div>
              <div>
                <div className="adminCardTitle">Central de Evidências</div>
                <div className="adminCardText">
                  Registro e consolidação de evidências administrativas por CPF, vinculadas a atividades e controles internos.
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-yellow" href={ROUTES.EVIDENCIAS} style={{ width: "100%", textAlign: "center" }}>
                Acessar Central de Evidências
              </Link>
            </div>
          </section>

          {/* ✅ DOCUMENTOS INTERNOS */}
          <section className="adminCard" aria-label="Documentos Internos">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                📁
              </div>
              <div>
                <div className="adminCardTitle">Documentos Internos</div>
                <div className="adminCardText">
                  Repositório de documentos vigentes (políticas, procedimentos e governança). Base oficial para auditoria interna e compliance.
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-outline" href={ROUTES.DOCUMENTOS_INTERNOS} style={{ width: "100%", textAlign: "center" }}>
                Acessar Documentos Internos
              </Link>
            </div>
          </section>

          {/* ✅ USUÁRIOS & PERFIS */}
          <section className="adminCard" aria-label="Usuários e Perfis">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                👤
              </div>
              <div>
                <div className="adminCardTitle">Usuários & Perfis</div>
                <div className="adminCardText">
                  Controle operacional de acessos: define Perfil (ADMIN/COLABORADOR) e Status (ATIVO/INATIVO), com trilha de auditoria.
                  Evidência exportável em PDF.
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-outline" href={ROUTES.USUARIOS} style={{ width: "100%", textAlign: "center" }}>
                Abrir Usuários & Perfis
              </Link>
            </div>
          </section>

          {/* ✅ REGISTRO DE ALTERAÇÕES */}
          <section className="adminCard" aria-label="Registro de Alterações de Acesso">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                🛡️
              </div>
              <div>
                <div className="adminCardTitle">Registro de Alterações de Acesso</div>
                <div className="adminCardText">
                  Trilha de auditoria do controle de acessos: registra quem alterou perfil/status, usuário afetado, data/hora e antes/depois.
                  Evidência exportável (EY).
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-outline" href={ROUTES.ACESSOS} style={{ width: "100%", textAlign: "center" }}>
                Abrir registro de alterações
              </Link>
            </div>
          </section>

          {/* ✅ LOG DE LOGIN */}
          <section className="adminCard" aria-label="Log de Login">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                🔐
              </div>
              <div>
                <div className="adminCardTitle">Log de Login</div>
                <div className="adminCardText">
                  Histórico de autenticações no portal. Registra sucesso e falha, com data/hora, IP e contexto técnico.
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-outline" href={ROUTES.LOGINS} style={{ width: "100%", textAlign: "center" }}>
                Abrir log de login
              </Link>
            </div>
          </section>

          {/* ✅ LOGGER CENTRAL */}
          <section className="adminCard" aria-label="Logger Central — Eventos">
            <div className="adminCardHead">
              <div className="adminIcon" aria-hidden="true">
                🧠
              </div>
              <div>
                <div className="adminCardTitle">Logger Central — Eventos</div>
                <div className="adminCardText">
                  Registro centralizado de ações do portal (treinamentos, termos, provas e ações administrativas), para rastreabilidade e auditoria.
                </div>
              </div>
            </div>

            <div className="adminCardActions">
              <Link className="btn btn-outline" href={ROUTES.EVENTS} style={{ width: "100%", textAlign: "center" }}>
                Abrir Logger Central
              </Link>
            </div>
          </section>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn btn-outline" href={ROUTES.HOME}>
            ← Voltar à Área do Colaborador
          </Link>
        </div>

        <style jsx global>{`
          .adminHeader {
            margin-bottom: 14px;
          }
          .adminTitle {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            color: #0b1f3a;
          }
          .adminDesc {
            margin: 10px 0 0;
            max-width: 920px;
            font-size: 13px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.65);
            line-height: 1.45;
          }

          .adminGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 14px;
            align-items: start;
          }
          .govCard {
            grid-column: 1 / -1;
          }
          @media (max-width: 980px) {
            .adminGrid {
              grid-template-columns: 1fr;
            }
            .govCard {
              grid-column: auto;
            }
          }

          .adminCard {
            position: relative;
            z-index: 1;
            padding: 16px !important;
            border-radius: 18px !important;
            background: #fff !important;
            border: 1px solid rgba(10, 42, 106, 0.1) !important;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06) !important;
            display: flex;
            flex-direction: column;
            min-height: 160px;
          }
          .govCard.expanded {
            z-index: 20;
          }

          .adminCardHead {
            display: flex;
            gap: 10px;
            align-items: flex-start;
          }
          .adminIcon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            background: rgba(11, 79, 217, 0.08);
            border: 1px solid rgba(11, 79, 217, 0.12);
            flex: 0 0 auto;
          }

          .adminCardHeadText {
            width: 100%;
          }
          .adminCardTitleRow {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }
          .adminCardTitle {
            font-weight: 900;
            font-size: 16px;
            margin: 0;
          }
          .adminCardText {
            margin-top: 4px;
            font-size: 13px;
            font-weight: 650;
            color: rgba(0, 0, 0, 0.72);
            line-height: 1.35;
          }
          .adminCardActions {
            margin-top: auto;
            padding-top: 12px;
          }

          .miniBtn {
            border: 1px solid rgba(10, 42, 106, 0.14);
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            color: #0a2a6a;
            cursor: pointer;
            white-space: nowrap;
          }

          .govDetailsGrid {
            margin-top: 12px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          @media (max-width: 980px) {
            .govDetailsGrid {
              grid-template-columns: 1fr;
            }
          }
          .govCollapsedHint {
            margin-top: 12px;
            font-size: 12px;
            font-weight: 800;
            opacity: 0.7;
          }

          .govBox {
            border-radius: 16px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: linear-gradient(180deg, #fff, #f7f9ff);
            padding: 12px;
          }
          .govBoxTitle {
            font-weight: 900;
            font-size: 13px;
            margin-bottom: 10px;
            color: #0b1f3a;
          }
          .govNote {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 800;
            color: rgba(0, 0, 0, 0.65);
            border-top: 1px dashed rgba(10, 42, 106, 0.18);
            padding-top: 10px;
          }
          .govHint {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 800;
            opacity: 0.7;
          }
          .govActionRow {
            margin-top: 10px;
          }

          .tableWrap {
            width: 100%;
            overflow: visible;
            border-radius: 14px;
            border: 1px solid rgba(10, 42, 106, 0.08);
            background: #fff;
          }
          .tbl {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          @media (max-width: 980px) {
            .tableWrap {
              overflow-x: auto;
            }
            .tbl {
              min-width: 620px;
              table-layout: auto;
            }
          }

          .tbl th,
          .tbl td {
            border-bottom: 1px solid rgba(10, 42, 106, 0.08);
            padding: 10px 10px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.75);
            vertical-align: top;
            word-break: break-word;
          }
          .tbl th {
            font-weight: 900;
            color: #0a2a6a;
            background: rgba(11, 79, 217, 0.05);
          }

          .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-weight: 900;
            color: #0a2a6a;
            word-break: break-word;
          }
        `}</style>
      </div>
    </main>
  );
}
