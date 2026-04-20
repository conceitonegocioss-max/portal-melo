"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { normalizeCpf } from "@/src/lib/utils";

type Categoria = "Comercial" | "Atendimento" | "Compliance" | "TI";

type ScriptPDF = {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: Categoria;
  versao: string;
  revisao?: string; // ex: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027"
  arquivoPdf: string; // /public...
};

type CienciaRegistro = {
  ciente: boolean;
  dataISO: string;
  versao: string;
  arquivoPdf: string;
};

function keyEvidencias(cpf: string) {
  return `portal_scripts_ciencia_v1_${cpf}`;
}

function formatarData(iso: string | null | undefined) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
}

function lerEvidencias(cpf: string): Record<string, CienciaRegistro> {
  try {
    const raw = localStorage.getItem(keyEvidencias(cpf));
    if (!raw) return {};
    return (JSON.parse(raw) || {}) as Record<string, CienciaRegistro>;
  } catch {
    return {};
  }
}

function salvarEvidencias(cpf: string, evid: Record<string, CienciaRegistro>) {
  localStorage.setItem(keyEvidencias(cpf), JSON.stringify(evid));
}

/** ✅ Seus PDFs (do /public/materiais/scripts/...) */
const SCRIPTS: ScriptPDF[] = [
  {
    id: "script-conta-corrente",
    titulo: "Script — Conta Corrente (PF/PJ)",
    categoria: "Comercial",
    versao: "3.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-conta-corrente-pf-pj.pdf",
  },
  {
    id: "script-consorcio",
    titulo: "Script — Consórcio",
    categoria: "Comercial",
    versao: "3.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-consorcio.pdf",
  },
  {
    id: "script-linhas-credito",
    titulo: "Script — Linhas de Crédito",
    categoria: "Comercial",
    versao: "3.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-linhas-de-credito.pdf",
  },
  {
    id: "script-portabilidade",
    titulo: "Script — Linha de Crédito (Portabilidade)",
    categoria: "Comercial",
    versao: "3.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-portabilidade.pdf",
  },
  {
    id: "script-ourocap",
    titulo: "Script — Ourocap",
    categoria: "Comercial",
    versao: "3.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-ourocap.pdf",
  },
  {
    id: "script-seguro-prestamista",
    titulo: "Script — Seguro Prestamista",
    categoria: "Comercial",
    versao: "2.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-seguro-prestamista.pdf",
  },
  {
    id: "script-oferta-mailing",
    titulo: "Script — Oferta Mailing",
    categoria: "Atendimento",
    versao: "2.0",
    revisao: "Revisão: Jan/2026 · Próx. Revisão: Jan/2027",
    arquivoPdf: "/materiais/scripts/script-oferta-mailing.pdf",
  },
];

function catChipClass(c: Categoria) {
  if (c === "Compliance") return "chip chip-blue";
  if (c === "TI") return "chip chip-purple";
  if (c === "Atendimento") return "chip chip-green";
  return "chip chip-yellow"; // Comercial
}

export default function CentralScriptsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [cpf, setCpf] = useState("");
  const [perfil, setPerfil] = useState("");

  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState<"todas" | Categoria>("todas");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    setCpf(normalizeCpf(session.cpf || ""));
    setPerfil(session.perfil || "");
  }, [router]);

  const evidencias = useMemo(() => {
    if (!mounted || !cpf) return {};
    return lerEvidencias(cpf);
  }, [mounted, cpf]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return SCRIPTS.filter((s) => {
      const okCat = cat === "todas" ? true : s.categoria === cat;
      if (!okCat) return false;

      if (!q) return true;
      const hay = [s.titulo, s.categoria, s.versao, s.revisao || ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [busca, cat]);

  const total = filtrados.length;

  const totalCiente = useMemo(() => {
    const ev = evidencias || {};
    return filtrados.filter((s) => Boolean(ev[s.id]?.ciente)).length;
  }, [evidencias, filtrados]);

  function registrarCiencia(item: ScriptPDF) {
    if (!cpf) return;

    const ev = lerEvidencias(cpf);
    ev[item.id] = {
      ciente: true,
      dataISO: new Date().toISOString(),
      versao: item.versao,
      arquivoPdf: item.arquivoPdf,
    };
    salvarEvidencias(cpf, ev);

    setToast("✅ Ciência registrada (evidência salva).");
    window.setTimeout(() => setToast(""), 2200);
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
        {/* ✅ Voltar */}
        <div style={{ marginBottom: 10 }}>
          <Link className="btn btn-outline small" href="/colaborador">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <div className="headRow">
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>
              <h2>Central de Scripts</h2>
              <div className="bar" />
            </div>

            <p className="section-text" style={{ maxWidth: 900 }}>
              Scripts operacionais em PDF — com registro de ciência para fins de compliance (CPF, data/hora e versão).
            </p>
          </div>

          <div className="resumeBox">
            <div className="resumeTitle">Resumo (filtro atual)</div>
            <div className="resumeGrid">
              <div className="resumeItem">
                <div className="resumeNum">{total}</div>
                <div className="resumeLabel">itens</div>
              </div>
              <div className="resumeItem">
                <div className="resumeNum">{totalCiente}</div>
                <div className="resumeLabel">com ciência</div>
              </div>
            </div>
            <div className="resumeSub">
              CPF logado: <strong>{cpf || "—"}</strong>
              {perfil ? (
                <>
                  {" "}
                  • Perfil: <strong>{perfil}</strong>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Busca + filtro */}
        <div className="filters">
          <input
            className="search"
            placeholder="Buscar por título, categoria ou versão…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <select className="select" value={cat} onChange={(e) => setCat(e.target.value as any)}>
            <option value="todas">Todas as categorias</option>
            <option value="Comercial">Comercial</option>
            <option value="Atendimento">Atendimento</option>
            <option value="Compliance">Compliance</option>
            <option value="TI">TI</option>
          </select>
        </div>

        {/* Cards documento */}
        <div className="grid">
          {filtrados.map((item) => {
            const ev = evidencias[item.id];
            const ciente = Boolean(ev?.ciente);

            return (
              <div key={item.id} className={`docCard ${ciente ? "done" : ""}`}>
                <div className="docTop">
                  <div className="docIcon" aria-hidden="true">
                    🧾
                  </div>

                  <div className="docMain">
                    <div className="docTitleRow">
                      <div className="docTitle">{item.titulo}</div>
                      {ciente ? <span className="chip chip-ok">✅ Ciente</span> : <span className="chip chip-warn">⏳ Sem ciência</span>}
                    </div>

                    <div className="docChips">
                      <span className={catChipClass(item.categoria)}>{item.categoria}</span>
                      <span className="chip chip-light">v{item.versao}</span>
                      {item.revisao ? <span className="chip chip-muted">{item.revisao}</span> : null}
                    </div>

                    {item.descricao ? <div className="docDesc">{item.descricao}</div> : null}
                  </div>
                </div>

                <div className="docActions">
                  <a className="btn btn-yellow" href={item.arquivoPdf} target="_blank" rel="noopener noreferrer">
                    Abrir PDF
                  </a>

                  <button className="btn btn-outline" onClick={() => registrarCiencia(item)} title="Grava CPF, data/hora e versão">
                    Registrar ciência
                  </button>
                </div>

                <div className="docFoot">
                  {ciente ? (
                    <>
                      Ciência registrada em <strong>{formatarData(ev?.dataISO)}</strong> • versão <strong>v{ev?.versao}</strong>
                    </>
                  ) : (
                    <>Registre a ciência após leitura do PDF.</>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {toast ? <div className="toast">{toast}</div> : null}

        {/* ⚠️ Sem footer aqui (evita duplicação). */}

        <style jsx global>{`
          .headRow {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
          }

          .resumeBox {
            min-width: 260px;
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            border-radius: 18px;
            padding: 14px;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
          }
          .resumeTitle {
            font-weight: 900;
            font-size: 12px;
            opacity: 0.7;
          }
          .resumeGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 8px;
          }
          .resumeItem {
            background: #f7f9ff;
            border: 1px solid rgba(10, 42, 106, 0.1);
            border-radius: 14px;
            padding: 10px;
          }
          .resumeNum {
            font-size: 18px;
            font-weight: 900;
            color: #0a2a6a;
            line-height: 1;
          }
          .resumeLabel {
            font-size: 12px;
            opacity: 0.75;
            margin-top: 3px;
            font-weight: 700;
          }
          .resumeSub {
            margin-top: 8px;
            font-size: 12px;
            opacity: 0.75;
          }

          .filters {
            display: grid;
            grid-template-columns: 1fr 240px;
            gap: 12px;
            margin-top: 12px;
            margin-bottom: 14px;
          }
          @media (max-width: 820px) {
            .filters {
              grid-template-columns: 1fr;
            }
          }
          .search,
          .select {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            padding: 12px 14px;
            background: #fff;
            outline: none;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-top: 6px;
          }
          @media (max-width: 1100px) {
            .grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 760px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }

          .docCard {
            background: #fff;
            border-radius: 18px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .docCard.done {
            border-color: rgba(20, 180, 90, 0.25);
          }

          .docTop {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .docIcon {
            width: 40px;
            height: 40px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            background: #f7f9ff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            flex: 0 0 auto;
            font-size: 18px;
          }

          .docMain {
            min-width: 0;
            flex: 1;
          }

          .docTitleRow {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }
          .docTitle {
            font-weight: 900;
            font-size: 14px;
            color: #0a2a6a;
            line-height: 1.2;
          }

          .docChips {
            margin-top: 8px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .docDesc {
            margin-top: 10px;
            font-size: 13px;
            opacity: 0.85;
            font-weight: 650;
            line-height: 1.35;
          }

          .docActions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .docFoot {
            font-size: 12px;
            opacity: 0.75;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            font-size: 11px;
            font-weight: 900;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #f7f9ff;
            color: #0a2a6a;
            line-height: 1;
          }
          .chip-light {
            background: rgba(0, 0, 0, 0.03);
            border-color: rgba(0, 0, 0, 0.08);
            color: rgba(0, 0, 0, 0.72);
          }
          .chip-muted {
            background: rgba(11, 59, 138, 0.06);
            border-color: rgba(11, 59, 138, 0.14);
            color: rgba(11, 59, 138, 0.95);
            font-weight: 800;
          }
          .chip-ok {
            background: rgba(20, 180, 90, 0.1);
            border-color: rgba(20, 180, 90, 0.22);
            color: rgba(14, 122, 61, 1);
          }
          .chip-warn {
            background: rgba(247, 198, 0, 0.12);
            border-color: rgba(247, 198, 0, 0.26);
            color: rgba(140, 104, 0, 1);
          }
          .chip-blue {
            background: rgba(11, 79, 217, 0.08);
            border-color: rgba(11, 79, 217, 0.18);
            color: rgba(11, 79, 217, 1);
          }
          .chip-purple {
            background: rgba(120, 60, 255, 0.08);
            border-color: rgba(120, 60, 255, 0.18);
            color: rgba(120, 60, 255, 1);
          }
          .chip-green {
            background: rgba(20, 180, 90, 0.08);
            border-color: rgba(20, 180, 90, 0.18);
            color: rgba(14, 122, 61, 1);
          }
          .chip-yellow {
            background: rgba(247, 198, 0, 0.12);
            border-color: rgba(247, 198, 0, 0.26);
            color: rgba(140, 104, 0, 1);
          }

          .toast {
            position: fixed;
            right: 16px;
            bottom: 16px;
            background: rgba(10, 42, 106, 0.92);
            color: #fff;
            padding: 12px 14px;
            border-radius: 14px;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.18);
            font-weight: 800;
            font-size: 12px;
            z-index: 50;
          }
        `}</style>
      </div>
    </main>
  );
}
