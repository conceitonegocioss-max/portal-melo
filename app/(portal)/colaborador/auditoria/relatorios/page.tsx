"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";

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

const REPORTS = [
  { id: "TODOS", label: "Todos os eventos", hint: "Visão geral do logger central." },
  { id: "TREINAMENTOS", label: "Treinamentos", hint: "Conclusões registradas por colaborador/CPF." },
  { id: "PROVAS", label: "Provas", hint: "Avaliações, pontuações e aprovações registradas." },
  { id: "TERMOS", label: "Termos", hint: "Ciência em termo de confidencialidade e documentos obrigatórios." },
  { id: "SCRIPTS", label: "Scripts", hint: "Ciência dos scripts operacionais por versão." },
  { id: "ACESSOS", label: "Acessos", hint: "Login, perfil, alterações e eventos administrativos." },
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

function reportMatch(item: AuditEventEntry, report: string) {
  const type = String(item.type || "").toUpperCase();
  const module = String(item.module || "").toUpperCase();
  const entity = String(item.entityTitle || item.entityId || "").toUpperCase();

  if (report === "TODOS") return true;
  if (report === "TREINAMENTOS") return type.includes("TREINAMENTO") || module.includes("TREINAMENTO");
  if (report === "PROVAS") return type.includes("PROVA") || module.includes("PROVA") || entity.includes("PROVA");
  if (report === "TERMOS") return type.includes("TERMO") || module.includes("TERMO") || entity.includes("TERMO") || entity.includes("CONFIDENCIALIDADE");
  if (report === "SCRIPTS") return type.includes("SCRIPT") || module.includes("SCRIPT") || entity.includes("SCRIPT");
  if (report === "ACESSOS") return type.includes("LOGIN") || type.includes("ACESSO") || type.includes("ADMIN") || module.includes("AUDITORIA");
  return true;
}

export default function RelatoriosAuditoriaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AuditEventEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState("TREINAMENTOS");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/audit/events?all=1", { method: "GET" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Falha ao carregar relatórios.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErr("Não foi possível carregar os registros de auditoria.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }
    if (session.perfil !== "ADMIN") {
      router.replace("/colaborador");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

    return items
      .filter((it) => reportMatch(it, report))
      .filter((it) => {
        const t = it.atISO ? new Date(it.atISO).getTime() : 0;
        if (fromTime && t < fromTime) return false;
        if (toTime && t > toTime) return false;
        if (!query) return true;

        const hay = [
          it.type,
          it.actorCpf,
          it.actorNome,
          it.actorPerfil,
          it.actorEmpresa,
          it.targetCpf,
          it.module,
          it.entityId,
          it.entityTitle,
          it.obs,
          it.ip,
          it.meta ? JSON.stringify(it.meta) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(query);
      });
  }, [items, report, q, from, to]);

  const stats = useMemo(() => {
    const cpfs = new Set<string>();
    const modulos = new Set<string>();
    for (const it of filtered) {
      if (it.actorCpf) cpfs.add(it.actorCpf);
      if (it.module) modulos.add(it.module);
    }
    return {
      registros: filtered.length,
      colaboradores: cpfs.size,
      modulos: modulos.size,
    };
  }, [filtered]);

  function exportarCsv() {
    const header = ["Data/Hora", "Tipo", "Colaborador", "CPF", "Empresa", "Módulo", "Item", "Status/Obs", "IP"];
    const rows = filtered.map((it) => [
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
    a.download = `relatorio-auditoria-${report.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function imprimir() {
    window.print();
  }

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container"><p>Carregando…</p></div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container reportPage">
        <div className="noPrint" style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador" className="btn btn-outline small">← Área do Colaborador</Link>
        </div>

        <div className="reportHeader">
          <div>
            <h1>Relatórios de Auditoria</h1>
            <div className="bar" />
            <p>
              Painel administrativo para consulta, filtro, impressão e exportação de registros do Portal do Colaborador.
            </p>
          </div>
          <div className="reportStamp">
            <strong>Gerado em:</strong><br />{formatDate(new Date().toISOString())}
          </div>
        </div>

        <div className="reportCards noPrint">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`reportType ${report === r.id ? "active" : ""}`}
              onClick={() => setReport(r.id)}
            >
              <strong>{r.label}</strong>
              <span>{r.hint}</span>
            </button>
          ))}
        </div>

        <div className="reportTools noPrint">
          <input className="reportInput" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, CPF, empresa, módulo ou item..." />
          <input className="reportDate" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="reportDate" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="btn btn-yellow small" onClick={exportarCsv} disabled={filtered.length === 0}>Exportar Excel/CSV</button>
          <button className="btn btn-outline small" onClick={imprimir} disabled={filtered.length === 0}>Imprimir / Salvar PDF</button>
          <button className="btn btn-outline small" onClick={load}>Atualizar</button>
        </div>

        <div className="reportSummary">
          <div><span>Registros</span><strong>{stats.registros}</strong></div>
          <div><span>Colaboradores/CPFs</span><strong>{stats.colaboradores}</strong></div>
          <div><span>Módulos</span><strong>{stats.modulos}</strong></div>
          <div><span>Relatório</span><strong>{REPORTS.find((r) => r.id === report)?.label || report}</strong></div>
        </div>

        <div className="reportTableCard">
          {loading ? (
            <p>Carregando registros…</p>
          ) : err ? (
            <p className="reportError">{err}</p>
          ) : filtered.length === 0 ? (
            <p>Nenhum registro encontrado para os filtros selecionados.</p>
          ) : (
            <table className="reportTable">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Colaborador</th>
                  <th>CPF</th>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Módulo</th>
                  <th>Item / Evidência</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 500).map((it) => (
                  <tr key={it.id}>
                    <td>{formatDate(it.atISO)}</td>
                    <td><strong>{it.actorNome || "—"}</strong></td>
                    <td>{it.actorCpf || "—"}</td>
                    <td>{it.actorEmpresa || "—"}</td>
                    <td><code>{it.type || "—"}</code></td>
                    <td>{it.module || "—"}</td>
                    <td>{it.entityTitle || it.entityId || "—"}</td>
                    <td>{it.obs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="reportNote">
          Nota de auditoria: os registros apresentados são extraídos do Logger Central do Portal do Colaborador e devem ser utilizados como evidência complementar de rastreabilidade, ciência, conclusão, avaliação ou ação administrativa, conforme o tipo de evento registrado.
        </p>
      </div>

      <style jsx global>{`
        .reportPage { max-width: 1180px; }
        .reportHeader { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 16px; }
        .reportHeader h1 { margin: 0; font-size: 34px; color: #0b2a6f; font-weight: 900; }
        .reportHeader p { margin: 10px 0 0; max-width: 780px; font-size: 14px; font-weight: 700; color: rgba(0,0,0,.68); line-height: 1.45; }
        .reportStamp { background: #fff; border: 1px solid rgba(10,42,106,.12); border-radius: 14px; padding: 12px 14px; font-size: 12px; box-shadow: 0 10px 26px rgba(0,0,0,.05); }
        .reportCards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
        .reportType { text-align: left; border: 1px solid rgba(10,42,106,.12); background: #fff; border-radius: 16px; padding: 14px; cursor: pointer; box-shadow: 0 10px 22px rgba(0,0,0,.04); }
        .reportType strong { display: block; color: #0b2a6f; font-size: 15px; font-weight: 900; }
        .reportType span { display: block; margin-top: 5px; font-size: 12px; font-weight: 700; color: rgba(0,0,0,.62); line-height: 1.35; }
        .reportType.active { border-color: rgba(255,204,0,.95); background: #fff9db; }
        .reportTools { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 14px 0; }
        .reportInput { flex: 1; min-width: 260px; border: 1px solid rgba(10,42,106,.14); border-radius: 999px; padding: 10px 13px; font-weight: 700; background: #fff; outline: none; }
        .reportDate { border: 1px solid rgba(10,42,106,.14); border-radius: 999px; padding: 9px 11px; font-weight: 800; background: #fff; }
        .reportSummary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 14px 0; }
        .reportSummary div { background: #fff; border: 1px solid rgba(10,42,106,.10); border-radius: 15px; padding: 13px; box-shadow: 0 10px 24px rgba(0,0,0,.04); }
        .reportSummary span { display: block; font-size: 12px; color: rgba(0,0,0,.62); font-weight: 800; }
        .reportSummary strong { display: block; margin-top: 4px; color: #0b2a6f; font-size: 22px; font-weight: 900; }
        .reportTableCard { background: #fff; border: 1px solid rgba(10,42,106,.10); border-radius: 16px; padding: 12px; box-shadow: 0 12px 28px rgba(0,0,0,.05); overflow: auto; }
        .reportTable { width: 100%; border-collapse: collapse; min-width: 1050px; }
        .reportTable th, .reportTable td { padding: 10px; border-bottom: 1px solid rgba(0,0,0,.07); text-align: left; vertical-align: top; font-size: 12px; font-weight: 700; }
        .reportTable th { background: #f6f8fe; color: #0b2a6f; font-weight: 900; }
        .reportTable code { font-family: monospace; font-size: 11px; }
        .reportNote { font-size: 12px; font-weight: 700; color: rgba(0,0,0,.62); margin: 12px 0 0; }
        .reportError { color: #8b0000; font-weight: 900; }
        @media (max-width: 900px) { .reportCards, .reportSummary { grid-template-columns: 1fr; } .reportHeader { flex-direction: column; } }
        @media print {
          .noPrint, header, nav, .topbar, .siteHeader, footer { display: none !important; }
          body { background: #fff !important; }
          .section.gray { background: #fff !important; padding: 0 !important; }
          .container { max-width: 100% !important; width: 100% !important; }
          .reportHeader h1 { font-size: 24px; }
          .reportTableCard, .reportSummary div, .reportStamp { box-shadow: none !important; }
          .reportTable { min-width: 0; }
          .reportTable th, .reportTable td { font-size: 9px; padding: 6px; }
        }
      `}</style>
    </main>
  );
}
