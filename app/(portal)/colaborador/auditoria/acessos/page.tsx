"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { listAccessLog } from "@/src/lib/accessLog";

const ROUTES = {
  AUDITORIA: "/colaborador/auditoria",
  HOME: "/colaborador",
};

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
}

function labelAction(a: any) {
  if (a === "STATUS_CHANGE") return "Status (ATIVO/INATIVO)";
  if (a === "PERFIL_CHANGE") return "Perfil (ADMIN/COLABORADOR)";
  return String(a || "—");
}

export default function AcessosLogPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    setReady(true);
  }, [router]);

  const rows = useMemo(() => {
    const items = listAccessLog() || [];
    const query = (q || "").trim().toLowerCase();

    if (!query) return items;

    return items.filter((x: any) => {
      return (
        (x.targetNome || "").toLowerCase().includes(query) ||
        (x.targetEmpresa || "").toLowerCase().includes(query) ||
        (x.actorNome || "").toLowerCase().includes(query) ||
        String(x.targetCpf || "").includes(query) ||
        String(x.action || "").toLowerCase().includes(query) ||
        String(x.before || "").toLowerCase().includes(query) ||
        String(x.after || "").toLowerCase().includes(query)
      );
    });
  }, [q]);

  function exportarPDF() {
    window.print();
  }

  if (!ready) {
    return (
      <main className="section gray" aria-busy="true">
        <div className="container">
          <p style={{ opacity: 0.85, fontWeight: 700 }}>Validando permissões de acesso…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        <div className="card" style={{ padding: 16, borderRadius: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Registro de Alterações de Acesso</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Evidência auditável • Quem alterou / o que mudou / quando mudou • Exportável em PDF
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={exportarPDF}>
                Exportar evidência (PDF)
              </button>
              <Link className="btn btn-outline" href={ROUTES.AUDITORIA}>
                ← Voltar
              </Link>
              <Link className="btn btn-outline" href={ROUTES.HOME}>
                Área do Colaborador
              </Link>
            </div>
          </div>

          <hr style={{ margin: "14px 0", border: 0, borderTop: "1px solid #e6e8ee" }} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, empresa, responsável, ação, antes/depois…"
              style={{
                flex: "1 1 320px",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(10,42,106,0.18)",
                fontWeight: 700,
              }}
            />
            <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>
              Registros: <strong>{rows.length}</strong>
            </div>
          </div>

          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 980 }}>
              <thead>
                <tr>
                  {["Data/Hora", "Ação", "Usuário afetado", "Empresa", "Antes → Depois", "Responsável"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "1px solid rgba(0,0,0,0.10)",
                        background: "rgba(247,249,255,0.7)",
                        fontWeight: 900,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 900 }}>
                      {fmt(r.createdAtISO)}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {labelAction(r.action)}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontWeight: 900 }}>{r.targetNome || "—"}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{r.targetCpf || "—"}</div>
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {r.targetEmpresa || "—"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <span style={{ fontWeight: 900 }}>{r.before || "—"}</span> →{" "}
                      <span style={{ fontWeight: 900 }}>{r.after || "—"}</span>
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontWeight: 900 }}>{r.actorNome || "ADMIN"}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{r.actorCpf || "—"}</div>
                    </td>
                  </tr>
                ))}

                {!rows.length ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 14, opacity: 0.75, fontWeight: 800 }}>
                      Nenhum registro encontrado (ainda).
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        Dica: volte em <strong>/colaborador/auditoria/usuarios</strong>, altere um Status/Perfil e retorne aqui.
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, fontWeight: 700 }}>
            Nota (auditoria): este registro documenta alterações no controle de acessos do Portal.
          </div>
        </div>

        <style jsx global>{`
          @media print {
            header,
            nav,
            .btn,
            button,
            input {
              display: none !important;
            }
            main.section.gray {
              background: #fff !important;
            }
            .container {
              max-width: 100% !important;
              padding: 0 !important;
            }
            .card {
              border: none !important;
              box-shadow: none !important;
            }
            table {
              font-size: 11px !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
