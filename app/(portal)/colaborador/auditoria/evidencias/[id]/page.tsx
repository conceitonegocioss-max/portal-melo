"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type EvidenciaItem = {
  treinamentoId: string;
  status: "concluido" | "pendente";
  dataISO?: string | null;
};

type Evidencia = {
  id: string;
  cpf: string;
  colaborador: string;
  empresa?: string | null;
  emitidoEmISO: string;
  emitidoPor?: string | null;
  concluidos: number;
  total: number;
  itens: EvidenciaItem[];
  categoria?: string;
  tipo?: string;
  nivel?: "BAIXO" | "MEDIO" | "ALTO";
  meta?: any;
};

type AuditItem = {
  id: string;
  atISO: string;
  type: string;
  actorCpf: string;
  actorNome: string;
  actorEmpresa: string;
  entityId: string;
  entityTitle: string;
  meta: Record<string, any>;
};

const TREINAMENTOS: Record<string, { nome: string; provaId?: string; provaNome?: string }> = {
  "atendimento-ao-cliente": { nome: "Atendimento ao Cliente", provaId: "atendimento-ao-cliente", provaNome: "Prova — Atendimento ao Cliente" },
  "codigo-de-etica-e-conduta": { nome: "Código de Ética e Conduta", provaId: "codigo-de-etica", provaNome: "Prova — Código de Ética e Conduta" },
  "resumo-contratual": { nome: "Resumo Contratual", provaId: "resumo-contratual", provaNome: "Prova — Resumo Contratual" },
  "credito-responsavel": { nome: "Crédito Responsável", provaId: "credito-responsavel", provaNome: "Prova — Crédito Responsável" },
  "resolucao-autorregulacao": { nome: "Resolução e Autorregulação", provaId: "autorregulacao-consignado", provaNome: "Prova — Autorregulação do Consignado" },
  "prevencao-a-fraude": { nome: "Prevenção à Fraude", provaId: "fraude", provaNome: "Prova — Prevenção à Fraude" },
  "publico-vulneravel": { nome: "Público Vulnerável", provaId: "publico-vulneravel", provaNome: "Prova — Atendimento Público Vulnerável" },
  lgpd: { nome: "LGPD", provaId: "lgpd", provaNome: "Prova — LGPD" },
  "pld-ft": { nome: "PLDFT", provaId: "pldft", provaNome: "Prova — PLDFT" },
  "seguranca-da-informacao": { nome: "Segurança da Informação", provaId: "seguranca-informacao", provaNome: "Prova — Segurança da Informação" },
  "produtos-modalidades-credito": { nome: "Produtos e Modalidades de Crédito", provaId: "produtos-consignado", provaNome: "Prova — Produtos Modalidades do Crédito Consignado" },
  "basico-consorcio": { nome: "Básico de Consórcio", provaId: "consorcio", provaNome: "Prova — Básico de Consórcio" },
  ourocapp: { nome: "Ourocap", provaId: "ourocap", provaNome: "Prova — Ourocap" },
  "abertura-de-contas": { nome: "Abertura de Contas", provaId: "abertura-conta", provaNome: "Prova — Abertura de Conta" },
  seguridade: { nome: "Seguridade", provaId: "seguridade", provaNome: "Prova — Seguridade" },
  "lista-de-mailing": { nome: "Lista de Mailing", provaId: "mailing", provaNome: "Prova — Tratamento e Uso da Lista de Mailing" },
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

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function normalizeIdForCompare(s: string) {
  const a = (s || "").trim();
  const b = safeDecode(a).trim();
  const c = b.replace(/\s+/g, " ");
  return { raw: a, decoded: b, cleaned: c };
}

function pct(concluidos: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((concluidos / total) * 100);
}

function provaTitulo(item: AuditItem) {
  return String(item.entityTitle || item.meta?.provaTitulo || "Prova");
}

function statusProva(item?: AuditItem | null) {
  if (!item) return "PENDENTE";
  const aprovado = String(item.meta?.aprovado || "").toUpperCase();
  if (aprovado === "SIM" || aprovado === "TRUE") return "APROVADO";
  if (aprovado === "NAO" || aprovado === "NÃO" || aprovado === "FALSE") return "REPROVADO";
  if (item.type === "PROVA_APROVADA") return "APROVADO";
  return "REGISTRADO";
}

function resultadoKey(item: AuditItem) {
  return [onlyDigits(item.actorCpf || String(item.meta?.cpf || "")), item.entityId || provaTitulo(item)].join("::");
}

function consolidarProvas(items: AuditItem[]) {
  const provas = items.filter((x) => x.type === "PROVA_APROVADA" || x.type === "PROVA_ENVIADA");
  const map = new Map<string, AuditItem>();

  for (const item of provas) {
    const key = resultadoKey(item);
    const atual = map.get(key);
    const itemStatus = statusProva(item);

    if (!atual) {
      map.set(key, item);
      continue;
    }

    const atualStatus = statusProva(atual);
    const itemTime = new Date(item.atISO || 0).getTime();
    const atualTime = new Date(atual.atISO || 0).getTime();

    if (itemStatus === "APROVADO" && atualStatus !== "APROVADO") {
      map.set(key, item);
    } else if (itemStatus === atualStatus && itemTime > atualTime) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

export default function EvidenciaDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ev, setEv] = useState<Evidencia | null>(null);
  const [provas, setProvas] = useState<AuditItem[]>([]);

  useEffect(() => {
    (async () => {
      const s: any = getSession();
      if (!s?.cpf) {
        router.replace("/colaborador/login");
        return;
      }
      if (!isAdmin(s)) {
        router.replace("/colaborador");
        return;
      }

      try {
        setLoading(true);
        setErro(null);

        const [evRes, auditRes] = await Promise.all([
          fetch("/api/evidencias", { cache: "no-store" }),
          fetch("/api/audit/events?all=1", { cache: "no-store" }),
        ]);

        const evJson = await evRes.json();
        if (!evJson?.ok) throw new Error(evJson?.error || "Não foi possível carregar o registro de evidências.");

        const items = (evJson.items || []) as Evidencia[];
        const pid = normalizeIdForCompare(idParam);

        const found =
          items.find((x) => String(x.id) === pid.raw) ||
          items.find((x) => safeDecode(String(x.id)) === pid.decoded) ||
          items.find((x) => normalizeIdForCompare(String(x.id)).cleaned === pid.cleaned);

        if (!found) {
          setErro("Registro não localizado. Volte ao Mapa de Evidências e tente abrir novamente.");
          setEv(null);
          return;
        }

        setEv(found);

        const auditJson = await auditRes.json().catch(() => null);
        const auditItems = Array.isArray(auditJson?.items) ? (auditJson.items as AuditItem[]) : [];
        const cpf = onlyDigits(found.cpf);
        const provasCpf = consolidarProvas(
          auditItems.filter((x) => onlyDigits(x.actorCpf || String(x.meta?.cpf || "")) === cpf && String(x.type || "").startsWith("PROVA_"))
        );
        setProvas(provasCpf);
      } catch (e: any) {
        setErro(e?.message || "Falha ao carregar o registro.");
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam, router]);

  const progressoPct = useMemo(() => {
    if (!ev) return 0;
    return pct(ev.concluidos, ev.total);
  }, [ev]);

  const linhas = useMemo(() => {
    if (!ev) return [];

    return (ev.itens || []).map((it) => {
      const info = TREINAMENTOS[it.treinamentoId] || { nome: it.treinamentoId };
      const prova = info.provaId
        ? provas.find((p) => p.entityId === info.provaId || provaTitulo(p) === info.provaNome)
        : undefined;

      return { item: it, info, prova, status: statusProva(prova) };
    });
  }, [ev, provas]);

  const provasAprovadas = linhas.filter((l) => l.status === "APROVADO").length;
  const provasPendentes = linhas.filter((l) => l.status === "PENDENTE").length;

  return (
    <main className="section gray">
      <div className="container evidenciaDetalhe">
        <div className="card detalheCard">
          <div className="detalheTop noPrint">
            <div>
              <div className="detalheTitle">📌 Evidência — Treinamentos e Provas</div>
              <div className="detalheSub">Documento interno • Auditoria/Compliance • Controles e rastreabilidade</div>
            </div>

            <div className="detalheActions">
              <Link className="btn btn-outline" href="/colaborador/auditoria/evidencias">← Voltar ao Mapa</Link>
              <Link className="btn btn-outline" href="/colaborador/auditoria">Central de Auditoria</Link>
              <button className="btn btn-yellow" type="button" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
            </div>
          </div>

          <hr className="sep" />

          {loading && <p style={{ opacity: 0.8 }}>Carregando registro…</p>}

          {!loading && erro && (
            <div className="erroBox">
              <div style={{ fontWeight: 900 }}>Não foi possível exibir esta evidência</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{erro}</div>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}><strong>ID informado na URL:</strong> {safeDecode(idParam)}</div>
            </div>
          )}

          {!loading && !erro && ev && (
            <div className="detalheContent">
              <div className="infoGrid">
                <div className="infoBox">
                  <div className="boxTitle">Identificação do registro</div>
                  <div><strong>ID do registro:</strong> {ev.id}</div>
                  <div><strong>Colaborador:</strong> {ev.colaborador}</div>
                  <div><strong>Empresa:</strong> {ev.empresa || "—"}</div>
                  <div><strong>CPF:</strong> {mascararCpf(ev.cpf)}</div>
                  <div><strong>Data de emissão:</strong> {fmt(ev.emitidoEmISO)}</div>
                  <div><strong>Emitido por:</strong> {ev.emitidoPor || "ADMIN"}</div>
                </div>

                <div className="infoBox resumoBox">
                  <div className="boxTitle">Resumo de conformidade</div>
                  <div className="resumoLinha"><span>Treinamentos concluídos</span><strong>{ev.concluidos}/{ev.total} ({progressoPct}%)</strong></div>
                  <div className="resumoLinha"><span>Provas aprovadas</span><strong>{provasAprovadas}</strong></div>
                  <div className="resumoLinha"><span>Provas pendentes</span><strong>{provasPendentes}</strong></div>
                  <div className="miniBar"><div style={{ width: `${Math.min(100, Math.max(0, progressoPct))}%` }} /></div>
                </div>
              </div>

              <div className="itensBox">
                <div className="boxTitle">Itens de evidência — Treinamentos e provas vinculadas</div>
                <div className="boxSub">A tabela abaixo demonstra o ciclo completo: treinamento, conclusão, prova vinculada, nota e status da avaliação.</div>

                {linhas.length ? (
                  <div className="tableWrap">
                    <table className="detTable">
                      <thead>
                        <tr>
                          <th>Treinamento</th>
                          <th>Status treinamento</th>
                          <th>Data conclusão</th>
                          <th>Prova vinculada</th>
                          <th>Nota</th>
                          <th>Status prova</th>
                          <th>Data prova</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhas.map((l, idx) => (
                          <tr key={`${l.item.treinamentoId}-${idx}`}>
                            <td><strong>{l.info.nome}</strong></td>
                            <td><span className={`pill ${l.item.status === "concluido" ? "ok" : "pend"}`}>{l.item.status === "concluido" ? "✅ Concluído" : "⏳ Pendente"}</span></td>
                            <td>{fmt(l.item.dataISO || null)}</td>
                            <td>{l.info.provaNome || "—"}</td>
                            <td className="nota">{l.prova?.meta?.nota !== undefined ? `${l.prova.meta.nota}%` : "—"}</td>
                            <td><span className={`pill ${l.status.toLowerCase()}`}>{l.status}</span></td>
                            <td>{fmt(l.prova?.atISO || null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, opacity: 0.85 }}>Nenhum item vinculado a esta evidência no momento.</div>
                )}
              </div>

              <div className="notaLgpd">
                Nota de proteção de dados: utilize este registro apenas para finalidade interna de auditoria e controle. Evite inserir dados pessoais sensíveis além do necessário.
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .evidenciaDetalhe { max-width: 1280px; }
        .detalheCard { padding:16px!important; border-radius:18px!important; }
        .detalheTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
        .detalheTitle { font-weight:900; font-size:17px; color:#0a2a6a; }
        .detalheSub { font-size:12px; opacity:.8; margin-top:4px; font-weight:700; }
        .detalheActions { display:flex; gap:10px; flex-wrap:wrap; }
        .sep { margin:14px 0; border:0; border-top:1px solid #e6e8ee; }
        .erroBox { padding:12px; border-radius:14px; border:1px solid rgba(210,30,30,.25); background:#fff; }
        .detalheContent { display:grid; gap:14px; }
        .infoGrid { display:grid; grid-template-columns:1.3fr .9fr; gap:12px; }
        .infoBox,.itensBox { border:1px solid rgba(10,42,106,.1); background:#fff; border-radius:16px; padding:14px; font-size:13px; display:grid; gap:6px; }
        .boxTitle { font-weight:900; margin-bottom:4px; color:#0a2a6a; }
        .boxSub { font-size:12px; opacity:.75; font-weight:700; margin-bottom:8px; }
        .resumoLinha { display:flex; justify-content:space-between; gap:12px; border-bottom:1px solid rgba(10,42,106,.08); padding:6px 0; font-weight:800; }
        .resumoLinha strong { color:#0a2a6a; }
        .miniBar { margin-top:8px; height:8px; border-radius:999px; background:rgba(10,42,106,.08); overflow:hidden; }
        .miniBar div { height:8px; border-radius:999px; background:#0b3b8a; }
        .tableWrap { overflow-x:auto; }
        .detTable { width:100%; min-width:980px; border-collapse:collapse; font-size:12px; }
        .detTable th { text-align:left; padding:10px 8px; border-bottom:1px solid rgba(0,0,0,.1); background:rgba(247,249,255,.7); color:#0a2a6a; font-weight:900; }
        .detTable td { padding:10px 8px; border-bottom:1px solid rgba(0,0,0,.06); vertical-align:top; font-weight:700; }
        .nota { font-weight:900; color:#0a2a6a; }
        .pill { display:inline-flex; border-radius:999px; padding:5px 8px; font-size:11px; font-weight:900; border:1px solid rgba(10,42,106,.12); white-space:nowrap; background:#f7f9ff; color:#0a2a6a; }
        .pill.ok,.pill.aprovado { background:#eaf7ef; border-color:rgba(27,122,58,.18); color:#0f5132; }
        .pill.pend,.pill.pendente { background:#fff4f4; border-color:rgba(180,40,40,.18); color:#8a1f1f; }
        .pill.reprovado { background:#fff1f1; border-color:rgba(180,40,40,.18); color:#8a1f1f; }
        .pill.registrado { background:#f4f4f5; border-color:rgba(82,82,91,.18); color:#52525b; }
        .notaLgpd { font-size:12px; opacity:.75; font-weight:700; }
        @media (max-width:900px){ .infoGrid{grid-template-columns:1fr;} }
        @media print { .noPrint{display:none!important;} .section.gray{background:#fff!important;} .detalheCard{box-shadow:none!important; border:none!important;} .detTable{min-width:0!important;} .detTable th,.detTable td{font-size:9px!important; padding:5px!important;} }
      `}</style>
    </main>
  );
}
