"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { getSession } from "@/src/lib/auth";

const ROUTES = {
  HOME: "/colaborador",
  EVIDENCIAS: "/colaborador/auditoria/evidencias",
  RELATORIOS: "/colaborador/auditoria/relatorios",
  DOCUMENTOS_INTERNOS: "/colaborador/auditoria/documentos-internos",
  USUARIOS: "/colaborador/auditoria/usuarios",
  CERTIFICACOES: "/colaborador/auditoria/certificacoes",
  ACESSOS: "/colaborador/auditoria/acessos",
  LOGINS: "/colaborador/auditoria/logins",
  EVENTS: "/colaborador/auditoria/events",
  TREINAMENTOS: "/colaborador/treinamentos",
  PROVAS: "/colaborador/provas",
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function AdminCard({
  icon,
  title,
  text,
  href,
  button,
  tone = "outline",
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
  button: string;
  tone?: "yellow" | "outline";
}) {
  return (
    <section className="adminCard" aria-label={title}>
      <div className="adminCardHead">
        <div className="adminIcon" aria-hidden="true">{icon}</div>
        <div>
          <div className="adminCardTitle">{title}</div>
          <div className="adminCardText">{text}</div>
        </div>
      </div>
      <div className="adminCardActions">
        <Link className={`btn ${tone === "yellow" ? "btn-yellow" : "btn-outline"}`} href={href} style={{ width: "100%", textAlign: "center" }}>
          {button}
        </Link>
      </div>
    </section>
  );
}

export default function AuditoriaHomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [openGov, setOpenGov] = useState(true);
  const didLogRef = useRef(false);

  async function registrarEventoCentral(payload: any) {
    try {
      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  }

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    setReady(true);

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
        meta: { route: "/colaborador/auditoria" },
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
      <div className="container auditoriaPage">
        <div className="adminHeader">
          <h1 className="adminTitle">Auditoria & Evidências</h1>
          <div className="bar" />
          <p className="adminDesc">
            Painel administrativo para governança, controles internos, evidências, treinamentos, provas, certificações e rastreabilidade do Portal do Colaborador.
          </p>
        </div>

        <section className={`adminCard govCard ${openGov ? "expanded" : ""}`} aria-label="Governança e Perfis">
          <div className="adminCardHead">
            <div className="adminIcon" aria-hidden="true">🧩</div>
            <div className="adminCardHeadText">
              <div className="adminCardTitleRow">
                <div>
                  <div className="adminCardTitle">Governança & Perfis Administrativos</div>
                  <div className="adminCardText">
                    Estrutura formal de perfis, responsabilidades e segregação de funções do ambiente administrativo.
                  </div>
                </div>
                <button type="button" className="miniBtn" onClick={() => setOpenGov((v) => !v)} aria-expanded={openGov}>{govBtnLabel}</button>
              </div>
            </div>
          </div>

          {openGov ? (
            <div className="govDetailsGrid">
              <div className="govBox">
                <div className="govBoxTitle">Perfis do Portal</div>
                <div className="tableWrap" role="region" aria-label="Perfis Administrativos do Portal">
                  <table className="tbl">
                    <thead><tr><th>Perfil</th><th>Finalidade</th><th>Capacidade</th></tr></thead>
                    <tbody>
                      <tr><td className="mono">ADMIN_GESTOR</td><td>Diretrizes e governança</td><td>Não operacional</td></tr>
                      <tr><td className="mono">ADMIN_COMPLIANCE</td><td>Operação e registro de evidências</td><td>Operacional</td></tr>
                      <tr><td className="mono">ADMIN_AUDITORIA</td><td>Verificação e acompanhamento técnico</td><td>Somente leitura</td></tr>
                      <tr><td className="mono">COLABORADOR</td><td>Usuário final</td><td>Treinamentos, provas e termos</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="govNote">
                  Documento de referência disponível em <strong>Documentos Internos</strong>.
                </div>
              </div>

              <div className="govBox">
                <div className="govBoxTitle">Distribuição Atual dos Perfis Administrativos</div>
                <div className="tableWrap" role="region" aria-label="Distribuição Atual de Perfis">
                  <table className="tbl">
                    <thead><tr><th>Pessoa</th><th>Perfil</th><th>Função</th></tr></thead>
                    <tbody>
                      <tr><td>Micaele da Silva Melo</td><td className="mono">ADMIN_GESTOR</td><td>Governança e decisão estratégica</td></tr>
                      <tr><td>Thaise Morais da Silva</td><td className="mono">ADMIN_COMPLIANCE</td><td>Execução e registro de evidências</td></tr>
                      <tr><td>Cynthia Mylena Lopes de Andrade</td><td className="mono">ADMIN_COMPLIANCE</td><td>Execução e registro de evidências</td></tr>
                      <tr><td>Wantuiller de Oliveira Trindade</td><td className="mono">ADMIN_AUDITORIA</td><td>Verificação técnica, sem poder operacional</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="govHint">Base para evidência de governança, segregação e rastreabilidade.</div>
              </div>
            </div>
          ) : (
            <div className="govCollapsedHint">Clique em <strong>Detalhes</strong> para visualizar os perfis administrativos.</div>
          )}
        </section>

        <div className="areaBlock">
          <div className="areaTitle">1. Controles Administrativos</div>
          <div className="adminGrid">
            <AdminCard icon="👤" title="Usuários & Perfis" text="Controle de colaboradores, perfil do portal, perfil de auditoria, status ativo/inativo e senha inicial." href={ROUTES.USUARIOS} button="Abrir Usuários & Perfis" />
            <AdminCard icon="🎓" title="Controle de Certificações" text="Controle específico de Consignado, LGPD e PLDFT, com status, datas de vencimento e histórico salvo." href={ROUTES.CERTIFICACOES} button="Abrir Certificações" />
            <AdminCard icon="🛡️" title="Alterações de Acesso" text="Trilha de alterações administrativas: quem alterou, usuário afetado, antes/depois e data/hora." href={ROUTES.ACESSOS} button="Abrir Alterações" />
            <AdminCard icon="🔐" title="Log de Login" text="Histórico de autenticações no portal, incluindo acessos autorizados, falhas, data/hora e contexto técnico." href={ROUTES.LOGINS} button="Abrir Log de Login" />
          </div>
        </div>

        <div className="areaBlock">
          <div className="areaTitle">2. Treinamentos & Avaliações</div>
          <div className="adminGrid">
            <AdminCard icon="📚" title="Treinamentos" text="Acesso aos treinamentos disponibilizados aos colaboradores. A próxima etapa é consolidar início, conclusão e status por CPF." href={ROUTES.TREINAMENTOS} button="Abrir Treinamentos" />
            <AdminCard icon="📝" title="Provas e Avaliações" text="Acesso às provas vinculadas aos treinamentos, com regra de 70% mínimo e limite de tentativas." href={ROUTES.PROVAS} button="Abrir Provas" />
            <AdminCard icon="📊" title="Relatórios de Auditoria" text="Relatórios consolidados para apresentação: treinamentos, provas, termos, scripts, acessos e eventos gerais." href={ROUTES.RELATORIOS} button="Abrir Relatórios" tone="yellow" />
            <AdminCard icon="🧠" title="Logger Central — Eventos" text="Registro centralizado das ações do portal, incluindo treinamentos, termos, provas e controles administrativos." href={ROUTES.EVENTS} button="Abrir Logger Central" />
          </div>
        </div>

        <div className="areaBlock">
          <div className="areaTitle">3. Evidências, Documentos & Compliance</div>
          <div className="adminGrid">
            <AdminCard icon="🧾" title="Central de Evidências" text="Registro e consolidação de evidências administrativas por CPF, vinculadas a atividades e controles internos." href={ROUTES.EVIDENCIAS} button="Acessar Evidências" tone="yellow" />
            <AdminCard icon="📁" title="Documentos Internos" text="Repositório de políticas, procedimentos, governança e documentos vigentes para auditoria e compliance." href={ROUTES.DOCUMENTOS_INTERNOS} button="Acessar Documentos" />
          </div>
        </div>

        <div className="nextStepBox">
          <strong>Próxima organização recomendada:</strong> criar telas específicas para <strong>Controle de Treinamentos</strong> e <strong>Resultados das Provas</strong>, com salvamento definitivo no AuditLog, filtros, exportação Excel/CSV e impressão em PDF.
        </div>

        <div style={{ marginTop: 14 }}><Link className="btn btn-outline" href={ROUTES.HOME}>← Voltar à Área do Colaborador</Link></div>

        <style jsx global>{`
          .auditoriaPage { max-width: 1280px; }
          .adminHeader { margin-bottom: 14px; }
          .adminTitle { margin: 0; font-size: 30px; font-weight: 900; color: #0b1f3a; }
          .adminDesc { margin: 10px 0 0; max-width: 920px; font-size: 13px; font-weight: 750; color: rgba(0,0,0,.65); line-height: 1.45; }
          .areaBlock { margin-top: 18px; }
          .areaTitle { margin: 0 0 10px; font-size: 14px; font-weight: 950; color: #0a2a6a; text-transform: uppercase; letter-spacing: .04em; }
          .adminGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
          @media (max-width: 980px) { .adminGrid { grid-template-columns: 1fr; } }
          .adminCard { position: relative; z-index: 1; padding: 16px !important; border-radius: 18px !important; background: #fff !important; border: 1px solid rgba(10,42,106,.1) !important; box-shadow: 0 12px 28px rgba(15,23,42,.06) !important; display: flex; flex-direction: column; min-height: 150px; }
          .govCard { margin-top: 16px; min-height: auto; }
          .govCard.expanded { z-index: 20; }
          .adminCardHead { display: flex; gap: 10px; align-items: flex-start; }
          .adminIcon { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: rgba(11,79,217,.08); border: 1px solid rgba(11,79,217,.12); flex: 0 0 auto; }
          .adminCardHeadText { width: 100%; }
          .adminCardTitleRow { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
          .adminCardTitle { font-weight: 900; font-size: 16px; margin: 0; color: #0b1f3a; }
          .adminCardText { margin-top: 4px; font-size: 13px; font-weight: 650; color: rgba(0,0,0,.72); line-height: 1.35; }
          .adminCardActions { margin-top: auto; padding-top: 12px; }
          .miniBtn { border: 1px solid rgba(10,42,106,.14); background: rgba(255,255,255,.9); padding: 8px 10px; border-radius: 999px; font-size: 12px; font-weight: 900; color: #0a2a6a; cursor: pointer; white-space: nowrap; }
          .govDetailsGrid { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          @media (max-width: 980px) { .govDetailsGrid { grid-template-columns: 1fr; } }
          .govCollapsedHint { margin-top: 12px; font-size: 12px; font-weight: 800; opacity: .7; }
          .govBox { border-radius: 16px; border: 1px solid rgba(10,42,106,.12); background: linear-gradient(180deg,#fff,#f7f9ff); padding: 12px; }
          .govBoxTitle { font-weight: 900; font-size: 13px; margin-bottom: 10px; color: #0b1f3a; }
          .govNote, .govHint { margin-top: 10px; font-size: 12px; font-weight: 800; color: rgba(0,0,0,.65); }
          .govNote { border-top: 1px dashed rgba(10,42,106,.18); padding-top: 10px; }
          .tableWrap { width: 100%; overflow: visible; border-radius: 14px; border: 1px solid rgba(10,42,106,.08); background: #fff; }
          .tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
          @media (max-width: 980px) { .tableWrap { overflow-x: auto; } .tbl { min-width: 620px; table-layout: auto; } }
          .tbl th, .tbl td { border-bottom: 1px solid rgba(10,42,106,.08); padding: 10px; text-align: left; font-size: 12px; font-weight: 700; color: rgba(0,0,0,.75); vertical-align: top; word-break: break-word; }
          .tbl th { font-weight: 900; color: #0a2a6a; background: rgba(11,79,217,.05); }
          .mono { font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-weight: 900; color: #0a2a6a; word-break: break-word; }
          .nextStepBox { margin-top: 18px; background: #fff9dd; border: 1px solid rgba(244,196,0,.35); border-radius: 16px; padding: 12px 14px; font-size: 12px; font-weight: 800; color: rgba(0,0,0,.72); line-height: 1.45; }
        `}</style>
      </div>
    </main>
  );
}
