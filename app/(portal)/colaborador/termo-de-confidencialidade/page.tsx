"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";

const TERMO = {
  id: "termo-confidencialidade",
  titulo: "Termo de Confidencialidade e Sigilo",
  versao: "v3.0",
  revisao: "02/2027",
  categoria: "Compliance / Segurança da Informação / LGPD",
  responsavel: "Área de Qualidade e Compliance",
  arquivoPdf: "/materiais/termos/termo-confidencialidade-sgq.pdf",
};

function onlyDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function mascararCpf(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return cpf || "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function formatarData(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
}

export default function TermoConfidencialidadePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sessionNome, setSessionNome] = useState("");
  const [sessionCpf, setSessionCpf] = useState("");
  const [sessionPerfil, setSessionPerfil] = useState("");
  const [sessionEmpresa, setSessionEmpresa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cienciaISO, setCienciaISO] = useState<string | null>(null);
  const [confirmouLeitura, setConfirmouLeitura] = useState(false);

  const cienciaRegistrada = Boolean(cienciaISO);

  const statusLabel = useMemo(() => {
    if (cienciaRegistrada) return "Ciência registrada";
    return "Pendente de ciência";
  }, [cienciaRegistrada]);

  async function consultarCiencia(cpf: string) {
    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch(
        `/api/audit/events?actorCpf=${encodeURIComponent(cpf)}&module=termos&action=TERMO_CONFIDENCIALIDADE_CIENCIA`,
        { cache: "no-store" }
      );
      const data = await res.json();

      const progress = data?.progress || {};
      const item = progress[TERMO.id] || progress[TERMO.titulo] || null;

      if (item?.dataISO) {
        setCienciaISO(item.dataISO);
        setConfirmouLeitura(true);
      } else {
        setCienciaISO(null);
      }
    } catch {
      setErro("Não foi possível consultar se já existe ciência registrada para este termo.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    setMounted(true);

    const session: any = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    const cpf = onlyDigits(session.cpf || "");
    const user = COLABORADORES.find((c) => onlyDigits(c.cpf) === cpf);

    setSessionNome(session.nome || user?.nome || "");
    setSessionCpf(cpf);
    setSessionPerfil(session.perfil || user?.perfil || "");
    setSessionEmpresa((session.empresa || user?.empresa || "").trim());

    consultarCiencia(cpf);
  }, [router]);

  async function registrarCiencia() {
    if (!sessionCpf || salvando || cienciaRegistrada) return;
    if (!confirmouLeitura) {
      alert("Para registrar a ciência, confirme que leu e compreendeu o termo.");
      return;
    }

    const dataISO = new Date().toISOString();

    try {
      setSalvando(true);
      setErro(null);

      const res = await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TERMO_CONFIDENCIALIDADE_CIENCIA",
          module: "termos",
          entityId: TERMO.id,
          entityTitle: TERMO.titulo,
          actorCpf: sessionCpf,
          actorNome: sessionNome,
          actorPerfil: sessionPerfil,
          actorEmpresa: sessionEmpresa,
          atISO: dataISO,
          obs: "Colaborador registrou ciência do Termo de Confidencialidade e Sigilo.",
          meta: {
            documento: TERMO.titulo,
            versao: TERMO.versao,
            revisao: TERMO.revisao,
            categoria: TERMO.categoria,
            responsavel: TERMO.responsavel,
            arquivoPdf: TERMO.arquivoPdf,
            declaracao: "Li, compreendi e estou ciente do Termo de Confidencialidade e Sigilo.",
          },
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) throw new Error("Falha ao registrar ciência.");

      setCienciaISO(dataISO);
      alert("✅ Ciência registrada com sucesso.");
    } catch (e: any) {
      setErro(e?.message || "Não foi possível registrar a ciência do termo.");
    } finally {
      setSalvando(false);
    }
  }

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container"><p>Carregando…</p></div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container termoPage">
        <div className="termoTop noPrint">
          <Link className="btn btn-outline termoBtnPill" href="/colaborador">← Voltar para Área do Colaborador</Link>
          <Link className="btn btn-outline termoBtnPill" href="/colaborador/governanca">Biblioteca de Governança</Link>
        </div>

        <div className="section-title" style={{ marginTop: 0 }}>
          <h2>Termo de Confidencialidade</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 920 }}>
          Documento obrigatório para ciência individual dos colaboradores, compromisso de sigilo, proteção de informações, LGPD e conformidade operacional. O registro de ciência é salvo no Logger Central para fins de auditoria.
        </p>

        <div className="card termoStatusCard">
          <div className="termoStatusLeft">
            <div className="termoMiniLabel">Colaborador</div>
            <div className="termoNome">{sessionNome || "—"}</div>
            <div className="termoDados">CPF: <strong>{mascararCpf(sessionCpf)}</strong> • Empresa: <strong>{sessionEmpresa || "—"}</strong></div>
          </div>

          <div className={`termoStatus ${cienciaRegistrada ? "ok" : "pend"}`}>
            {cienciaRegistrada ? "✅" : "⏳"} {statusLabel}
          </div>
        </div>

        <div className="card termoDocCard">
          <div className="termoDocHead">
            <div>
              <div className="termoDocTitle">🔐 {TERMO.titulo}</div>
              <div className="termoDocSub">{TERMO.categoria}</div>
            </div>

            <div className="termoBadges">
              <span className="termoBadge red">Obrigatório</span>
              <span className="termoBadge green">Vigente</span>
              <span className="termoBadge blue">{TERMO.versao}</span>
            </div>
          </div>

          <div className="termoInfoGrid">
            <div><span>Versão</span><strong>{TERMO.versao}</strong></div>
            <div><span>Revisão</span><strong>{TERMO.revisao}</strong></div>
            <div><span>Responsável</span><strong>{TERMO.responsavel}</strong></div>
            <div><span>Ciência registrada em</span><strong>{formatarData(cienciaISO)}</strong></div>
          </div>

          <div className="termoActions noPrint">
            <a className="btn btn-yellow termoBtnPill" href={TERMO.arquivoPdf} target="_blank" rel="noopener noreferrer">Abrir termo em PDF</a>
            <a className="btn btn-outline termoBtnPill" href={TERMO.arquivoPdf} download>Baixar termo</a>
          </div>
        </div>

        <div className="card termoPreviewCard">
          <div className="termoPreviewHead">
            <div>
              <div className="termoPreviewTitle">Visualização do termo</div>
              <div className="termoPreviewSub">Leia o documento antes de registrar a ciência.</div>
            </div>
          </div>

          <iframe className="termoFrame" src={TERMO.arquivoPdf} title="Termo de Confidencialidade" />
        </div>

        <div className="card termoCienciaCard">
          <div className="termoCienciaTitle">Declaração de ciência</div>
          <p className="termoCienciaText">
            Declaro que li, compreendi e estou ciente do conteúdo do Termo de Confidencialidade e Sigilo, comprometendo-me a observar as regras de sigilo, confidencialidade, proteção de dados, segurança da informação e uso adequado das informações às quais tiver acesso em razão das minhas atividades.
          </p>

          {erro ? <div className="termoErro">{erro}</div> : null}

          <label className="termoCheck noPrint">
            <input
              type="checkbox"
              checked={confirmouLeitura}
              disabled={cienciaRegistrada || salvando}
              onChange={(e) => setConfirmouLeitura(e.target.checked)}
            />
            <span>Confirmo que li e estou ciente do Termo de Confidencialidade.</span>
          </label>

          <div className="termoFooterActions noPrint">
            <button
              type="button"
              className="btn btn-yellow termoBtnPill"
              disabled={cienciaRegistrada || salvando || carregando}
              onClick={registrarCiencia}
            >
              {cienciaRegistrada ? "✅ Ciência já registrada" : salvando ? "Registrando…" : "Registrar ciência"}
            </button>

            <button type="button" className="btn btn-outline termoBtnPill" onClick={() => window.print()}>
              Imprimir / Salvar PDF
            </button>
          </div>

          <div className="termoAuditNote">
            Nota de auditoria: o registro de ciência é individual por CPF e fica armazenado no Logger Central com data/hora, documento, versão e dados do colaborador.
          </div>
        </div>

        <style jsx global>{`
          .termoPage { max-width: 1180px; }
          .termoTop { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
          .termoBtnPill { border-radius:999px!important; padding:10px 14px!important; }
          .termoStatusCard { margin-top:14px; padding:16px!important; border-radius:18px!important; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; border:1px solid rgba(10,42,106,.12)!important; background:linear-gradient(180deg,#fff,#f7f9ff)!important; }
          .termoMiniLabel { font-size:11px; font-weight:900; opacity:.6; text-transform:uppercase; }
          .termoNome { margin-top:3px; font-size:18px; font-weight:900; color:#0a2a6a; }
          .termoDados { margin-top:3px; font-size:12px; font-weight:700; opacity:.78; }
          .termoStatus { border-radius:999px; padding:10px 14px; font-size:12px; font-weight:900; border:1px solid rgba(10,42,106,.12); white-space:nowrap; }
          .termoStatus.ok { background:#eaf7ef; color:#0f6b36; border-color:rgba(20,180,90,.22); }
          .termoStatus.pend { background:#fff7e3; color:#7a5a00; border-color:rgba(247,198,0,.35); }
          .termoDocCard,.termoPreviewCard,.termoCienciaCard { margin-top:14px; padding:18px!important; border-radius:18px!important; border:1px solid rgba(10,42,106,.12)!important; background:#fff!important; box-shadow:0 12px 28px rgba(15,23,42,.05)!important; }
          .termoDocHead,.termoPreviewHead { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap; }
          .termoDocTitle,.termoPreviewTitle,.termoCienciaTitle { font-size:18px; font-weight:900; color:#0a2a6a; }
          .termoDocSub,.termoPreviewSub { margin-top:4px; font-size:12px; font-weight:700; opacity:.7; }
          .termoBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
          .termoBadge { display:inline-flex; border-radius:999px; padding:7px 10px; font-size:11px; font-weight:900; border:1px solid rgba(10,42,106,.12); }
          .termoBadge.red { background:#fff4f4; color:#8a1f1f; border-color:rgba(180,40,40,.18); }
          .termoBadge.green { background:#eaf7ef; color:#0f6b36; border-color:rgba(20,180,90,.22); }
          .termoBadge.blue { background:#eef4ff; color:#0b3b8a; border-color:rgba(11,59,138,.18); }
          .termoInfoGrid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:16px; }
          .termoInfoGrid div { border:1px solid rgba(10,42,106,.1); border-radius:14px; padding:12px; background:#f8faff; }
          .termoInfoGrid span { display:block; font-size:11px; font-weight:900; opacity:.62; }
          .termoInfoGrid strong { display:block; margin-top:4px; font-size:13px; color:#0a2a6a; }
          .termoActions,.termoFooterActions { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
          .termoFrame { width:100%; height:620px; border:1px solid rgba(10,42,106,.12); border-radius:14px; margin-top:14px; background:#f7f9ff; }
          .termoCienciaText { margin:10px 0 0; font-size:13px; line-height:1.6; font-weight:700; opacity:.78; }
          .termoCheck { display:flex; gap:10px; align-items:flex-start; margin-top:16px; font-size:13px; font-weight:800; }
          .termoCheck input { margin-top:2px; }
          .termoErro { margin-top:12px; border:1px solid rgba(180,40,40,.18); background:#fff4f4; color:#8a1f1f; border-radius:12px; padding:10px 12px; font-size:12px; font-weight:800; }
          .termoAuditNote { margin-top:14px; font-size:12px; font-weight:700; opacity:.65; }
          button:disabled { opacity:.65; cursor:not-allowed; }
          @media (max-width: 820px) { .termoInfoGrid{grid-template-columns:1fr;} .termoFrame{height:460px;} }
          @media print { .noPrint{display:none!important;} .termoFrame{height:900px;} .termoPage{max-width:100%;} }
        `}</style>
      </div>
    </main>
  );
}
