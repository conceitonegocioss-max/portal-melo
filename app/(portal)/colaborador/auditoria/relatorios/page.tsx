"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";

type AuditEventEntry = {
  id: string;
  atISO: string;
  type: string;
  actorCpf?: string;
  actorNome?: string;
  actorPerfil?: string;
  actorEmpresa?: string;
  targetCpf?: string;
  module?: string;
  entityId?: string;
  entityTitle?: string;
  meta?: Record<string, any>;
  obs?: string;
  ip?: string;
  userAgent?: string;
};

type ReportCard = {
  icon: string;
  title: string;
  text: string;
  href: string;
  button: string;
  tag: string;
  tone?: "yellow" | "outline";
};

const REPORT_CARDS: ReportCard[] = [
  {
    icon: "🧾",
    title: "Dossiê por Colaborador",
    text: "Consulta individual de evidências: treinamentos, provas vinculadas, notas, pendências e detalhe por colaborador.",
    href: "/colaborador/auditoria/evidencias",
    button: "Abrir Central de Evidências",
    tag: "Consulta individual",
    tone: "yellow",
  },
  {
    icon: "📚",
    title: "Controle de Treinamentos",
    text: "Relatório consolidado de treinamentos concluídos, por colaborador, CPF, empresa, data/hora e categoria.",
    href: "/colaborador/auditoria/treinamentos-controle",
    button: "Abrir Treinamentos",
    tag: "Exportação",
  },
  {
    icon: "📝",
    title: "Resultados das Provas",
    text: "Relatório final por colaborador/prova: nota, aprovação/reprovação, tentativa registrada e data/hora.",
    href: "/colaborador/auditoria/provas-resultados",
    button: "Abrir Resultados",
    tag: "Exportação",
  },
  {
    icon: "🎓",
    title: "Certificações",
    text: "Controle de Consignado, LGPD e PLDFT, com status, vencimentos, pendências e exportação para auditoria.",
    href: "/colaborador/auditoria/certificacoes",
    button: "Abrir Certificações",
    tag: "Controle",
  },
  {
    icon: "👤",
    title: "Usuários & Perfis",
    text: "Relatório de usuários, perfil do portal, perfil de auditoria, status ativo/inativo e senha inicial.",
    href: "/colaborador/auditoria/usuarios",
    button: "Abrir Usuários",
    tag: "Controle de acesso",
  },
  {
    icon: "🛡️",
    title: "Alterações de Acesso",
    text: "Histórico específico das alterações de status/perfil, com antes/depois, responsável e data/hora.",
    href: "/colaborador/auditoria/acessos",
    button: "Abrir Alterações",
    tag: "Rastreabilidade",
  },
  {
    icon: "🔐",
    title: "Log de Login",
    text: "Consulta dos acessos ao portal, autenticações, falhas, IP, data/hora e contexto técnico.",
    href: "/colaborador/auditoria/logins",
    button: "Abrir Log de Login",
    tag: "Segurança",
  },
  {
    icon: "🧠",
    title: "Logger Central Completo",
    text: "Base técnica completa dos eventos do portal. Use como trilha bruta de rastreabilidade quando necessário.",
    href: "/colaborador/auditoria/events",
    button: "Abrir Logger",
    tag: "Histórico bruto",
  },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso || "—";
  }
}

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function reportTypeCount(items: AuditEventEntry[], predicate: (item: AuditEventEntry) => boolean) {
  return items.filter(predicate).length;
}

function exportarLoggerCsv(items: AuditEventEntry[]) {
  const header = ["Data/Hora", "Tipo", "Colaborador", "CPF", "Empresa", "Modulo", "Item", "Observacao", "IP"];
  const rows = items.map((it) => [
    formatDate(it.atISO),
    it.type || "",
    it.actorNome || "",
    it.actorCpf || "",
    it.actorEmpresa || "",
    it.module || "",
    it.entityTitle || it.entityId || "",
    it.obs || "",
    it.ip || "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `logger-central-completo-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ReportTile({ card }: { card: ReportCard }) {
  return (
    <section className="reportTile" aria-label={card.title}>
      <div className="tileHead">
        <div className="tileIcon" aria-hidden="true">{card.icon}</div>
        <div>
          <div className="tileTag">{card.tag}</div>
          <div className="tileTitle">{card.title}</div>
        </div>
      </div>
      <p className="tileText">{card.text}</p>
      <div className="tileActions">
        <Link className={`btn ${card.tone === "yellow" ? "btn-yellow" : "btn-outline"}`} href={card.href} style={{ width: "100%", textAlign: "center" }}>
          {card.button}
        </Link>
      </div>
    </section>
  );
}

export default function RelatoriosAuditoriaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AuditEventEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/audit/events?all=1", { method: "GET", cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Falha ao carregar resumo.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErr("Não foi possível carregar o resumo do Logger Central.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    setReady(true);
    void load();
  }, [router]);

  const stats = useMemo(() => {
    const cpfs = new Set<string>();
    const modules = new Set<string>();

    for (const it of items) {
      if (it.actorCpf) cpfs.add(String(it.actorCpf));
      if (it.module) modules.add(String(it.module));
    }

    return {
      eventos: items.length,
      colaboradores: cpfs.size,
      modulos: modules.size,
      treinamentos: reportTypeCount(items, (it) => String(it.type || "").includes("TREINAMENTO")),
      provas: reportTypeCount(items, (it) => String(it.type || "").includes("PROVA")),
      acessos: reportTypeCount(items, (it) => {
        const t = String(it.type || "").toUpperCase();
        return t.includes("LOGIN") || t.includes("ACESSO") || t.includes("ADMIN") || t.includes("USUARIO");
      }),
    };
  }, [items]);

  if (!ready) {
    return (
      <main className="section gray">
        <div className="container"><p>Carregando…</p></div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container reportHubPage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador" className="btn btn-outline small">← Área do Colaborador</Link>
        </div>

        <header className="reportHero">
          <div>
            <h1>Relatórios de Auditoria</h1>
            <div className="bar" />
            <p>
              Painel para emissão, consulta e exportação dos relatórios formais do Portal do Colaborador. A Central de Evidências fica reservada ao dossiê individual por colaborador.
            </p>
          </div>
          <div className="stampBox">
            <span>Atualizado em</span>
            <strong>{formatDate(new Date().toISOString())}</strong>
          </div>
        </header>

        <section className="summaryBox" aria-label="Resumo do Logger Central">
          <div className="summaryHead">
            <div>
              <strong>Resumo geral do Logger Central</strong>
              <span>{loading ? "Carregando registros..." : err ? err : "Dados técnicos usados como base para relatórios e rastreabilidade."}</span>
            </div>
            <div className="summaryActions noPrint">
              <button className="btn btn-outline small" type="button" onClick={load}>Atualizar</button>
              <button className="btn btn-yellow small" type="button" disabled={items.length === 0} onClick={() => exportarLoggerCsv(items)}>
                Exportar Logger CSV
              </button>
            </div>
          </div>

          <div className="statsGrid">
            <div><span>Eventos</span><strong>{stats.eventos}</strong></div>
            <div><span>Colaboradores/CPFs</span><strong>{stats.colaboradores}</strong></div>
            <div><span>Módulos</span><strong>{stats.modulos}</strong></div>
            <div><span>Treinamentos</span><strong>{stats.treinamentos}</strong></div>
            <div><span>Provas</span><strong>{stats.provas}</strong></div>
            <div><span>Acessos/Admin</span><strong>{stats.acessos}</strong></div>
          </div>
        </section>

        <section className="guidanceBox">
          <strong>Como usar esta área:</strong>
          <span>
            Use os cards abaixo para abrir o relatório específico, aplicar filtros e exportar em Excel/CSV ou imprimir/salvar PDF. Para analisar uma pessoa específica, utilize a Central de Evidências.
          </span>
        </section>

        <div className="reportGrid">
          {REPORT_CARDS.map((card) => <ReportTile key={card.title} card={card} />)}
        </div>

        <section className="reportNote">
          <strong>Nota de auditoria:</strong> esta página funciona como índice de relatórios e exportações. O histórico bruto permanece no Logger Central, enquanto os relatórios específicos apresentam visões filtradas e mais adequadas para anexos de auditoria.
        </section>
      </div>

      <style jsx global>{`
        .reportHubPage { max-width: 1280px; }
        .topActions { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .reportHero { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; flex-wrap:wrap; margin-bottom:16px; }
        .reportHero h1 { margin:0; font-size:34px; color:#0b2a6f; font-weight:950; letter-spacing:-.02em; }
        .reportHero p { margin:10px 0 0; max-width:820px; font-size:14px; font-weight:750; color:rgba(0,0,0,.68); line-height:1.45; }
        .stampBox { background:#fff; border:1px solid rgba(10,42,106,.12); border-radius:16px; padding:12px 14px; min-width:180px; box-shadow:0 12px 28px rgba(15,23,42,.05); }
        .stampBox span { display:block; font-size:11px; font-weight:850; opacity:.65; }
        .stampBox strong { display:block; margin-top:4px; font-size:12px; color:#0a2a6a; }
        .summaryBox { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:20px; padding:16px; box-shadow:0 12px 30px rgba(15,23,42,.06); margin:16px 0; }
        .summaryHead { display:flex; justify-content:space-between; gap:14px; align-items:center; flex-wrap:wrap; margin-bottom:14px; }
        .summaryHead strong { display:block; color:#0a2a6a; font-size:15px; font-weight:950; }
        .summaryHead span { display:block; margin-top:4px; font-size:12px; font-weight:750; opacity:.7; }
        .summaryActions { display:flex; gap:8px; flex-wrap:wrap; }
        .statsGrid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px; }
        .statsGrid div { background:linear-gradient(180deg,#fff,#f7f9ff); border:1px solid rgba(10,42,106,.1); border-radius:16px; padding:11px; }
        .statsGrid span { display:block; font-size:11px; font-weight:850; opacity:.65; }
        .statsGrid strong { display:block; margin-top:4px; font-size:22px; color:#0a2a6a; font-weight:950; }
        .guidanceBox { display:flex; gap:8px; align-items:flex-start; background:#fff9dd; border:1px solid rgba(244,196,0,.35); border-radius:16px; padding:12px 14px; font-size:12px; font-weight:800; color:rgba(0,0,0,.72); line-height:1.45; margin:16px 0; }
        .guidanceBox strong { color:#0a2a6a; white-space:nowrap; }
        .reportGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:16px; }
        .reportTile { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:20px; padding:16px; box-shadow:0 12px 28px rgba(15,23,42,.055); min-height:170px; display:flex; flex-direction:column; }
        .tileHead { display:flex; align-items:flex-start; gap:10px; }
        .tileIcon { width:40px; height:40px; border-radius:14px; display:grid; place-items:center; background:rgba(11,79,217,.08); border:1px solid rgba(11,79,217,.12); flex:0 0 auto; }
        .tileTag { display:inline-flex; border-radius:999px; padding:4px 8px; background:#f3f5f9; border:1px solid rgba(10,42,106,.08); color:#0a2a6a; font-size:10px; font-weight:950; text-transform:uppercase; letter-spacing:.03em; }
        .tileTitle { margin-top:6px; color:#0b1f3a; font-size:16px; font-weight:950; }
        .tileText { margin:10px 0 0; font-size:13px; line-height:1.4; color:rgba(0,0,0,.7); font-weight:700; }
        .tileActions { margin-top:auto; padding-top:14px; }
        .reportNote { margin:16px 0 0; background:#fff; border:1px dashed rgba(10,42,106,.18); border-radius:16px; padding:12px 14px; font-size:12px; line-height:1.45; font-weight:750; color:rgba(0,0,0,.68); }
        .reportNote strong { color:#0a2a6a; }
        @media (max-width: 980px) { .reportGrid { grid-template-columns:1fr; } .statsGrid { grid-template-columns:repeat(2,minmax(0,1fr)); } .stampBox { width:100%; } .guidanceBox { display:block; } .guidanceBox span { display:block; margin-top:4px; } }
        @media print { .noPrint { display:none!important; } .reportTile, .summaryBox, .guidanceBox, .reportNote { box-shadow:none!important; } }
      `}</style>
    </main>
  );
}
