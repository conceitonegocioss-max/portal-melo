"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { getSession, normalizeCpf } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";

type CertStatus = "VÁLIDA" | "VENCIDA" | "NÃO INFORMADO";
type CertTipo = "consignado" | "lgpd" | "pldft";
type CertCampo = "status" | "vencimento";
type CertInfo = { status: CertStatus; vencimento: string };
type SessionLike = { nome?: string; cpf?: string; perfil?: string; empresa?: string | null } | null;
type Row = { id: string; nome: string; cpf: string; empresa: string; statusUsuario: string; consignado: CertInfo; lgpd: CertInfo; pldft: CertInfo };

const CERT_OPTIONS: CertStatus[] = ["VÁLIDA", "VENCIDA", "NÃO INFORMADO"];

function maskCpf(cpf: string) {
  const d = normalizeCpf(cpf);
  if (d.length !== 11) return cpf || "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
}

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function isJonas(u: { nome: string; cpf: string; id: string }) {
  const nome = String(u.nome || "").toLowerCase();
  const cpf = normalizeCpf(u.cpf || "");
  const id = String(u.id || "").toLowerCase();
  return cpf === "00598282343" || id.includes("antonio-jonas") || nome.includes("antonio jonas");
}

function extractDate(texto: string, tipo: CertTipo) {
  const t = String(texto || "").toUpperCase();
  const keys = tipo === "consignado" ? ["CONSIGNADO"] : tipo === "lgpd" ? ["LGPD"] : ["PLDFT", "PLDF", "PLD"];
  const idxs = keys.map((k) => t.indexOf(k)).filter((i) => i >= 0);
  if (!idxs.length) return "";
  const trecho = t.slice(Math.min(...idxs), Math.min(...idxs) + 80);
  const match = trecho.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  return match?.[0] || "";
}

function statusFromText(texto: string, tipo: CertTipo): CertStatus {
  const t = String(texto || "").toUpperCase();
  if (tipo === "consignado" && !t.includes("CONSIGNADO")) return "NÃO INFORMADO";
  if (tipo === "lgpd" && !t.includes("LGPD")) return "NÃO INFORMADO";
  if (tipo === "pldft" && !t.includes("PLDFT") && !t.includes("PLDF") && !t.includes("PLD")) return "NÃO INFORMADO";
  if (t.includes("VENCIDA") || t.includes("EXPIRADA")) return "VENCIDA";
  return "VÁLIDA";
}

function classe(status: CertStatus) {
  if (status === "VÁLIDA") return "ok";
  if (status === "VENCIDA") return "bad";
  return "neutral";
}

function statusGeral(r: Row) {
  const statuses = [r.consignado.status, r.lgpd.status, r.pldft.status];
  if (statuses.includes("VENCIDA")) return "VENCIDO";
  if (statuses.includes("NÃO INFORMADO")) return "PENDENTE";
  return "REGULAR";
}

export default function CertificacoesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionLike>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [q, setQ] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("TODAS");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [certOverrides, setCertOverrides] = useState<Record<string, Partial<Record<CertTipo, CertInfo>>>>({});

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    const sess = getSession();
    setSession(sess);
    setReady(true);

    fetch("/api/audit/user-controls")
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.certificacoes) setCertOverrides(data.certificacoes);
      })
      .catch(() => {});
  }, [router]);

  const base = useMemo<Row[]>(() => {
    return COLABORADORES.map((c: any) => {
      const id = String(c.id || normalizeCpf(c.cpf));
      const certificacao = String(c.certificacao || "");
      return {
        id,
        nome: String(c.nome || ""),
        cpf: normalizeCpf(String(c.cpf || "")),
        empresa: String(c.empresa || "SEM EMPRESA"),
        statusUsuario: String(c.status || "ATIVO"),
        consignado: { status: statusFromText(certificacao, "consignado"), vencimento: extractDate(certificacao, "consignado") },
        lgpd: { status: statusFromText(certificacao, "lgpd"), vencimento: extractDate(certificacao, "lgpd") },
        pldft: { status: statusFromText(certificacao, "pldft"), vencimento: extractDate(certificacao, "pldft") },
      };
    })
      .filter((u) => !isJonas(u))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, []);

  const rowsComOverride = useMemo<Row[]>(() => {
    return base.map((r) => ({
      ...r,
      consignado: { ...r.consignado, ...(certOverrides[r.id]?.consignado || {}) },
      lgpd: { ...r.lgpd, ...(certOverrides[r.id]?.lgpd || {}) },
      pldft: { ...r.pldft, ...(certOverrides[r.id]?.pldft || {}) },
    }));
  }, [base, certOverrides]);

  const empresas = useMemo(() => ["TODAS", ...Array.from(new Set(rowsComOverride.map((r) => r.empresa))).sort()], [rowsComOverride]);
  const statusList = ["TODOS", "REGULAR", "PENDENTE", "VENCIDO"];

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rowsComOverride.filter((r) => {
      const geral = statusGeral(r);
      if (empresaFiltro !== "TODAS" && r.empresa !== empresaFiltro) return false;
      if (statusFiltro !== "TODOS" && geral !== statusFiltro) return false;
      if (!query) return true;
      return [r.nome, r.cpf, maskCpf(r.cpf), r.empresa, geral, r.consignado.status, r.lgpd.status, r.pldft.status, r.consignado.vencimento, r.lgpd.vencimento, r.pldft.vencimento]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rowsComOverride, q, empresaFiltro, statusFiltro]);

  const resumo = useMemo(() => {
    const regular = rowsComOverride.filter((r) => statusGeral(r) === "REGULAR").length;
    const pendente = rowsComOverride.filter((r) => statusGeral(r) === "PENDENTE").length;
    const vencido = rowsComOverride.filter((r) => statusGeral(r) === "VENCIDO").length;
    return { total: rowsComOverride.length, regular, pendente, vencido, filtrados: rows.length };
  }, [rowsComOverride, rows.length]);

  async function salvarCert(row: Row, tipo: CertTipo, campo: CertCampo, valor: string) {
    const atual = row[tipo];
    const antes = String(atual[campo] || "");
    const novoCert = { ...atual, [campo]: valor } as CertInfo;

    setCertOverrides((prev) => ({ ...prev, [row.id]: { ...(prev[row.id] || {}), [tipo]: novoCert } }));
    setSaveMsg("Salvando alteração...");

    try {
      const resp = await fetch("/api/audit/user-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          control: "certificacao",
          actorCpf: session?.cpf || "",
          actorNome: session?.nome || "",
          targetId: row.id,
          targetCpf: row.cpf,
          targetNome: row.nome,
          empresa: row.empresa,
          tipo,
          campo,
          antes,
          depois: valor,
        }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.ok) throw new Error("save_failed");
      setSaveMsg("Alteração salva no logger.");
    } catch {
      setCertOverrides((prev) => ({ ...prev, [row.id]: { ...(prev[row.id] || {}), [tipo]: atual } }));
      setSaveMsg("Não foi possível salvar. A alteração foi desfeita.");
    }
  }

  function exportarCsv() {
    const header = ["Nome", "CPF", "Empresa", "Consignado", "Vencimento Consignado", "LGPD", "Vencimento LGPD", "PLDFT", "Vencimento PLDFT", "Status Geral"];
    const lines = rows.map((r) => [r.nome, r.cpf, r.empresa, r.consignado.status, r.consignado.vencimento, r.lgpd.status, r.lgpd.vencimento, r.pldft.status, r.pldft.vencimento, statusGeral(r)].map(csvEscape).join(";"));
    const csv = [header.map(csvEscape).join(";"), ...lines].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controle-certificacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function CertCell({ row, tipo }: { row: Row; tipo: CertTipo }) {
    const cert = row[tipo];
    return (
      <div className="certBox">
        <select className={`certSelect ${classe(cert.status)}`} value={cert.status} onChange={(e) => salvarCert(row, tipo, "status", e.target.value)}>
          {CERT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input className="dateInput" value={cert.vencimento} onChange={(e) => setCertOverrides((prev) => ({ ...prev, [row.id]: { ...(prev[row.id] || {}), [tipo]: { ...cert, vencimento: e.target.value } } }))} onBlur={(e) => salvarCert(row, tipo, "vencimento", e.target.value)} placeholder="dd/mm/aaaa" />
      </div>
    );
  }

  if (!ready) return <main className="section gray"><div className="container"><p>Carregando certificações…</p></div></main>;

  return (
    <main className="section gray">
      <div className="container certPage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">← Voltar para Auditoria</Link>
          <Link href="/colaborador/auditoria/usuarios" className="btn btn-outline small">Usuários & Perfis</Link>
        </div>

        <div className="section-title"><h2>Controle de Certificações</h2><div className="bar" /></div>
        <p className="section-text certDesc">Controle de certificações por colaborador, com status e datas de vencimento. Alterações são salvas no logger para rastreabilidade.</p>
        <div className="sessionBox noPrint">Sessão: <strong>{session?.nome || "Administrador"}</strong> • Perfil: <strong>ADMIN</strong>{saveMsg ? <> • <span>{saveMsg}</span></> : null}</div>

        <div className="summaryGrid">
          <div className="summaryCard"><span>Total</span><strong>{resumo.total}</strong></div>
          <div className="summaryCard"><span>Regular</span><strong>{resumo.regular}</strong></div>
          <div className="summaryCard"><span>Pendente</span><strong>{resumo.pendente}</strong></div>
          <div className="summaryCard"><span>Vencido</span><strong>{resumo.vencido}</strong></div>
          <div className="summaryCard"><span>Filtrados</span><strong>{resumo.filtrados}</strong></div>
        </div>

        <div className="tools noPrint">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, CPF, empresa ou vencimento..." />
          <select className="select" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>{empresas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
          <select className="select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>{statusList.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <button className="btn btn-yellow small" type="button" onClick={exportarCsv}>Exportar Excel/CSV</button>
          <button className="btn btn-outline small" type="button" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        <div className="legend noPrint">Legenda: <strong>REGULAR</strong> = todas válidas; <strong>PENDENTE</strong> = alguma não informada; <strong>VENCIDO</strong> = alguma vencida.</div>

        <div className="tableWrap">
          <table className="certTable">
            <thead><tr><th>Nome</th><th>CPF</th><th>Empresa</th><th>Consignado</th><th>LGPD</th><th>PLDFT</th><th>Status Geral</th></tr></thead>
            <tbody>{rows.map((r) => { const geral = statusGeral(r); return (
              <tr key={r.id}>
                <td className="nameCell"><strong>{r.nome}</strong><div className="muted">{r.id}</div></td>
                <td className="mono cpfCell">{maskCpf(r.cpf)}</td>
                <td className="empresaCell">{r.empresa}</td>
                <td><CertCell row={r} tipo="consignado" /></td>
                <td><CertCell row={r} tipo="lgpd" /></td>
                <td><CertCell row={r} tipo="pldft" /></td>
                <td><span className={`geral ${geral.toLowerCase()}`}>{geral}</span></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>

        {rows.length === 0 ? <div className="empty">Nenhuma certificação encontrada para os filtros aplicados.</div> : null}
      </div>

      <style jsx global>{`
        .certPage { max-width: 1380px; }
        .topActions { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .certDesc { max-width:980px; }
        .sessionBox,.legend { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:14px; padding:10px 12px; font-size:12px; font-weight:800; color:rgba(0,0,0,.7); margin:12px 0; }
        .summaryGrid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin:14px 0; }
        .summaryCard { background:#fff; border:1px solid rgba(10,42,106,.1); border-radius:16px; padding:10px 12px; box-shadow:0 10px 25px rgba(15,23,42,.05); }
        .summaryCard span { display:block; font-size:11px; opacity:.7; font-weight:800; }
        .summaryCard strong { display:block; font-size:21px; color:#0a2a6a; margin-top:2px; }
        .tools { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:14px 0; }
        .input { flex:1; min-width:260px; border-radius:999px; border:1px solid rgba(10,42,106,.14); padding:9px 11px; background:#fff; outline:none; font-weight:700; }
        .select { height:38px; border-radius:999px; border:1px solid rgba(10,42,106,.14); background:#fff; padding:0 10px; font-weight:800; color:#0a2a6a; max-width:190px; }
        .tableWrap { width:100%; overflow-x:auto; background:#fff; border:1px solid rgba(10,42,106,.08); border-radius:16px; box-shadow:0 10px 28px rgba(15,23,42,.06); }
        .certTable { width:100%; min-width:1180px; border-collapse:collapse; table-layout:fixed; }
        .certTable th,.certTable td { padding:9px 8px; border-bottom:1px solid rgba(10,42,106,.08); text-align:left; vertical-align:top; font-size:11px; font-weight:750; line-height:1.22; }
        .certTable th { background:#f5f7fd; color:#0a2a6a; font-weight:900; position:sticky; top:0; z-index:1; }
        .certTable th:nth-child(1),.certTable td:nth-child(1){width:22%;}.certTable th:nth-child(2),.certTable td:nth-child(2){width:11%;}.certTable th:nth-child(3),.certTable td:nth-child(3){width:13%;}.certTable th:nth-child(4),.certTable td:nth-child(4),.certTable th:nth-child(5),.certTable td:nth-child(5),.certTable th:nth-child(6),.certTable td:nth-child(6){width:15%;}.certTable th:nth-child(7),.certTable td:nth-child(7){width:9%;}
        .certBox { display:grid; gap:5px; }
        .certSelect,.dateInput { width:100%; border-radius:999px; padding:6px 7px; font-size:10px; font-weight:900; border:1px solid rgba(10,42,106,.14); outline:none; }
        .dateInput { background:#fff; color:#0a2a6a; }
        .certSelect.ok,.geral.regular { background:#eaf7ef; border-color:rgba(27,122,58,.18); color:#0f5132; }
        .certSelect.bad,.geral.vencido { background:#fff1f1; border-color:rgba(180,40,40,.18); color:#8a1f1f; }
        .certSelect.neutral,.geral.pendente { background:#f4f4f5; border-color:rgba(82,82,91,.18); color:#52525b; }
        .geral { display:inline-flex; border-radius:999px; padding:5px 7px; font-size:10px; font-weight:900; border:1px solid; white-space:nowrap; }
        .muted { margin-top:3px; opacity:.55; font-size:10px; font-weight:700; word-break:break-word; }
        .mono { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; color:#0a2a6a; font-weight:900; }
        .cpfCell { font-size:10px!important; white-space:nowrap; }
        .nameCell strong,.empresaCell { word-break:break-word; }
        .empty { margin-top:12px; background:#fff; border-radius:14px; padding:14px; font-weight:800; opacity:.75; }
        @media (max-width:900px){.summaryGrid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media print{.noPrint{display:none!important}body,.section.gray{background:#fff!important}.container{max-width:100%!important}.tableWrap{box-shadow:none!important;border:1px solid #ccd3e0!important;overflow:visible!important}.certTable{min-width:0!important}.certTable th,.certTable td{font-size:9px!important;padding:6px!important}.certSelect,.dateInput{border:0!important;background:transparent!important;color:#000!important;padding:0!important;appearance:none!important}}
      `}</style>
    </main>
  );
}
