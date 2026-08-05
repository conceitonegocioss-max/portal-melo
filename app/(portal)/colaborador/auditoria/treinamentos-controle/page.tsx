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

export default function TreinamentosControlePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("TODAS");
  const [treinoFiltro, setTreinoFiltro] = useState("TODOS");

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
        setItems(all.filter((x: Item) => x.type === "TREINAMENTO_CONCLUIDO"));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [ready]);

  const empresas = useMemo(() => ["TODAS", ...Array.from(new Set(items.map((i) => i.actorEmpresa || String(i.meta?.empresa || "SEM EMPRESA")))).sort()], [items]);
  const treinos = useMemo(() => ["TODOS", ...Array.from(new Set(items.map((i) => i.entityTitle || "Treinamento"))).sort()], [items]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      const empresa = item.actorEmpresa || String(item.meta?.empresa || "SEM EMPRESA");
      const treino = item.entityTitle || "Treinamento";
      if (empresaFiltro !== "TODAS" && empresa !== empresaFiltro) return false;
      if (treinoFiltro !== "TODOS" && treino !== treinoFiltro) return false;
      if (!query) return true;
      const hay = [
        item.actorNome,
        item.actorCpf,
        empresa,
        treino,
        item.actorPerfil,
        String(item.meta?.categoria || ""),
        String(item.meta?.publico || ""),
      ].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, empresaFiltro, treinoFiltro]);

  const resumo = useMemo(() => {
    const pessoas = new Set(items.map((i) => i.actorCpf).filter(Boolean)).size;
    const treinamentos = new Set(items.map((i) => i.entityId || i.entityTitle).filter(Boolean)).size;
    const empresasCount = new Set(items.map((i) => i.actorEmpresa || String(i.meta?.empresa || "")).filter(Boolean)).size;
    return { total: items.length, pessoas, treinamentos, empresas: empresasCount, filtrados: rows.length };
  }, [items, rows.length]);

  function exportarCsv() {
    const header = ["Data/Hora", "Nome", "CPF", "Empresa", "Treinamento", "Categoria", "Público", "Status"];
    const lines = rows.map((i) => [
      formatDate(i.atISO),
      i.actorNome,
      i.actorCpf,
      i.actorEmpresa || String(i.meta?.empresa || ""),
      i.entityTitle,
      String(i.meta?.categoria || ""),
      String(i.meta?.publico || ""),
      "CONCLUÍDO",
    ].map(csvEscape).join(";"));
    const csv = [header.map(csvEscape).join(";"), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controle-treinamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!ready) return <main className="section gray"><div className="container"><p>Carregando…</p></div></main>;

  return (
    <main className="section gray">
      <div className="container treinamentosControlePage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador/treinamentos" className="btn btn-outline small">Abrir Treinamentos</Link>
        </div>

        <div className="section-title"><h2>Controle de Treinamentos</h2><div className="bar" /></div>
        <p className="section-text" style={{ maxWidth: 980 }}>Consulta auditável dos treinamentos concluídos pelos colaboradores, com CPF, empresa, treinamento, categoria, público e data/hora de conclusão.</p>

        <div className="summaryGrid">
          <div className="summaryCard"><span>Conclusões</span><strong>{resumo.total}</strong></div>
          <div className="summaryCard"><span>Pessoas</span><strong>{resumo.pessoas}</strong></div>
          <div className="summaryCard"><span>Treinamentos</span><strong>{resumo.treinamentos}</strong></div>
          <div className="summaryCard"><span>Empresas</span><strong>{resumo.empresas}</strong></div>
          <div className="summaryCard"><span>Filtrados</span><strong>{resumo.filtrados}</strong></div>
        </div>

        <div className="tools noPrint">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, CPF, empresa, treinamento ou categoria..." />
          <select className="select" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>{empresas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
          <select className="select treinoSelect" value={treinoFiltro} onChange={(e) => setTreinoFiltro(e.target.value)}>{treinos.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <button className="btn btn-yellow small" type="button" onClick={exportarCsv}>Exportar Excel/CSV</button>
          <button className="btn btn-outline small" type="button" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        {loading ? <div className="empty">Carregando treinamentos…</div> : null}

        <div className="tableWrap">
          <table className="treinoTable">
            <thead><tr><th>Data/Hora</th><th>Colaborador</th><th>CPF</th><th>Empresa</th><th>Treinamento</th><th>Categoria</th><th>Público</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>{formatDate(i.atISO)}</td>
                  <td><strong>{i.actorNome || "—"}</strong></td>
                  <td className="mono">{i.actorCpf || "—"}</td>
                  <td>{i.actorEmpresa || String(i.meta?.empresa || "—")}</td>
                  <td>{i.entityTitle || "—"}</td>
                  <td>{String(i.meta?.categoria || "—")}</td>
                  <td>{String(i.meta?.publico || "—")}</td>
                  <td><span className="pill ok">CONCLUÍDO</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 ? <div className="empty">Nenhuma conclusão de treinamento encontrada.</div> : null}
      </div>

      <style jsx global>{`
        .treinamentosControlePage { max-width: 1380px; }
        .topActions { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .summaryGrid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin:14px 0; }
        .summaryCard { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:16px; padding:10px 12px; box-shadow:0 10px 25px rgba(15,23,42,.05); }
        .summaryCard span { display:block; font-size:11px; opacity:.7; font-weight:800; }
        .summaryCard strong { display:block; font-size:21px; color:#0a2a6a; margin-top:2px; }
        .tools { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:14px 0; }
        .input { flex:1; min-width:260px; border-radius:999px; border:1px solid rgba(10,42,106,.14); padding:9px 11px; background:#fff; outline:none; font-weight:700; }
        .select { height:38px; border-radius:999px; border:1px solid rgba(10,42,106,.14); background:#fff; padding:0 10px; font-weight:800; color:#0a2a6a; max-width:220px; }
        .treinoSelect { max-width:360px; }
        .tableWrap { width:100%; overflow:auto; background:#fff; border:1px solid rgba(10,42,106,.08); border-radius:16px; box-shadow:0 10px 28px rgba(15,23,42,.06); }
        .treinoTable { width:100%; min-width:1100px; border-collapse:collapse; }
        .treinoTable th,.treinoTable td { padding:10px 9px; border-bottom:1px solid rgba(10,42,106,.08); text-align:left; vertical-align:top; font-size:12px; font-weight:750; }
        .treinoTable th { background:#f5f7fd; color:#0a2a6a; font-weight:900; position:sticky; top:0; }
        .mono { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; color:#0a2a6a; font-weight:900; }
        .pill { display:inline-flex; border-radius:999px; padding:5px 8px; font-size:11px; font-weight:900; border:1px solid; white-space:nowrap; }
        .pill.ok { background:#eaf7ef; border-color:rgba(27,122,58,.18); color:#0f5132; }
        .empty { margin-top:12px; background:#fff; border-radius:14px; padding:14px; font-weight:800; opacity:.75; }
        @media (max-width: 900px) { .summaryGrid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media print { .noPrint { display:none!important; } .tableWrap { overflow:visible!important; box-shadow:none!important; } .treinoTable { min-width:0!important; } .treinoTable th,.treinoTable td { font-size:9px!important; padding:6px!important; } }
      `}</style>
    </main>
  );
}
