"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";

type Item = {
  id: string;
  atISO: string;
  type: string;
  actorCpf: string;
  actorNome: string;
  actorEmpresa: string;
  entityId: string;
  entityTitle: string;
  meta: Record<string, any>;
};

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function statusProva(item: Item) {
  const aprovado = String(item.meta?.aprovado || "").toUpperCase();
  if (aprovado === "SIM" || aprovado === "TRUE") return "APROVADO";
  if (aprovado === "NAO" || aprovado === "NÃO" || aprovado === "FALSE") return "REPROVADO";
  if (item.type === "PROVA_APROVADA") return "APROVADO";
  return "REGISTRADO";
}

export default function ProvasResultadosPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [provaFiltro, setProvaFiltro] = useState("TODAS");

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/audit/events?all=1", { cache: "no-store" });
        const data = await res.json();
        const all = Array.isArray(data?.items) ? data.items : [];
        setItems(all.filter((x: Item) => String(x.type || "").startsWith("PROVA_")));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [ready]);

  const provas = useMemo(() => {
    return ["TODAS", ...Array.from(new Set(items.map((i) => i.entityTitle || i.meta?.provaTitulo || "Prova"))).sort()];
  }, [items]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      const st = statusProva(item);
      const titulo = String(item.entityTitle || item.meta?.provaTitulo || "Prova");
      if (statusFiltro !== "TODOS" && st !== statusFiltro) return false;
      if (provaFiltro !== "TODAS" && titulo !== provaFiltro) return false;
      if (!query) return true;
      const hay = [
        item.actorNome,
        item.actorCpf,
        onlyDigits(item.actorCpf),
        item.actorEmpresa,
        titulo,
        st,
        String(item.meta?.nota ?? ""),
        item.type,
      ].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, statusFiltro, provaFiltro]);

  const resumo = useMemo(() => {
    const enviados = items.filter((i) => i.type === "PROVA_ENVIADA").length;
    const aprovados = items.filter((i) => statusProva(i) === "APROVADO").length;
    const reprovados = items.filter((i) => statusProva(i) === "REPROVADO").length;
    return { total: items.length, enviados, aprovados, reprovados, filtrados: rows.length };
  }, [items, rows.length]);

  function exportarCsv() {
    const header = ["Data/Hora", "Nome", "CPF", "Empresa", "Prova", "Evento", "Nota", "Status"];
    const lines = rows.map((i) => [
      formatDate(i.atISO),
      i.actorNome,
      i.actorCpf,
      i.actorEmpresa || String(i.meta?.empresa || ""),
      i.entityTitle || String(i.meta?.provaTitulo || ""),
      i.type,
      String(i.meta?.nota ?? ""),
      statusProva(i),
    ].map(csvEscape).join(";"));
    const csv = [header.map(csvEscape).join(";"), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados-provas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!ready) return <main className="section gray"><div className="container"><p>Carregando…</p></div></main>;

  return (
    <main className="section gray">
      <div className="container resultadosPage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador/provas" className="btn btn-outline small">Abrir Provas</Link>
        </div>

        <div className="section-title"><h2>Resultados das Provas</h2><div className="bar" /></div>
        <p className="section-text" style={{ maxWidth: 980 }}>Consulta auditável dos eventos de provas registrados no banco: envio, nota, aprovação/reprovação, colaborador, CPF, empresa e data/hora.</p>

        <div className="summaryGrid">
          <div className="summaryCard"><span>Total eventos</span><strong>{resumo.total}</strong></div>
          <div className="summaryCard"><span>Enviadas</span><strong>{resumo.enviados}</strong></div>
          <div className="summaryCard"><span>Aprovados</span><strong>{resumo.aprovados}</strong></div>
          <div className="summaryCard"><span>Reprovados</span><strong>{resumo.reprovados}</strong></div>
          <div className="summaryCard"><span>Filtrados</span><strong>{resumo.filtrados}</strong></div>
        </div>

        <div className="tools noPrint">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, CPF, empresa, prova ou nota..." />
          <select className="select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            {['TODOS', 'APROVADO', 'REPROVADO', 'REGISTRADO'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select provaSelect" value={provaFiltro} onChange={(e) => setProvaFiltro(e.target.value)}>
            {provas.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-yellow small" type="button" onClick={exportarCsv}>Exportar Excel/CSV</button>
          <button className="btn btn-outline small" type="button" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        {loading ? <div className="empty">Carregando resultados…</div> : null}

        <div className="tableWrap">
          <table className="resultTable">
            <thead><tr><th>Data/Hora</th><th>Colaborador</th><th>CPF</th><th>Empresa</th><th>Prova</th><th>Nota</th><th>Status</th><th>Evento</th></tr></thead>
            <tbody>
              {rows.map((i) => {
                const st = statusProva(i);
                return (
                  <tr key={i.id}>
                    <td>{formatDate(i.atISO)}</td>
                    <td><strong>{i.actorNome || String(i.meta?.nome || "—")}</strong></td>
                    <td className="mono">{i.actorCpf || String(i.meta?.cpf || "—")}</td>
                    <td>{i.actorEmpresa || String(i.meta?.empresa || "—")}</td>
                    <td>{i.entityTitle || String(i.meta?.provaTitulo || "—")}</td>
                    <td className="nota">{String(i.meta?.nota ?? "—")}{i.meta?.nota !== undefined ? "%" : ""}</td>
                    <td><span className={`pill ${st.toLowerCase()}`}>{st}</span></td>
                    <td className="mono evento">{i.type}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 ? <div className="empty">Nenhum resultado de prova encontrado.</div> : null}
      </div>

      <style jsx global>{`
        .resultadosPage { max-width: 1380px; }
        .topActions { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .summaryGrid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin:14px 0; }
        .summaryCard { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:16px; padding:10px 12px; box-shadow:0 10px 25px rgba(15,23,42,.05); }
        .summaryCard span { display:block; font-size:11px; opacity:.7; font-weight:800; }
        .summaryCard strong { display:block; font-size:21px; color:#0a2a6a; margin-top:2px; }
        .tools { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:14px 0; }
        .input { flex:1; min-width:260px; border-radius:999px; border:1px solid rgba(10,42,106,.14); padding:9px 11px; background:#fff; outline:none; font-weight:700; }
        .select { height:38px; border-radius:999px; border:1px solid rgba(10,42,106,.14); background:#fff; padding:0 10px; font-weight:800; color:#0a2a6a; max-width:220px; }
        .provaSelect { max-width:360px; }
        .tableWrap { width:100%; overflow:auto; background:#fff; border:1px solid rgba(10,42,106,.08); border-radius:16px; box-shadow:0 10px 28px rgba(15,23,42,.06); }
        .resultTable { width:100%; min-width:1120px; border-collapse:collapse; }
        .resultTable th,.resultTable td { padding:10px 9px; border-bottom:1px solid rgba(10,42,106,.08); text-align:left; vertical-align:top; font-size:12px; font-weight:750; }
        .resultTable th { background:#f5f7fd; color:#0a2a6a; font-weight:900; position:sticky; top:0; }
        .mono { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; color:#0a2a6a; font-weight:900; }
        .nota { font-weight:900; color:#0a2a6a; }
        .evento { font-size:11px!important; }
        .pill { display:inline-flex; border-radius:999px; padding:5px 8px; font-size:11px; font-weight:900; border:1px solid; white-space:nowrap; }
        .pill.aprovado { background:#eaf7ef; border-color:rgba(27,122,58,.18); color:#0f5132; }
        .pill.reprovado { background:#fff1f1; border-color:rgba(180,40,40,.18); color:#8a1f1f; }
        .pill.registrado { background:#f4f4f5; border-color:rgba(82,82,91,.18); color:#52525b; }
        .empty { margin-top:12px; background:#fff; border-radius:14px; padding:14px; font-weight:800; opacity:.75; }
        @media (max-width: 900px) { .summaryGrid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media print { .noPrint { display:none!important; } .tableWrap { overflow:visible!important; box-shadow:none!important; } .resultTable { min-width:0!important; } .resultTable th,.resultTable td { font-size:9px!important; padding:6px!important; } }
      `}</style>
    </main>
  );
}
