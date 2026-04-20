"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";
function normalizeCpf(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

const ROUTES = {
  HOME: "/colaborador",
  TREINAMENTOS: "/colaborador/treinamentos",
  PROVAS: "/colaborador/provas",
  MATERIAIS: "/colaborador/materiais",
  TERMO: "/colaborador/termo-de-confidencialidade",
  SCRIPTS: "/colaborador/auditoria/scripts",
  GOVERNANCA: "/colaborador/governanca",

  // ADMIN
  AUDITORIA: "/colaborador/auditoria",
  EVIDENCIAS: "/colaborador/auditoria/evidencias",
  DOCUMENTOS_INTERNOS: "/colaborador/auditoria/documentos-internos",
};

const TOTAL_TREINAMENTOS = 16;

function keyByCpf(cpf: string) {
  return `portal_treinamentos_progress_v1_${cpf}`;
}

function lerProgressoPorCpf(cpf: string): { concluidos: number; ultimaISO: string | null } {
  const raw = localStorage.getItem(keyByCpf(cpf));
  if (!raw) return { concluidos: 0, ultimaISO: null };

  try {
    const obj = JSON.parse(raw) as Record<string, { status: string; dataISO: string }>;
    const values = Object.values(obj || {});
    const concluidos = values.filter((v) => String(v?.status || "").toLowerCase().includes("conclu")).length;

    const datas = values.map((v) => v?.dataISO).filter(Boolean) as string[];
    const ultima = datas.length ? datas.sort().slice(-1)[0] : null;

    return { concluidos, ultimaISO: ultima };
  } catch {
    return { concluidos: 0, ultimaISO: null };
  }
}

function formatarData(iso: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

export default function ColaboradorHomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [sessionNome, setSessionNome] = useState<string>("");
  const [sessionCpf, setSessionCpf] = useState<string>("");
  const [sessionPerfil, setSessionPerfil] = useState<string>("");
  const [sessionEmpresa, setSessionEmpresa] = useState<string>("");

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    const cpfLimpo = normalizeCpf(session.cpf || "");
    setSessionNome(session.nome || "");
    setSessionCpf(cpfLimpo);
    setSessionPerfil(session.perfil || "");

    const user = COLABORADORES.find((c) => normalizeCpf(c.cpf) === cpfLimpo);
    setSessionEmpresa((user?.empresa || "").trim());
  }, [router]);

  const isAdmin = sessionPerfil === "ADMIN";

  const acessoLiberado = useMemo(() => {
    if (isAdmin) return true;
    return Boolean(sessionEmpresa && sessionEmpresa.trim().length > 0);
  }, [isAdmin, sessionEmpresa]);

  const progresso = useMemo(() => {
    if (!mounted || !sessionCpf) return { concluidos: 0, ultimaISO: null as string | null };
    return lerProgressoPorCpf(sessionCpf);
  }, [mounted, sessionCpf]);

  const pct = useMemo(() => {
    return TOTAL_TREINAMENTOS > 0 ? Math.round((progresso.concluidos / TOTAL_TREINAMENTOS) * 100) : 0;
  }, [progresso.concluidos]);

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
      <div className="ph">
        <div className="container">
          {/* TOP (SEM BOTÕES) */}
          <div className="phTop">
            <div className="phTopLeft">
              <span className="phHello">
                Olá{sessionNome ? `, ${sessionNome}` : ""} <span className="phWave">👋</span>
              </span>

              <span className="phSub">
                CPF: <strong>{sessionCpf || "—"}</strong>
                {isAdmin ? (
                  <span style={{ marginLeft: 10 }}>
                    • Perfil: <strong>ADMIN</strong>
                  </span>
                ) : (
                  <span style={{ marginLeft: 10 }}>
                    • Empresa: <strong>{sessionEmpresa || "—"}</strong>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* HERO (PROGRESSO / STATUS) */}
          <div className="phHero">
            <div className="phHeroLeft">
              <div className="phProgressRow">
                <div className="phMetric">
                  <span className="phMetricLabel">Concluídos</span>
                  <span className="phMetricValue">{progresso.concluidos}</span>
                </div>
                <div className="phMetric">
                  <span className="phMetricLabel">Total</span>
                  <span className="phMetricValue">{TOTAL_TREINAMENTOS}</span>
                </div>
                <div className="phMetric">
                  <span className="phMetricLabel">Percentual</span>
                  <span className="phMetricValue">{pct}%</span>
                </div>
              </div>

              <div className="phProgressBar" aria-label="Barra de progresso">
                <div className="phProgressFill" style={{ width: `${pct}%` }} />
              </div>

              <div className="phLast">
                Última atualização: <strong>{formatarData(progresso.ultimaISO)}</strong>
              </div>
            </div>

            <div className="phHeroRight">
              {isAdmin ? (
                <div className="phAdminBox">
                  <div className="phAdminPill">🛡️ Perfil ADMIN — acesso total</div>
                  <div className="phAdminSub">Ações administrativas são registradas para fins de auditoria e conformidade.</div>
                </div>
              ) : (
                <div style={{ textAlign: "right" }}>
                  <div className={`phBadge ${acessoLiberado ? "ok" : "wait"}`}>
                    {acessoLiberado ? "✅ Cadastro ok (empresa identificada)" : "⏳ Cadastro incompleto (empresa vazia)"}
                  </div>

                  {!acessoLiberado ? (
                    <div className="phAdminSub" style={{ marginTop: 8 }}>
                      Peça ao gestor/qualidade para corrigir seu cadastro (campo <strong>empresa</strong>).
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* GRID PRINCIPAL */}
          <div className="phGrid">
            <HomeCard
              icon="📘"
              title="Treinamentos"
              desc="Acesse os conteúdos obrigatórios e marque como concluído ao finalizar."
              href={ROUTES.TREINAMENTOS}
              btnLabel="Acessar treinamentos"
              variant="yellow"
              locked={!acessoLiberado}
            />

            <HomeCard
              icon="📝"
              title="Provas & Avaliações"
              desc="Central de avaliações vinculadas aos treinamentos obrigatórios."
              href={ROUTES.PROVAS}
              btnLabel="Acessar provas"
              variant="yellow"
              locked={!acessoLiberado}
            />

            <HomeCard
              icon="📄"
              title="Materiais & Políticas"
              desc="Políticas internas e materiais de apoio (consulta)."
              href={ROUTES.MATERIAIS}
              btnLabel="Ver materiais"
              variant="yellow"
              locked={!acessoLiberado}
            />

            <HomeCard
              icon="🔒"
              title="Termo de Confidencialidade"
              desc="Abra a página do termo e registre ciência para fins de compliance e auditoria."
              href={ROUTES.TERMO}
              btnLabel="Abrir termo (registrar ciência)"
              variant="yellow"
              locked={!acessoLiberado}
            />

            <HomeCard
              icon="🧾"
              title="Central de Scripts"
              desc="Scripts operacionais padronizados com registro de ciência (CPF, data/hora e versão)."
              href={ROUTES.SCRIPTS}
              btnLabel="Acessar scripts"
              variant="yellow"
              locked={!acessoLiberado}
            />

            <HomeCard
              icon="📊"
              title="Central de Governança"
              desc="Painel institucional de políticas, procedimentos e indicadores de compliance."
              href={ROUTES.GOVERNANCA}
              btnLabel="Acessar governança"
              variant="yellow"
              locked={!acessoLiberado}
            />

            {isAdmin ? (
              <HomeCard
                icon="🗂️"
                title="Auditoria & Evidências"
                desc="Central administrativa (evidências, documentos internos e trilhas de auditoria)."
                href={ROUTES.AUDITORIA}
                btnLabel="Acessar auditoria"
                variant="outline"
                locked={false}
              />
            ) : null}
          </div>
        </div>

        <style jsx global>{`
          .phHero {
            display: grid;
            grid-template-columns: 1.4fr 0.6fr;
            gap: 14px;
            padding: 16px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(10, 42, 106, 0.12) !important;
            background: linear-gradient(180deg, #ffffff, #f7f9ff) !important;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06) !important;
            margin: 10px 0 14px;
          }
          @media (max-width: 980px) {
            .phHero {
              grid-template-columns: 1fr;
            }
          }

          .phTop {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 10px 0 6px;
          }
          .phTopLeft {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .phHello {
            font-weight: 900;
            font-size: 13px;
          }
          .phSub {
            font-size: 12px;
            opacity: 0.75;
          }

          .phProgressRow {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 10px;
          }
          @media (max-width: 520px) {
            .phProgressRow {
              grid-template-columns: 1fr;
            }
          }
          .phMetric {
            border: 1px solid rgba(10, 42, 106, 0.08);
            background: #fff;
            border-radius: 14px;
            padding: 12px;
          }
          .phMetricLabel {
            font-size: 12px;
            opacity: 0.7;
            display: block;
          }
          .phMetricValue {
            font-size: 18px;
            font-weight: 900;
            color: #0a2a6a;
            display: block;
          }

          .phProgressBar {
            width: 100%;
            height: 12px;
            border-radius: 999px;
            overflow: hidden;
            background: #e9edf5;
            border: 1px solid rgba(10, 42, 106, 0.08);
          }
          .phProgressFill {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, #0b3b8a, #0b4fd9);
            box-shadow: 0 10px 25px rgba(11, 79, 217, 0.14);
          }
          .phLast {
            margin-top: 10px;
            font-size: 12px;
            opacity: 0.75;
          }

          .phHeroRight {
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }

          .phBadge {
            font-size: 12px;
            font-weight: 900;
            border-radius: 999px;
            padding: 8px 10px;
            border: 1px solid;
            width: fit-content;
            margin-left: auto;
          }
          .phBadge.ok {
            color: #0f5132;
            background: #eaf7ef;
            border-color: rgba(27, 122, 58, 0.18);
          }
          .phBadge.wait {
            color: #7a5a00;
            background: #fff7e3;
            border-color: rgba(255, 196, 0, 0.3);
          }

          .phAdminBox {
            width: 100%;
            text-align: right;
            display: grid;
            gap: 8px;
            justify-items: end;
          }
          .phAdminPill {
            font-size: 12px;
            font-weight: 900;
            color: #0b3b8a;
            background: #e7efff;
            border: 1px solid #cfe0ff;
            padding: 10px 12px;
            border-radius: 999px;
          }
          .phAdminSub {
            font-size: 12px;
            opacity: 0.7;
          }

          .phGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 10px;
          }
          @media (max-width: 900px) {
            .phGrid {
              grid-template-columns: 1fr;
            }
          }

          .phCard {
            padding: 16px !important;
            border-radius: 18px !important;
            background: #fff !important;
            border: 1px solid rgba(10, 42, 106, 0.1) !important;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06) !important;
            display: flex;
            flex-direction: column;
            min-height: 170px;
          }
          .phCardHead {
            display: flex;
            gap: 10px;
            align-items: flex-start;
          }
          .phIcon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            background: rgba(11, 79, 217, 0.08);
            border: 1px solid rgba(11, 79, 217, 0.12);
          }
          .phTitle {
            margin: 0;
            font-weight: 900;
            font-size: 16px;
          }
          .phDesc {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: 0.85;
          }
          .phActions {
            margin-top: auto;
            padding-top: 12px;
          }
          .phLocked {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 900;
            color: #7a5a00;
            background: #fff7e3;
            border: 1px solid rgba(255, 196, 0, 0.3);
            border-radius: 999px;
            padding: 8px 10px;
            text-align: center;
          }
        `}</style>
      </div>
    </main>
  );
}

function HomeCard(props: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  btnLabel: string;
  variant: "yellow" | "outline";
  locked: boolean;
}) {
  const { icon, title, desc, href, btnLabel, variant, locked } = props;
  const btnClass = variant === "yellow" ? "btn btn-yellow" : "btn btn-outline";

  return (
    <div className="phCard">
      <div className="phCardHead">
        <div className="phIcon">{icon}</div>
        <div>
          <h3 className="phTitle">{title}</h3>
          <p className="phDesc">{desc}</p>
        </div>
      </div>

      <div className="phActions">
        <Link
          href={href}
          className={btnClass}
          style={{
            width: "100%",
            textAlign: "center",
            pointerEvents: locked ? "none" : "auto",
            opacity: locked ? 0.55 : 1,
          }}
        >
          {btnLabel}
        </Link>

        {locked ? <div className="phLocked">⏳ Cadastro incompleto (empresa vazia)</div> : null}
      </div>
    </div>
  );
}