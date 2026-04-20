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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

const PAGE_SIZE = 50;

export default function AuditEventsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<AuditEventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/audit/events", { method: "GET" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Falha ao carregar.");

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErr("Não foi possível carregar o Logger Central.");
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

  const uniqueTypes = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) if (it?.type) s.add(it.type);
    return ["TODOS", ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    return (items || []).filter((it) => {
      if (typeFilter !== "TODOS" && it.type !== typeFilter) return false;
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
        it.userAgent,
        it.meta ? JSON.stringify(it.meta) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [items, q, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, typeFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const rangeText = useMemo(() => {
    if (total === 0) return "Mostrando 0–0 de 0";
    const start = (pageSafe - 1) * PAGE_SIZE + 1;
    const end = Math.min(pageSafe * PAGE_SIZE, total);
    return `Mostrando ${start}–${end} de ${total}`;
  }, [pageSafe, total]);

  function exportarJson() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-events-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function limparLog() {
    const ok = window.confirm(
      "Tem certeza que deseja LIMPAR TODO o Logger Central?\n\nEssa ação é irreversível."
    );
    if (!ok) return;

    try {
      setClearing(true);
      const res = await fetch("/api/audit/events", { method: "DELETE" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Falha ao limpar.");

      await load();
      setPage(1);
      alert("✅ Logger Central limpo com sucesso.");
    } catch {
      alert("❌ Não foi possível limpar o Logger Central.");
    } finally {
      setClearing(false);
    }
  }

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
        <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/colaborador/auditoria" className="btn btn-outline small">
            ← Voltar para Auditoria
          </Link>

          <Link href="/colaborador" className="btn btn-outline small">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <div className="section-title">
          <h2>Logger Central — Eventos</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 980 }}>
          Registro centralizado de eventos do portal (ações e rastreabilidade). Use busca e filtros para localizar ocorrências.
        </p>

        <div className="auditTools">
          <input
            className="auditInput"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por CPF, nome, tipo, módulo, item, IP, obs..."
          />

          <select className="auditSelect" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button className="btn btn-yellow small" onClick={exportarJson} disabled={filtered.length === 0}>
            Exportar JSON ({filtered.length})
          </button>

          <button
            className="btn btn-outline small"
            onClick={limparLog}
            disabled={clearing}
            style={{ borderColor: "rgba(210,30,30,0.25)", color: "rgba(140,0,0,0.95)" }}
          >
            {clearing ? "Limpando..." : "Limpar logger"}
          </button>
        </div>

        <div className="auditCard">
          <div className="auditCardTop">
            <div>
              <strong>{rangeText}</strong> • Página {pageSafe} de {totalPages}
            </div>
            <div className="auditHint">
              Dica: em ambiente local, IP pode aparecer como <code>::1</code>.
            </div>
          </div>

          <div className="pagerRow">
            <button
              className="btn btn-outline small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
            >
              ← Anterior
            </button>
            <button
              className="btn btn-outline small"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
            >
              Próxima →
            </button>
          </div>

          {loading ? (
            <p style={{ margin: 0 }}>Carregando…</p>
          ) : err ? (
            <p style={{ margin: 0, color: "rgba(140,0,0,.95)", fontWeight: 800 }}>{err}</p>
          ) : total === 0 ? (
            <p style={{ margin: 0, opacity: 0.75 }}>Nenhum evento encontrado.</p>
          ) : (
            <div className="auditTableWrap">
              <table className="auditTable">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Tipo</th>
                    <th>Ator</th>
                    <th>Módulo</th>
                    <th>Entidade</th>
                    <th>IP</th>
                    <th>Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((it) => (
                    <tr key={it.id}>
                      <td>{formatDate(it.atISO)}</td>
                      <td style={{ fontFamily: "monospace" }}>{it.type}</td>
                      <td>
                        <div style={{ fontWeight: 900 }}>{it.actorNome || "—"}</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          {it.actorCpf ? `CPF: ${it.actorCpf}` : "CPF: —"} {it.actorPerfil ? `• ${it.actorPerfil}` : ""}
                        </div>
                      </td>
                      <td>{it.module || "—"}</td>
                      <td title={it.entityId || ""}>
                        {it.entityTitle || it.entityId || "—"}
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{it.ip || "—"}</td>
                      <td title={it.userAgent || ""}>{it.obs || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <style jsx global>{`
          .auditTools {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            margin: 14px 0;
          }
          .auditInput {
            flex: 1;
            min-width: 260px;
            border-radius: 999px;
            border: 1px solid rgba(10, 42, 106, 0.14);
            padding: 10px 12px;
            background: #fff;
            outline: none;
            font-weight: 700;
          }
          .auditSelect {
            height: 40px;
            border-radius: 999px;
            padding: 0 12px;
            border: 1px solid rgba(10, 42, 106, 0.14);
            background: #fff;
            font-weight: 800;
            outline: none;
          }

          .auditCard {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.08);
            border-radius: 14px;
            padding: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          }
          .auditCardTop {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 10px;
          }
          .auditHint {
            font-size: 12px;
            opacity: 0.7;
          }

          .pagerRow {
            display: flex;
            gap: 10px;
            justify-content: flex-start;
            align-items: center;
            flex-wrap: wrap;
            margin: 6px 0 12px;
          }

          .auditTableWrap {
            width: 100%;
            overflow: auto;
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.06);
          }
          .auditTable {
            width: 100%;
            border-collapse: collapse;
            min-width: 980px;
            background: #fff;
          }
          .auditTable th,
          .auditTable td {
            padding: 10px 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            text-align: left;
            vertical-align: top;
            font-size: 12px;
            font-weight: 700;
          }
          .auditTable th {
            position: sticky;
            top: 0;
            background: #f6f8fe;
            z-index: 1;
            font-weight: 900;
            color: #0a2a6a;
          }
        `}</style>
      </div>
    </main>
  );
}
