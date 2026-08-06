"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "@/src/lib/auth";

type EvidenciaItem = {
  treinamentoId: string;
  status: "pendente" | "concluido";
  dataISO: string | null;
};

type Evidencia = {
  id: string;
  cpf: string;
  colaborador: string;
  empresa: string;
  emitidoEmISO: string;
  emitidoPor: string;
  concluidos: number;
  total: number;
  itens: EvidenciaItem[];
  origem?: "MANUAL" | "LOGGER" | "MISTA";
  provas?: number;
  provasAprovadas?: number;
};

type AuditEvent = {
  id: string;
  atISO: string;
  type: string;
  actorCpf?: string;
  actorNome?: string;
  actorEmpresa?: string;
  entityId?: string;
  entityTitle?: string;
  module?: string;
  meta?: Record<string, any>;
};

type Situacao = "TODAS" | "PENDENTE" | "PARCIAL" | "COMPLETO" | "SEM_CONCLUSAO";

const TREINAMENTOS_BASE = [
  "atendimento-ao-cliente",
  "codigo-de-etica-e-conduta",
  "resumo-contratual",
  "credito-responsavel",
  "resolucao-autorregulacao",
  "prevencao-a-fraude",
  "publico-vulneravel",
  "lgpd",
  "pld-ft",
  "seguranca-da-informacao",
  "produtos-modalidades-credito",
  "basico-consorcio",
  "ourocap",
  "abertura-de-contas",
  "seguridade",
  "lista-de-mailing",
];

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function normalizarTreinamentoId(id: string) {
  const value = String(id || "").trim();
  if (value === "ourocapp") return "ourocap";
  return value;
}

function mascararCpf(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function formatarData(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function pct(concluidos: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((concluidos / total) * 100);
}

function situacaoEvidencia(ev: Evidencia) {
  if (!ev.total || ev.concluidos <= 0) return "SEM_CONCLUSAO" as const;
  if (ev.concluidos >= ev.total) return "COMPLETO" as const;
  return "PARCIAL" as const;
}

function situacaoLabel(s: ReturnType<typeof situacaoEvidencia>) {
  if (s === "COMPLETO") return "✅ Completo";
  if (s === "PARCIAL") return "🟡 Parcial";
  return "⏳ Pendente";
}

function situacaoClass(s: ReturnType<typeof situacaoEvidencia>) {
  if (s === "COMPLETO") return "ok";
  if (s === "PARCIAL") return "partial";
  return "pend";
}

function dataMaisRecente(a?: string, b?: string) {
  const at = a ? new Date(a).getTime() : 0;
  const bt = b ? new Date(b).getTime() : 0;
  return bt > at ? b || a || "" : a || b || "";
}

function evidenciaFromLogger(events: AuditEvent[]) {
  const porCpf = new Map<string, {
    cpf: string;
    nome: string;
    empresa: string;
    ultimaData: string;
    treinamentos: Map<string, string>;
    provas: number;
    provasAprovadas: number;
  }>();

  for (const ev of events) {
    const type = String(ev.type || "").toUpperCase();
    const module = String(ev.module || "").toLowerCase();
    const isTreinamento = type === "TREINAMENTO_CONCLUIDO" || module === "treinamentos";
    const isProva = type.startsWith("PROVA_") || module === "provas";

    if (!isTreinamento && !isProva) continue;

    const cpf = onlyDigits(ev.actorCpf || String(ev.meta?.cpf || ""));
    if (!cpf) continue;

    const atual = porCpf.get(cpf) || {
      cpf,
      nome: ev.actorNome || String(ev.meta?.nome || ""),
      empresa: ev.actorEmpresa || String(ev.meta?.empresa || ""),
      ultimaData: ev.atISO || "",
      treinamentos: new Map<string, string>(),
      provas: 0,
      provasAprovadas: 0,
    };

    if (!atual.nome && ev.actorNome) atual.nome = ev.actorNome;
    if (!atual.empresa && ev.actorEmpresa) atual.empresa = ev.actorEmpresa;
    atual.ultimaData = dataMaisRecente(atual.ultimaData, ev.atISO);

    if (isTreinamento) {
      const treinoId = normalizarTreinamentoId(ev.entityId || String(ev.meta?.treinamentoId || ev.meta?.pasta || ""));
      if (treinoId) {
        const atualData = atual.treinamentos.get(treinoId);
        atual.treinamentos.set(treinoId, dataMaisRecente(atualData, ev.atISO));
      }
    }

    if (isProva) {
      atual.provas += 1;
      const aprovadoMeta = String(ev.meta?.aprovado || "").toUpperCase();
      if (type === "PROVA_APROVADA" || aprovadoMeta === "SIM" || aprovadoMeta === "TRUE") {
        atual.provasAprovadas += 1;
      }
    }

    porCpf.set(cpf, atual);
  }

  return Array.from(porCpf.values()).map((x): Evidencia => {
    const itens = TREINAMENTOS_BASE.map((id) => ({
      treinamentoId: id,
      status: x.treinamentos.has(id) ? "concluido" as const : "pendente" as const,
      dataISO: x.treinamentos.get(id) || null,
    }));

    return {
      id: `auto-${x.cpf}`,
      cpf: x.cpf,
      colaborador: x.nome || "—",
      empresa: x.empresa || "—",
      emitidoEmISO: x.ultimaData || new Date().toISOString(),
      emitidoPor: "Logger Central",
      concluidos: itens.filter((i) => i.status === "concluido").length,
      total: itens.length,
      itens,
      origem: "LOGGER",
      provas: x.provas,
      provasAprovadas: x.provasAprovadas,
    };
  });
}

function consolidarPorColaborador(items: Evidencia[]) {
  const map = new Map<string, Evidencia>();

  for (const ev of items) {
    const key = onlyDigits(ev.cpf) || `${ev.colaborador}::${ev.empresa}`;
    const atual = map.get(key);

    if (!atual) {
      map.set(key, ev);
      continue;
    }

    const evPct = pct(ev.concluidos, ev.total);
    const atualPct = pct(atual.concluidos, atual.total);
    const evTime = new Date(ev.emitidoEmISO || 0).getTime();
    const atualTime = new Date(atual.emitidoEmISO || 0).getTime();

    if (evPct > atualPct || (evPct === atualPct && evTime > atualTime)) {
      map.set(key, { ...ev, origem: atual.origem && atual.origem !== ev.origem ? "MISTA" : ev.origem });
    }
  }

  return Array.from(map.values()).sort((a, b) => (a.colaborador || "").localeCompare(b.colaborador || "", "pt-BR"));
}

export default function EvidenciasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cpfQueryRaw = searchParams.get("cpf") || "";
  const cpfQuery = useMemo(() => onlyDigits(cpfQueryRaw), [cpfQueryRaw]);

  const [mounted, setMounted] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [sessionNome, setSessionNome] = useState("");
  const [sessionCpf, setSessionCpf] = useState("");
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
  const [filtroSituacao, setFiltroSituacao] = useState<Situacao>("TODAS");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setMounted(true);

    const session: any = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }
    if (session.perfil !== "ADMIN") {
      router.replace("/colaborador");
      return;
    }

    setSessionNome(session.nome || "");
    setSessionCpf(session.cpf || "");

    (async () => {
      try {
        setCarregando(true);
        setErro(null);

        const [evidenciasRes, eventosRes] = await Promise.allSettled([
          fetch("/api/evidencias", { cache: "no-store" }),
          fetch("/api/audit/events?all=1", { cache: "no-store" }),
        ]);

        let manuais: Evidencia[] = [];
        let automaticas: Evidencia[] = [];

        if (evidenciasRes.status === "fulfilled") {
          const json = await evidenciasRes.value.json();
          manuais = Array.isArray(json?.items) ? json.items.map((x: Evidencia) => ({ ...x, origem: "MANUAL" as const })) : [];
        }

        if (eventosRes.status === "fulfilled") {
          const json = await eventosRes.value.json();
          const eventos = Array.isArray(json?.items) ? json.items : [];
          automaticas = evidenciaFromLogger(eventos);
        }

        setEvidencias(consolidarPorColaborador([...manuais, ...automaticas]));
      } catch (e: any) {
        setErro(e?.message || "Erro ao carregar evidências.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [router]);

  const empresas = useMemo(() => {
    const set = new Set<string>();
    for (const ev of evidencias) {
      if (ev.empresa && ev.empresa !== "—") set.add(ev.empresa);
    }
    return ["TODAS", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [evidencias]);

  const evidenciasFiltradas = useMemo(() => {
    if (!mounted) return [];
    const q = busca.trim().toLowerCase();

    return evidencias.filter((ev) => {
      const situacao = situacaoEvidencia(ev);
      const okEmpresa = filtroEmpresa === "TODAS" ? true : ev.empresa === filtroEmpresa;
      const okCpfQuery = !cpfQuery ? true : onlyDigits(ev.cpf) === cpfQuery;
      const okSituacao =
        filtroSituacao === "TODAS"
          ? true
          : filtroSituacao === "PENDENTE"
            ? situacao !== "COMPLETO"
            : filtroSituacao === situacao;

      const okBusca =
        !q ||
        (ev.colaborador || "").toLowerCase().includes(q) ||
        onlyDigits(ev.cpf).includes(onlyDigits(q)) ||
        (ev.empresa || "").toLowerCase().includes(q) ||
        (ev.emitidoPor || "").toLowerCase().includes(q);

      return okEmpresa && okCpfQuery && okSituacao && okBusca;
    });
  }, [mounted, evidencias, filtroEmpresa, filtroSituacao, busca, cpfQuery]);

  const resumo = useMemo(() => {
    const total = evidenciasFiltradas.length;
    const completos = evidenciasFiltradas.filter((e) => situacaoEvidencia(e) === "COMPLETO").length;
    const parciais = evidenciasFiltradas.filter((e) => situacaoEvidencia(e) === "PARCIAL").length;
    const semConclusao = evidenciasFiltradas.filter((e) => situacaoEvidencia(e) === "SEM_CONCLUSAO").length;
    return { total, completos, parciais, semConclusao };
  }, [evidenciasFiltradas]);

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container"><p>Carregando…</p></div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container evPage">
        <div className="evHead">
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>
              <h2>Central de Evidências <span style={{ opacity: 0.65 }}>(Admin)</span></h2>
              <div className="bar" />
            </div>

            <p className="section-text" style={{ maxWidth: 920 }}>
              Consulta consolidada por colaborador, com evidências de treinamentos e provas registradas no portal.
            </p>
          </div>

          <div className="evSession">
            <div className="evSessionLeft">
              <div className="evSessionLine">Sessão: <strong className="evSessName">{sessionNome || "—"}</strong></div>
              <div className="evSessionLine">CPF: <strong>{mascararCpf(sessionCpf || "—")}</strong></div>
            </div>
            <div className="evSessionBadge">ADMIN</div>
          </div>
        </div>

        {cpfQuery && (
          <div className="card evChipCard">
            <div className="evChipRow">
              <div style={{ fontSize: 13 }}>Filtrando por CPF: <strong>{mascararCpf(cpfQuery)}</strong></div>
              <Link className="btn btn-outline evBtnPill" href="/colaborador/auditoria/evidencias">Limpar filtro CPF</Link>
            </div>
          </div>
        )}

        <div className="card evFiltersCard">
          <div className="evFiltersLeft">
            <div className="evLabel">Filtros</div>

            <select className="evSelect" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
              {empresas.map((emp) => <option key={emp} value={emp}>{emp}</option>)}
            </select>

            <select className="evSelect" value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value as Situacao)}>
              <option value="TODAS">Todas as situações</option>
              <option value="PENDENTE">Pendentes ou parciais</option>
              <option value="SEM_CONCLUSAO">Sem conclusão</option>
              <option value="PARCIAL">Parcial</option>
              <option value="COMPLETO">Completo</option>
            </select>

            <input className="evSearch" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CPF, empresa, admin…" />
          </div>

          <div className="evResumo">
            <div className="evResumoItem"><div className="evResumoNum">{resumo.total}</div><div className="evResumoLabel">Colaboradores</div></div>
            <div className="evResumoItem"><div className="evResumoNum">{resumo.completos}</div><div className="evResumoLabel">Completos</div></div>
            <div className="evResumoItem"><div className="evResumoNum">{resumo.parciais}</div><div className="evResumoLabel">Parciais</div></div>
            <div className="evResumoItem"><div className="evResumoNum">{resumo.semConclusao}</div><div className="evResumoLabel">Sem conclusão</div></div>
          </div>
        </div>

        {carregando && <div className="card evInfoCard"><div className="evInfoTitle">Carregando evidências…</div><div className="evInfoSub">Consultando registros de treinamentos e provas.</div></div>}

        {erro && (
          <div className="card evInfoCard" style={{ borderColor: "rgba(210, 30, 30, 0.25)" }}>
            <div className="evInfoTitle">Erro ao carregar</div><div className="evInfoSub">{erro}</div>
          </div>
        )}

        {!carregando && !erro && (
          <div className="card evTableCard">
            <div className="evTableWrap">
              <table className="evTable">
                <thead>
                  <tr>
                    <th>Último registro</th>
                    <th>Colaborador</th>
                    <th>Empresa</th>
                    <th>CPF</th>
                    <th>Treinamentos</th>
                    <th>Provas</th>
                    <th>Status geral</th>
                    <th style={{ textAlign: "right" }}>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {evidenciasFiltradas.length === 0 ? (
                    <tr><td colSpan={8} className="evEmpty">Nenhuma evidência encontrada.</td></tr>
                  ) : (
                    evidenciasFiltradas.map((ev) => {
                      const percentual = pct(ev.concluidos, ev.total);
                      const situacao = situacaoEvidencia(ev);
                      const linkDetalhe = `/colaborador/auditoria/evidencias/${encodeURIComponent(ev.id)}`;

                      return (
                        <tr key={ev.id}>
                          <td className="evTdMuted">{formatarData(ev.emitidoEmISO)}</td>
                          <td className="evTdStrong">{ev.colaborador || "-"}</td>
                          <td className="evTdMuted">{ev.empresa || "-"}</td>
                          <td className="evTdMuted">{mascararCpf(ev.cpf)}</td>

                          <td>
                            <div className="evProgRow">
                              <span className="evTdMuted">{ev.concluidos}/{ev.total} ({percentual}%)</span>
                            </div>
                            <div className="evBar"><div className="evBarFill" style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }} /></div>
                          </td>

                          <td className="evTdMuted">{ev.provasAprovadas || 0}/{ev.provas || 0}</td>
                          <td><span className={`evStatus ${situacaoClass(situacao)}`}>{situacaoLabel(situacao)}</span></td>

                          <td style={{ textAlign: "right" }}>
                            <Link className="btn btn-outline evBtnPill" href={linkDetalhe}>Consultar evidência</Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="evObs">
              Nota de auditoria: esta listagem consolida as evidências de treinamentos e provas por colaborador. O histórico bruto permanece disponível no Logger Central.
            </div>
          </div>
        )}

        <div className="evBottom">
          <Link className="btn btn-outline evBtnPill" href="/colaborador/auditoria">← Voltar para Auditoria</Link>
          <Link className="btn btn-outline evBtnPill" href="/colaborador">← Área do Colaborador</Link>
        </div>

        <style jsx global>{`
          .evPage { max-width: 1280px; }
          .evHead { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; }
          .evSession { background:#fff; border:1px solid rgba(10,42,106,.12); border-radius:18px; padding:12px 14px; box-shadow:0 12px 28px rgba(15,23,42,.06); min-width:260px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
          .evSessionLeft { min-width:0; }
          .evSessionLine { font-size:12px; opacity:.75; font-weight:800; }
          .evSessName { display:inline-block; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; }
          .evSessionBadge { flex:0 0 auto; padding:6px 10px; border-radius:999px; background:rgba(11,59,138,.06); border:1px solid rgba(11,59,138,.14); font-size:11px; font-weight:900; color:#0b3b8a; white-space:nowrap; margin-top:2px; }
          .evChipCard { padding:12px!important; border-radius:18px!important; margin-top:12px; }
          .evChipRow { display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
          .evFiltersCard { padding:14px!important; border-radius:18px!important; border:1px solid rgba(10,42,106,.12)!important; background:linear-gradient(180deg,#fff,#f7f9ff)!important; box-shadow:0 14px 35px rgba(15,23,42,.06)!important; display:flex; gap:12px; flex-wrap:wrap; align-items:center; justify-content:space-between; margin-bottom:14px; margin-top:12px; }
          .evFiltersLeft { display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1; min-width:260px; }
          .evLabel { font-weight:900; font-size:12px; opacity:.75; }
          .evSelect,.evSearch { border-radius:14px; border:1px solid rgba(10,42,106,.12); background:#fff; padding:10px 12px; outline:none; font-weight:700; }
          .evSearch { min-width:280px; }
          .evResumo { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; min-width:480px; }
          .evResumoItem { background:#fff; border:1px solid rgba(10,42,106,.12); border-radius:14px; padding:10px; }
          .evResumoNum { font-size:18px; font-weight:900; color:#0a2a6a; line-height:1; }
          .evResumoLabel { font-size:12px; opacity:.75; margin-top:3px; font-weight:800; }
          .evInfoCard { padding:16px!important; border-radius:18px!important; border:1px solid rgba(10,42,106,.12)!important; background:#fff!important; }
          .evInfoTitle { font-weight:900; color:#0a2a6a; }
          .evInfoSub { margin-top:6px; font-size:12px; opacity:.75; font-weight:700; }
          .evTableCard { padding:16px!important; border-radius:18px!important; }
          .evTableWrap { overflow-x:auto; }
          .evTable { width:100%; min-width:1040px; border-collapse:collapse; }
          .evTable thead th { text-align:left; font-size:12px; padding:12px 10px; border-bottom:1px solid rgba(10,42,106,.12); color:rgba(0,0,0,.7); font-weight:900; background:rgba(247,249,255,.7); }
          .evTable tbody td { padding:12px 10px; border-bottom:1px solid rgba(10,42,106,.08); vertical-align:top; }
          .evEmpty { padding:14px!important; opacity:.8; }
          .evTdStrong { font-weight:900; color:#0a2a6a; }
          .evTdMuted { font-weight:700; opacity:.85; }
          .evProgRow { display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
          .evStatus { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900; line-height:1; border:1px solid rgba(10,42,106,.12); background:#f7f9ff; color:#0a2a6a; white-space:nowrap; }
          .evStatus.ok { background:rgba(20,180,90,.1); border-color:rgba(20,180,90,.22); color:#0e7a3d; }
          .evStatus.partial { background:rgba(247,198,0,.12); border-color:rgba(247,198,0,.26); color:#8c6800; }
          .evStatus.pend { background:#fff4f4; border-color:rgba(180,40,40,.18); color:#8a1f1f; }
          .evBar { margin-top:8px; height:8px; border-radius:999px; background:rgba(10,42,106,.08); overflow:hidden; }
          .evBarFill { height:8px; border-radius:999px; background:#0b3b8a; }
          .evObs { margin-top:12px; font-size:12px; opacity:.75; font-weight:700; }
          .evBottom { margin-top:14px; display:flex; gap:10px; flex-wrap:wrap; }
          .evBtnPill { padding:8px 12px!important; border-radius:999px!important; }
          @media (max-width: 820px) { .evSearch{min-width:0;width:100%;} .evResumo{grid-template-columns:repeat(2,minmax(0,1fr)); width:100%; min-width:0;} .evSessName{max-width:160px;} }
        `}</style>
      </div>
    </main>
  );
}
