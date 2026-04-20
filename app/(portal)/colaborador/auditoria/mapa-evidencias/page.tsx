"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type Colaborador = {
  id: string;
  nome: string;
  cpf: string; // 11 dígitos
  empresa: string;
  perfil: string;
};

type Evidencia = {
  id: string;
  cpf: string;
  colaborador: string;
  empresa?: string | null;
  emitidoEmISO: string;
  emitidoPor?: string | null;
  concluidos?: number;
  total?: number;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function mascararCpf(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
}

export default function MapaEvidenciasPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [sessionNome, setSessionNome] = useState("");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  // filtros
  const [empresaFiltro, setEmpresaFiltro] = useState("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<"COM" | "SEM" | "TODOS">("COM");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const s: any = getSession();
    if (!s?.cpf) {
      router.replace("/colaborador/login");
      return;
    }
    if (!isAdmin(s)) {
      router.replace("/colaborador");
      return;
    }
    setSessionNome(s.nome || "");
    setReady(true);

    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const [cRes, eRes] = await Promise.all([
          fetch("/api/colaboradores", { cache: "no-store" }),
          fetch("/api/evidencias", { cache: "no-store" }),
        ]);

        const cJson = await cRes.json();
        const eJson = await eRes.json();

        if (!cJson?.ok) throw new Error(cJson?.error || "Falha ao carregar colaboradores.");
        if (!eJson?.ok) throw new Error(eJson?.error || "Falha ao carregar evidências.");

        setColaboradores((cJson.items || []) as Colaborador[]);
        setEvidencias((eJson.items || []) as Evidencia[]);
      } catch (err: any) {
        setErro(err?.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const evidenciasPorCpf = useMemo(() => {
    const map = new Map<string, Evidencia[]>();
    for (const ev of evidencias) {
      const cpf = onlyDigits(ev.cpf);
      if (!cpf) continue;
      const arr = map.get(cpf) || [];
      arr.push(ev);
      map.set(cpf, arr);
    }
    // recente primeiro
    for (const [cpf, arr] of map.entries()) {
      arr.sort((a, b) => (a.emitidoEmISO < b.emitidoEmISO ? 1 : -1));
      map.set(cpf, arr);
    }
    return map;
  }, [evidencias]);

  const empresas = useMemo(() => {
    const set = new Set<string>();
    for (const c of colaboradores) if (c.empresa) set.add(c.empresa);
    return ["TODAS", ...Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))];
  }, [colaboradores]);

  const resumo = useMemo(() => {
    const total = colaboradores.length;
    const com = colaboradores.filter((c) => (evidenciasPorCpf.get(onlyDigits(c.cpf)) || []).length > 0).length;
    const sem = total - com;
    return { total, com, sem };
  }, [colaboradores, evidenciasPorCpf]);

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();

    return colaboradores
      .map((c) => {
        const cpf = onlyDigits(c.cpf);
        const evs = evidenciasPorCpf.get(cpf) || [];
        const tem = evs.length > 0;
        const ultima = evs[0]?.emitidoEmISO || null;

        return {
          ...c,
          cpfNorm: cpf,
          qtd: evs.length,
          tem,
          ultima,
        };
      })
      .filter((c) => {
        const okEmpresa = empresaFiltro === "TODAS" ? true : c.empresa === empresaFiltro;
        const okStatus = statusFiltro === "TODOS" ? true : statusFiltro === "COM" ? c.tem : !c.tem;

        const okBusca =
          !q ||
          (c.nome || "").toLowerCase().includes(q) ||
          (c.empresa || "").toLowerCase().includes(q) ||
          (c.perfil || "").toLowerCase().includes(q) ||
          (c.cpfNorm || "").includes(onlyDigits(q));

        return okEmpresa && okStatus && okBusca;
      })
      .sort((a, b) => {
        if (statusFiltro === "TODOS") {
          if (a.tem !== b.tem) return a.tem ? 1 : -1;
        }
        return a.nome.localeCompare(b.nome, "pt-BR");
      });
  }, [colaboradores, evidenciasPorCpf, empresaFiltro, statusFiltro, busca]);

  if (!ready) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        {/* HEADER */}
        <div className="mapHead">
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>
              <h2>
                Mapa de Evidências por Colaborador <span style={{ opacity: 0.65 }}>(Admin)</span>
              </h2>
              <div className="bar" />
            </div>

            <p className="section-text" style={{ maxWidth: 980 }}>
              Visão gerencial (auditável) que cruza o cadastro de colaboradores com os registros da Central de Evidências.
              Padrão: exibir “Com evidência”.
            </p>
          </div>

          {/* ✅ aqui foi corrigido (sem absolute) */}
          <div className="mapSession" aria-label="Sessão atual">
            <div className="mapSessionLine">
              Sessão: <strong className="mapSessionName">{sessionNome || "—"}</strong>
            </div>
            <div className="mapBadge">ADMIN</div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="mapActions">
          <Link className="btn btn-yellow" href="/colaborador/auditoria/evidencias/registrar">
            + Registrar evidência
          </Link>

          <Link className="btn btn-outline" href="/colaborador/auditoria/evidencias">
            Ir para Central de Evidências
          </Link>

          <Link className="btn btn-outline" href="/colaborador/auditoria">
            ← Auditoria
          </Link>
        </div>

        {/* FILTROS + RESUMO */}
        <div className="card mapFilters">
          <div className="mapFiltersLeft">
            <div className="mapLabel">Empresa</div>
            <select className="mapSelect" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
              {empresas.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

            <div className="mapLabel">Status</div>
            <select className="mapSelect" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as any)}>
              <option value="COM">Com evidência</option>
              <option value="SEM">Sem evidência</option>
              <option value="TODOS">Todos</option>
            </select>

            <input className="mapSearch" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CPF, perfil ou empresa…" />
          </div>

          <div className="mapResumo" aria-label="Resumo do mapa">
            <div className="mapResumoItem">
              <div className="mapResumoNum">{resumo.total}</div>
              <div className="mapResumoLabel">Colaboradores</div>
            </div>
            <div className="mapResumoItem">
              <div className="mapResumoNum">{resumo.com}</div>
              <div className="mapResumoLabel">Com evidência</div>
            </div>
            <div className="mapResumoItem">
              <div className="mapResumoNum">{resumo.sem}</div>
              <div className="mapResumoLabel">Sem evidência</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="card mapInfo" role="status" aria-live="polite">
            <div className="mapInfoTitle">Carregando mapa…</div>
            <div className="mapInfoSub">Consultando colaboradores e evidências.</div>
          </div>
        )}

        {erro && (
          <div className="card mapInfo" style={{ borderColor: "rgba(210, 30, 30, 0.25)" }} role="alert">
            <div className="mapInfoTitle">Falha</div>
            <div className="mapInfoSub">{erro}</div>
          </div>
        )}

        {!loading && !erro && (
          <div className="card mapTableCard">
            <div className="mapTableWrap" role="region" aria-label="Tabela do mapa de evidências">
              <table className="mapTable">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Perfil</th>
                    <th>Empresa</th>
                    <th>CPF</th>
                    <th>Status</th>
                    <th>Qtd.</th>
                    <th>Última emissão</th>
                    <th style={{ textAlign: "right" }}>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {linhas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="mapEmpty">
                        Nenhum resultado para os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    linhas.map((c) => (
                      <tr key={c.cpfNorm}>
                        <td className="mapStrong">{c.nome}</td>
                        <td className="mapMuted">{c.perfil || "—"}</td>
                        <td className="mapMuted">{c.empresa || "—"}</td>
                        <td className="mapMuted">{mascararCpf(c.cpfNorm)}</td>

                        <td>
                          <span className={`mapStatus ${c.tem ? "ok" : "pend"}`}>{c.tem ? "✅ Com evidência" : "⚠️ Sem evidência"}</span>
                        </td>

                        <td className="mapMuted">{c.qtd}</td>

                        <td className="mapMuted">{c.ultima ? fmt(c.ultima) : "—"}</td>

                        <td style={{ textAlign: "right" }}>
                          <Link className="btn btn-outline mapPill" href={`/colaborador/auditoria/evidencias?cpf=${encodeURIComponent(c.cpfNorm)}`}>
                            Ver evidências
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mapObs">
              Observação: “Com evidência” significa pelo menos 1 registro na Central de Evidências para o CPF correspondente.
            </div>
          </div>
        )}

        <style jsx global>{`
          .mapHead {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 14px;
            flex-wrap: wrap;
          }

          /* ✅ SEM absolute: não sobrepõe nunca */
          .mapSession {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            border-radius: 18px;
            padding: 12px 14px;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
            min-width: 260px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .mapSessionLine {
            font-size: 12px;
            opacity: 0.75;
            font-weight: 800;
            min-width: 0;
          }

          .mapSessionName {
            display: inline-block;
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
          }

          .mapBadge {
            flex: 0 0 auto;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(11, 59, 138, 0.06);
            border: 1px solid rgba(11, 59, 138, 0.14);
            font-size: 11px;
            font-weight: 900;
            color: rgba(11, 59, 138, 1);
            white-space: nowrap;
          }

          .mapActions {
            margin-top: 10px;
            margin-bottom: 12px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
          }

          .mapFilters {
            padding: 14px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(10, 42, 106, 0.12) !important;
            background: linear-gradient(180deg, #ffffff, #f7f9ff) !important;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06) !important;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
          }

          .mapFiltersLeft {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            flex: 1;
            min-width: 280px;
          }

          .mapLabel {
            font-weight: 900;
            font-size: 12px;
            opacity: 0.75;
          }

          .mapSelect,
          .mapSearch {
            border-radius: 14px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #fff;
            padding: 10px 12px;
            outline: none;
            font-size: 13px;
          }

          .mapSearch {
            min-width: 320px;
          }

          .mapResumo {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            min-width: 320px;
          }
          .mapResumoItem {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            border-radius: 14px;
            padding: 10px;
          }
          .mapResumoNum {
            font-size: 18px;
            font-weight: 900;
            color: #0a2a6a;
            line-height: 1;
          }
          .mapResumoLabel {
            font-size: 12px;
            opacity: 0.75;
            margin-top: 3px;
            font-weight: 800;
          }

          .mapInfo {
            padding: 16px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(10, 42, 106, 0.12) !important;
            background: #fff !important;
          }
          .mapInfoTitle {
            font-weight: 900;
            color: #0a2a6a;
          }
          .mapInfoSub {
            margin-top: 6px;
            font-size: 12px;
            opacity: 0.75;
            font-weight: 700;
          }

          .mapTableCard {
            padding: 16px !important;
            border-radius: 18px !important;
          }
          .mapTableWrap {
            overflow-x: auto;
          }
          .mapTable {
            width: 100%;
            min-width: 1100px;
            border-collapse: collapse;
          }
          .mapTable thead th {
            text-align: left;
            font-size: 12px;
            padding: 12px 10px;
            border-bottom: 1px solid rgba(10, 42, 106, 0.12);
            color: rgba(0, 0, 0, 0.7);
            font-weight: 900;
            background: rgba(247, 249, 255, 0.7);
            white-space: nowrap;
          }
          .mapTable tbody td {
            padding: 12px 10px;
            border-bottom: 1px solid rgba(10, 42, 106, 0.08);
            vertical-align: top;
          }
          .mapEmpty {
            padding: 14px !important;
            opacity: 0.8;
          }

          .mapStrong {
            font-weight: 900;
            color: #0a2a6a;
          }
          .mapMuted {
            font-weight: 700;
            opacity: 0.85;
          }

          .mapStatus {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 900;
            line-height: 1;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #f7f9ff;
            color: #0a2a6a;
            white-space: nowrap;
          }
          .mapStatus.ok {
            background: rgba(20, 180, 90, 0.1);
            border-color: rgba(20, 180, 90, 0.22);
            color: rgba(14, 122, 61, 1);
          }
          .mapStatus.pend {
            background: rgba(247, 198, 0, 0.12);
            border-color: rgba(247, 198, 0, 0.26);
            color: rgba(140, 104, 0, 1);
          }

          .mapPill {
            padding: 8px 12px !important;
            border-radius: 999px !important;
          }

          .mapObs {
            margin-top: 12px;
            font-size: 12px;
            opacity: 0.75;
            font-weight: 700;
          }

          @media (max-width: 820px) {
            .mapSearch {
              min-width: 0;
              width: 100%;
            }
            .mapResumo {
              width: 100%;
              min-width: 0;
              grid-template-columns: 1fr;
            }
            .mapSessionName {
              max-width: 160px;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
