"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { guardAdmin } from "@/src/lib/accessGuard";

type Evento = {
  id: string;
  atISO: string;
  type: string;
  actorCpf: string;
  actorNome: string;
  actorEmpresa: string;
  actorPerfil: string;
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

export default function MateriaisConsultasPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Evento[]>([]);
  const [q, setQ] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [empresaFiltro, setEmpresaFiltro] = useState("TODAS");

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
        setItems(all.filter((x: Evento) => x.type === "DOCUMENTO_CONSULTADO" || x.type === "BIBLIOTECA_GOVERNANCA_CIENCIA"));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [ready]);

  const empresas = useMemo(() => ["TODAS", ...Array.from(new Set(items.map((i) => i.actorEmpresa || "SEM EMPRESA"))).sort()], [items]);
  const tipos = useMemo(() => ["TODOS", "CIÊNCIA GERAL", "CONSULTA", ...Array.from(new Set(items.map((i) => String(i.meta?.categoria || "")).filter(Boolean))).sort()], [items]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      const empresa = item.actorEmpresa || "SEM EMPRESA";
      const tipoLinha = item.type === "BIBLIOTECA_GOVERNANCA_CIENCIA" ? "CIÊNCIA GERAL" : "CONSULTA";
      const categoria = String(item.meta?.categoria || "");
      if (empresaFiltro !== "TODAS" && empresa !== empresaFiltro) return false;
      if (tipoFiltro !== "TODOS" && tipoFiltro !== tipoLinha && tipoFiltro !== categoria) return false;
      if (!query) return true;
      const hay = [
        item.actorNome,
        item.actorCpf,
        empresa,
        item.entityTitle,
        item.type,
        categoria,
        String(item.meta?.responsavel || ""),
        String(item.meta?.acao || ""),
      ].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, tipoFiltro, empresaFiltro]);

  const resumo = useMemo(() => {
    const consultas = items.filter((i) => i.type === "DOCUMENTO_CONSULTADO").length;
    const ciencias = items.filter((i) => i.type === "BIBLIOTECA_GOVERNANCA_CIENCIA").length;
    const pessoas = new Set(items.map((i) => i.actorCpf).filter(Boolean)).size;
    const docs = new Set(items.filter((i) => i.type === "DOCUMENTO_CONSULTADO").map((i) => i.entityId || i.entityTitle).filter(Boolean)).size;
    return { total: items.length, consultas, ciencias, pessoas, docs, filtrados: rows.length };
  }, [items, rows.length]);

  function exportarCsv() {
    const header = ["Data/Hora", "Evento", "Nome", "CPF", "Empresa", "Documento/Biblioteca", "Categoria", "Ação", "Responsável", "Revisão"];
    const lines = rows.map((i) => [
      formatDate(i.atISO),
      i.type === "BIBLIOTECA_GOVERNANCA_CIENCIA" ? "CIÊNCIA GERAL" : "DOCUMENTO CONSULTADO",
      i.actorNome,
      i.actorCpf,
      i.actorEmpresa,
      i.entityTitle,
      String(i.meta?.categoria || "Biblioteca"),
      String(i.meta?.acao || "CIÊNCIA"),
      String(i.meta?.responsavel || ""),
      String(i.meta?.revisao || ""),
    ].map(csvEscape).join(";"));
    const csv = [header.map(csvEscape).join(";"), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controle-materiais-politicas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!ready) return <main className="section gray"><div className="container"><p>Carregando…</p></div></main>;

  return (
    <main className="section gray">
      <div className="container matControlePage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador/materiais" className="btn btn-outline small">Abrir Materiais & Políticas</Link>
        </div>

        <div className="section-title"><h2>Controle de Consulta a Materiais & Políticas</h2><div className="bar" /></div>
        <p className="section-text" style={{ maxWidth: 980 }}>Relatório administrativo dos registros de ciência geral da biblioteca e das consultas/baixos realizados nos documentos da área Materiais & Políticas.</p>

        <div className="summaryGrid">
          <div className="summaryCard"><span>Registros</span><strong>{resumo.total}</strong></div>
          <div className="summaryCard"><span>Consultas</span><strong>{resumo.consultas}</strong></div>
          <div className="summaryCard"><span>Ciências gerais</span><strong>{resumo.ciencias}</strong></div>
          <div className="summaryCard"><span>Pessoas</span><strong>{resumo.pessoas}</strong></div>
          <div className="summaryCard"><span>Documentos consultados</span><strong>{resumo.docs}</strong></div>
          <div className="summaryCard"><span>Filtrados</span><strong>{resumo.filtrados}</strong></div>
        </div>

        <div className="tools noPrint">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, CPF, empresa, documento, responsável..." />
          <select className="select" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>{empresas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
          <select className="select" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>{tipos.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <button className="btn btn-yellow small" type="button" onClick={exportarCsv}>Exportar Excel/CSV</button>
          <button className="btn btn-outline small" type="button" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        {loading ? <div className="empty">Carregando registros…</div> : null}

        <div className="tableWrap">
          <table className="matTable">
            <thead><tr><th>Data/Hora</th><th>Evento</th><th>Colaborador</th><th>CPF</th><th>Empresa</th><th>Documento/Biblioteca</th><th>Categoria</th><th>Ação</th><th>Resp./Revisão</th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>{formatDate(i.atISO)}</td>
                  <td><span className={`pill ${i.type === "BIBLIOTECA_GOVERNANCA_CIENCIA" ? "blue" : "ok"}`}>{i.type === "BIBLIOTECA_GOVERNANCA_CIENCIA" ? "CIÊNCIA GERAL" : "CONSULTA"}</span></td>
                  <td><strong>{i.actorNome || "—"}</strong></td>
                  <td className="mono">{i.actorCpf || "—"}</td>
                  <td>{i.actorEmpresa || "—"}</td>
                  <td>{i.entityTitle || "—"}</td>
                  <td>{String(i.meta?.categoria || "Biblioteca")}</td>
                  <td>{String(i.meta?.acao || "CIÊNCIA")}</td>
                  <td><div>{String(i.meta?.responsavel || "—")}</div><small>{String(i.meta?.revisao || i.meta?.ciclo || "—")}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 ? <div className="empty">Nenhum registro encontrado.</div> : null}
      </div>

      <style jsx global>{`
        .matControlePage{max-width:1380px}.topActions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.summaryGrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:14px 0}.summaryCard{background:#fff;border:1px solid rgba(10,42,106,.1);border-radius:16px;padding:10px 12px;box-shadow:0 10px 25px rgba(15,23,42,.05)}.summaryCard span{display:block;font-size:11px;opacity:.7;font-weight:800}.summaryCard strong{display:block;font-size:21px;color:#0a2a6a;margin-top:2px}.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:14px 0}.input{flex:1;min-width:260px;border-radius:999px;border:1px solid rgba(10,42,106,.14);padding:9px 11px;background:#fff;outline:none;font-weight:700}.select{height:38px;border-radius:999px;border:1px solid rgba(10,42,106,.14);background:#fff;padding:0 10px;font-weight:800;color:#0a2a6a;max-width:240px}.tableWrap{width:100%;overflow:auto;background:#fff;border:1px solid rgba(10,42,106,.08);border-radius:16px;box-shadow:0 10px 28px rgba(15,23,42,.06)}.matTable{width:100%;min-width:1180px;border-collapse:collapse}.matTable th,.matTable td{padding:10px 9px;border-bottom:1px solid rgba(10,42,106,.08);text-align:left;vertical-align:top;font-size:12px;font-weight:750}.matTable th{background:#f5f7fd;color:#0a2a6a;font-weight:900;position:sticky;top:0}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;color:#0a2a6a;font-weight:900}.pill{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;border:1px solid;white-space:nowrap}.pill.ok{background:#eaf7ef;border-color:rgba(27,122,58,.18);color:#0f5132}.pill.blue{background:#eef4ff;border-color:rgba(11,59,138,.18);color:#0b3b8a}.empty{margin-top:12px;background:#fff;border-radius:14px;padding:14px;font-weight:800;opacity:.75}@media(max-width:900px){.summaryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media print{.noPrint{display:none!important}.tableWrap{overflow:visible!important;box-shadow:none!important}.matTable{min-width:0!important}.matTable th,.matTable td{font-size:9px!important;padding:6px!important}}
      `}</style>
    </main>
  );
}
