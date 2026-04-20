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
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
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

  // filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
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

        const res = await fetch("/api/evidencias", { cache: "no-store" });
        const json = await res.json();

        if (!json?.ok) throw new Error("Resposta inválida da API.");

        const items = (json.items || []) as Evidencia[];
        items.sort((a, b) => (a.emitidoEmISO < b.emitidoEmISO ? 1 : -1)); // recente primeiro
        setEvidencias(items);
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
      if (ev.empresa) set.add(ev.empresa);
    }
    return ["TODAS", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [evidencias]);

  const evidenciasFiltradas = useMemo(() => {
    if (!mounted) return [];
    const q = busca.trim().toLowerCase();

    return evidencias.filter((ev) => {
      const okEmpresa = filtroEmpresa === "TODAS" ? true : ev.empresa === filtroEmpresa;
      const okCpfQuery = !cpfQuery ? true : onlyDigits(ev.cpf) === cpfQuery;

      const okBusca =
        !q ||
        (ev.colaborador || "").toLowerCase().includes(q) ||
        onlyDigits(ev.cpf).includes(onlyDigits(q)) ||
        (ev.empresa || "").toLowerCase().includes(q) ||
        (ev.emitidoPor || "").toLowerCase().includes(q);

      return okEmpresa && okCpfQuery && okBusca;
    });
  }, [mounted, evidencias, filtroEmpresa, busca, cpfQuery]);

  const resumo = useMemo(() => {
    const total = evidenciasFiltradas.length;
    const completos = evidenciasFiltradas.filter((e) => e.concluidos >= e.total).length;
    return { total, completos };
  }, [evidenciasFiltradas]);

  if (!mounted) {
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
        {/* Topo */}
        <div className="evHead">
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>
              <h2>
                Central de Evidências <span style={{ opacity: 0.65 }}>(Admin)</span>
              </h2>
              <div className="bar" />
            </div>

            <p className="section-text" style={{ maxWidth: 920 }}>
              Registro e consulta de evidências por colaborador (CPF), destinadas à auditoria interna e ao atendimento de requisitos de compliance, LGPD/PLDFT e controles operacionais. Recomenda-se manter registros objetivos, verificáveis e estritamente necessários.
            </p>
          </div>

          {/* ✅ sessão sem sobrepor */}
          <div className="evSession">
            <div className="evSessionLeft">
              <div className="evSessionLine">
                Sessão: <strong className="evSessName">{sessionNome || "—"}</strong>
              </div>
              <div className="evSessionLine">
                CPF: <strong>{mascararCpf(sessionCpf || "—")}</strong>
              </div>
            </div>

            <div className="evSessionBadge">ADMIN</div>
          </div>
        </div>

        {/* Filtro CPF vindo na URL */}
        {cpfQuery && (
          <div className="card evChipCard">
            <div className="evChipRow">
              <div style={{ fontSize: 13 }}>
                Filtrando por CPF: <strong>{mascararCpf(cpfQuery)}</strong>
              </div>

              <Link className="btn btn-outline evBtnPill" href="/colaborador/auditoria/evidencias">
                Limpar filtro CPF
              </Link>
            </div>
          </div>
        )}

        {/* Card filtros + resumo */}
        <div className="card evFiltersCard">
          <div className="evFiltersLeft">
            <div className="evLabel">Filtro</div>

            <select className="evSelect" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
              {empresas.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

            <input
              className="evSearch"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, empresa, admin…"
            />
          </div>

          <div className="evResumo">
            <div className="evResumoItem">
              <div className="evResumoNum">{resumo.total}</div>
              <div className="evResumoLabel">Registros (filtro atual)</div>
            </div>
            <div className="evResumoItem">
              <div className="evResumoNum">{resumo.completos}</div>
              <div className="evResumoLabel">Registros completos</div>
            </div>
          </div>
        </div>

        {carregando && (
          <div className="card evInfoCard">
            <div className="evInfoTitle">Carregando evidências…</div>
            <div className="evInfoSub">Aguarde alguns segundos.</div>
          </div>
        )}

        {erro && (
          <div className="card evInfoCard" style={{ borderColor: "rgba(210, 30, 30, 0.25)" }}>
            <div className="evInfoTitle">Erro ao carregar</div>
            <div className="evInfoSub">{erro}</div>
          </div>
        )}

        {!carregando && !erro && (
          <div className="card evTableCard">
            <div className="evTableWrap">
              <table className="evTable">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Colaborador</th>
                    <th>Empresa</th>
                    <th>CPF</th>
                    <th>Concluídos</th>
                    <th>Responsável</th>
                    <th style={{ textAlign: "right" }}>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {evidenciasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="evEmpty">
                        Nenhuma evidência encontrada.
                      </td>
                    </tr>
                  ) : (
                    evidenciasFiltradas.map((ev) => {
                      const percentual = pct(ev.concluidos, ev.total);
                      const ok = ev.concluidos >= ev.total;

                      return (
                        <tr key={ev.id}>
                          <td className="evTdMuted">{formatarData(ev.emitidoEmISO)}</td>

                          <td className="evTdStrong">{ev.colaborador || "-"}</td>

                          <td className="evTdMuted">{ev.empresa || "-"}</td>

                          <td className="evTdMuted">{mascararCpf(ev.cpf)}</td>

                          <td>
                            <div className="evProgRow">
                              <span className="evTdMuted">
                                {ev.concluidos}/{ev.total} ({percentual}%)
                              </span>
                              <span className={`evStatus ${ok ? "ok" : "pend"}`}>{ok ? "✅ Completo" : "⏳ Pendente"}</span>
                            </div>
                            <div className="evBar">
                              <div className="evBarFill" style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }} />
                            </div>
                          </td>

                          <td className="evTdMuted">{ev.emitidoPor || "ADMIN"}</td>

                          <td style={{ textAlign: "right" }}>
                            <Link className="btn btn-outline evBtnPill" href={`/colaborador/auditoria/evidencias/${encodeURIComponent(ev.id)}`}>
                              Consultar evidência
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="evObs">
              Nota de auditoria: a listagem apresenta apenas evidências já registradas (“salvas”). Cada registro deve possuir conteúdo verificável e aderente ao controle/obrigação correspondente.
            </div>
          </div>
        )}

        <div className="evBottom">
          <Link className="btn btn-outline evBtnPill" href="/colaborador/auditoria">
            ← Voltar para Auditoria
          </Link>
          <Link className="btn btn-outline evBtnPill" href="/colaborador">
            ← Área do Colaborador
          </Link>
        </div>

        <style jsx global>{`
          .evHead {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
          }

          /* ✅ CORRIGIDO */
          .evSession {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            border-radius: 18px;
            padding: 12px 14px;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
            min-width: 260px;

            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .evSessionLeft {
            min-width: 0;
          }

          .evSessionLine {
            font-size: 12px;
            opacity: 0.75;
            font-weight: 800;
          }

          .evSessName {
            display: inline-block;
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
          }

          .evSessionBadge {
            flex: 0 0 auto;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(11, 59, 138, 0.06);
            border: 1px solid rgba(11, 59, 138, 0.14);
            font-size: 11px;
            font-weight: 900;
            color: rgba(11, 59, 138, 1);
            white-space: nowrap;
            margin-top: 2px;
          }

          .evChipCard {
            padding: 12px !important;
            border-radius: 18px !important;
            margin-top: 12px;
          }
          .evChipRow {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
          }

          .evFiltersCard {
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
            margin-top: 12px;
          }

          .evFiltersLeft {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            flex: 1;
            min-width: 260px;
          }

          .evLabel {
            font-weight: 900;
            font-size: 12px;
            opacity: 0.75;
          }

          .evSelect,
          .evSearch {
            border-radius: 14px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #fff;
            padding: 10px 12px;
            outline: none;
          }

          .evSearch {
            min-width: 280px;
          }

          .evResumo {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            min-width: 260px;
          }
          .evResumoItem {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            border-radius: 14px;
            padding: 10px;
          }
          .evResumoNum {
            font-size: 18px;
            font-weight: 900;
            color: #0a2a6a;
            line-height: 1;
          }
          .evResumoLabel {
            font-size: 12px;
            opacity: 0.75;
            margin-top: 3px;
            font-weight: 800;
          }

          .evInfoCard {
            padding: 16px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(10, 42, 106, 0.12) !important;
            background: #fff !important;
          }
          .evInfoTitle {
            font-weight: 900;
            color: #0a2a6a;
          }
          .evInfoSub {
            margin-top: 6px;
            font-size: 12px;
            opacity: 0.75;
            font-weight: 700;
          }

          .evTableCard {
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .evTableWrap {
            overflow-x: auto;
          }

          .evTable {
            width: 100%;
            min-width: 980px;
            border-collapse: collapse;
          }

          .evTable thead th {
            text-align: left;
            font-size: 12px;
            padding: 12px 10px;
            border-bottom: 1px solid rgba(10, 42, 106, 0.12);
            color: rgba(0, 0, 0, 0.7);
            font-weight: 900;
            background: rgba(247, 249, 255, 0.7);
          }

          .evTable tbody td {
            padding: 12px 10px;
            border-bottom: 1px solid rgba(10, 42, 106, 0.08);
            vertical-align: top;
          }

          .evEmpty {
            padding: 14px !important;
            opacity: 0.8;
          }

          .evTdStrong {
            font-weight: 900;
            color: #0a2a6a;
          }

          .evTdMuted {
            font-weight: 700;
            opacity: 0.85;
          }

          .evProgRow {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
          }

          .evStatus {
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
          }

          .evStatus.ok {
            background: rgba(20, 180, 90, 0.1);
            border-color: rgba(20, 180, 90, 0.22);
            color: rgba(14, 122, 61, 1);
          }

          .evStatus.pend {
            background: rgba(247, 198, 0, 0.12);
            border-color: rgba(247, 198, 0, 0.26);
            color: rgba(140, 104, 0, 1);
          }

          .evBar {
            margin-top: 8px;
            height: 8px;
            border-radius: 999px;
            background: rgba(10, 42, 106, 0.08);
            overflow: hidden;
          }
          .evBarFill {
            height: 8px;
            border-radius: 999px;
            background: #0b3b8a;
          }

          .evObs {
            margin-top: 12px;
            font-size: 12px;
            opacity: 0.75;
            font-weight: 700;
          }

          .evBottom {
            margin-top: 14px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .evBtnPill {
            padding: 8px 12px !important;
            border-radius: 999px !important;
          }

          @media (max-width: 820px) {
            .evSearch {
              min-width: 0;
              width: 100%;
            }
            .evResumo {
              width: 100%;
              min-width: 0;
            }
            .evSessName {
              max-width: 160px;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
