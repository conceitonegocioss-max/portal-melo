"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";

type LoginAction = "LOGIN_OK" | "LOGIN_FALHA" | "LOGOUT";

type AuditLoginEntry = {
  id: string;
  atISO: string;
  action?: LoginAction;
  cpf: string;
  nome?: string;
  empresa?: string;
  perfil?: string;
  ip?: string;
  userAgent?: string;
  obs?: string;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

const PAGE_SIZE = 50;

export default function AuditLoginsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<AuditLoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState<"TODOS" | LoginAction>("TODOS");

  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/audit/logins", { method: "GET" });
      const data = await res.json();

      if (!data?.ok) throw new Error("Falha ao carregar logs.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErr("Não foi possível carregar o log de login.");
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
    const query = (q || "").trim().toLowerCase();

    return (items || []).filter((it) => {
      const act = (it.action || "") as LoginAction | "";
      if (actionFilter !== "TODOS" && act !== actionFilter) return false;

      if (!query) return true;

      const hay = [
        it.cpf,
        it.nome,
        it.perfil,
        it.empresa,
        it.ip,
        it.userAgent,
        it.obs,
        it.action,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [items, q, actionFilter]);

  // ✅ Sempre que mudar filtro/busca, volta para página 1
  useEffect(() => {
    setPage(1);
  }, [q, actionFilter]);

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
    a.download = `audit-logins-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function limparLog() {
    const ok = window.confirm(
      "Tem certeza que deseja LIMPAR TODO o log de login?\n\nEssa ação é irreversível."
    );
    if (!ok) return;

    try {
      setClearing(true);
      const res = await fetch("/api/audit/logins", { method: "DELETE" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Falha ao limpar.");

      await load();
      setPage(1);
      alert("✅ Log de login limpo com sucesso.");
    } catch {
      alert("❌ Não foi possível limpar o log.");
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
          <h2>Log de Login</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 980 }}>
          Registros de autenticação (sucesso/falha), com data/hora, CPF, perfil e contexto técnico.
        </p>

        <div className="auditTools">
          <input
            className="auditInput"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por CPF, nome, perfil, IP, obs..."
          />

          <select
            className="auditSelect"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as any)}
          >
            <option value="TODOS">Todos</option>
            <option value="LOGIN_OK">LOGIN_OK</option>
            <option value="LOGIN_FALHA">LOGIN_FALHA</option>
            <option value="LOGOUT">LOGOUT</option>
          </select>

          <button
            className="btn btn-yellow small"
            onClick={exportarJson}
            disabled={filtered.length === 0}
            title={filtered.length === 0 ? "Nada para exportar" : "Baixar JSON filtrado"}
          >
            Exportar JSON ({filtered.length})
          </button>

          <button
            className="btn btn-outline small"
            onClick={limparLog}
            disabled={clearing}
            title="Limpar todo o log (somente ADMIN)"
            style={{ borderColor: "rgba(210,30,30,0.25)", color: "rgba(140,0,0,0.95)" }}
          >
            {clearing ? "Limpando..." : "Limpar log"}
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
            <p style={{ margin: 0, opacity: 0.75 }}>Nenhum registro encontrado.</p>
          ) : (
            <div className="auditTableWrap">
              <table className="auditTable">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Ação</th>
                    <th>CPF</th>
                    <th>Nome</th>
                    <th>Perfil</th>
                    <th>IP</th>
                    <th>Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((it) => {
                    const act = (it.action || "") as LoginAction | "";
                    const badgeClass =
                      act === "LOGIN_OK"
                        ? "badge ok"
                        : act === "LOGIN_FALHA"
                        ? "badge fail"
                        : "badge neutral";

                    return (
                      <tr key={it.id}>
                        <td>{formatDate(it.atISO)}</td>
                        <td>
                          <span className={badgeClass}>{act || "—"}</span>
                        </td>
                        <td style={{ fontFamily: "monospace" }}>{it.cpf || "—"}</td>
                        <td>{it.nome || "—"}</td>
                        <td>{it.perfil || "—"}</td>
                        <td style={{ fontFamily: "monospace" }}>{it.ip || "—"}</td>
                        <td title={it.userAgent || ""}>{it.obs || "—"}</td>
                      </tr>
                    );
                  })}
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
            min-width: 920px;
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

          .badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #eef3ff;
            color: #0a2a6a;
            white-space: nowrap;
          }
          .badge.ok {
            background: #eaf7ef;
            border-color: rgba(27, 122, 58, 0.2);
            color: #1b7a3a;
          }
          .badge.fail {
            background: rgba(210, 30, 30, 0.06);
            border-color: rgba(210, 30, 30, 0.18);
            color: rgba(140, 0, 0, 0.95);
          }
          .badge.neutral {
            opacity: 0.85;
          }
        `}</style>
      </div>
    </main>
  );
}
