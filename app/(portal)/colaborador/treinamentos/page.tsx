"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";

type Treinamento = {
  id: string;
  titulo: string;
  descricao: string;
  pasta: string;
  categoria: string;
  publico: string;
  capa?: string;
  provaHref?: string;
};

type ProgressoItem = {
  status: "Pendente" | "Concluído";
  dataISO: string;
};

type ProgressoPorTreino = Record<string, ProgressoItem>;

type FluxoTreinamentoItem = {
  acessado?: boolean;
  acessoISO?: string;
  tempoMinimoCumprido?: boolean;
  tempoMinimoISO?: string;
  declaracaoLeitura?: boolean;
};

type FluxoTreinamento = Record<string, FluxoTreinamentoItem>;

const CAPA_PADRAO = "/treinamentos/capas/institucional.jpg";
const TEMPO_MINIMO_SEGUNDOS = 120;

const METADATA_PADRAO = {
  responsavel: "Área de Qualidade e Compliance",
  versao: "2.0",
  proximaRevisao: "02/2027",
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function keyByCpf(cpf: string) {
  return `portal_treinamentos_progress_v1_${cpf}`;
}

function fluxoKeyByCpf(cpf: string) {
  return `portal_treinamentos_fluxo_v1_${cpf}`;
}

function lerProgressoLocal(cpf: string): ProgressoPorTreino {
  try {
    const raw = localStorage.getItem(keyByCpf(cpf));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressoPorTreino;

    if (parsed.ourocapp && !parsed.ourocap) {
      parsed.ourocap = parsed.ourocapp;
    }

    return parsed;
  } catch {
    return {};
  }
}

function salvarProgressoLocal(cpf: string, progresso: ProgressoPorTreino) {
  if (!cpf) return;
  localStorage.setItem(keyByCpf(cpf), JSON.stringify(progresso));
}

function lerFluxoLocal(cpf: string): FluxoTreinamento {
  try {
    const raw = localStorage.getItem(fluxoKeyByCpf(cpf));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FluxoTreinamento;

    if (parsed.ourocapp && !parsed.ourocap) {
      parsed.ourocap = parsed.ourocapp;
    }

    return parsed;
  } catch {
    return {};
  }
}

function salvarFluxoLocal(cpf: string, fluxo: FluxoTreinamento) {
  if (!cpf) return;
  localStorage.setItem(fluxoKeyByCpf(cpf), JSON.stringify(fluxo));
}

function mesclarProgresso(local: ProgressoPorTreino, remoto: ProgressoPorTreino): ProgressoPorTreino {
  const mesclado = {
    ...(local || {}),
    ...(remoto || {}),
  };

  if (mesclado.ourocapp && !mesclado.ourocap) {
    mesclado.ourocap = mesclado.ourocapp;
  }

  return mesclado;
}

const TREINAMENTOS: Treinamento[] = [
  { id: "abertura-de-contas", titulo: "Abertura de Contas", descricao: "Procedimentos e orientações para abertura de contas.", pasta: "abertura-de-contas", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "atendimento-ao-cliente", titulo: "Atendimento ao Cliente", descricao: "Boas práticas de atendimento e postura profissional.", pasta: "atendimento-ao-cliente", categoria: "Atendimento", publico: "Todos", capa: CAPA_PADRAO },
  { id: "basico-consorcio", titulo: "Básico de Consórcio", descricao: "Conceitos essenciais e funcionamento do consórcio.", pasta: "basico-consorcio", categoria: "Consórcio", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "codigo-de-etica-e-conduta", titulo: "Código de Ética e Conduta", descricao: "Conduta profissional, integridade e boas práticas.", pasta: "codigo-de-etica-e-conduta", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "credito-responsavel", titulo: "Crédito Responsável", descricao: "Práticas para concessão responsável e orientações ao cliente.", pasta: "credito-responsavel", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "lgpd", titulo: "LGPD", descricao: "Lei Geral de Proteção de Dados e boas práticas.", pasta: "lgpd", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "lista-de-mailing", titulo: "Lista de Mailing", descricao: "Boas práticas no uso de listas e abordagem a clientes.", pasta: "lista-de-mailing", categoria: "Atendimento", publico: "Todos", capa: CAPA_PADRAO },
  { id: "ourocap", titulo: "Ourocap", descricao: "Produto Ourocap: conceitos e orientações comerciais.", pasta: "ourocap", categoria: "Produtos", publico: "Agente de Crédito", capa: CAPA_PADRAO, provaHref: "/colaborador/provas/ourocap" },
  { id: "pld-ft", titulo: "PLD-FT", descricao: "Prevenção à lavagem de dinheiro e financiamento ao terrorismo.", pasta: "pld-ft", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "prevencao-a-fraude", titulo: "Prevenção à Fraude", descricao: "Identificação de riscos e boas práticas antifraude.", pasta: "prevencao-a-fraude", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "produtos-modalidades-credito", titulo: "Produtos e Modalidades de Crédito", descricao: "Visão geral de produtos e modalidades de crédito.", pasta: "produtos-modalidades-credito", categoria: "Crédito", publico: "Agente de Crédito", capa: CAPA_PADRAO },
  { id: "publico-vulneravel", titulo: "Público Vulnerável", descricao: "Boas práticas de atendimento e cuidados com público vulnerável.", pasta: "publico-vulneravel", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "resolucao-autorregulacao", titulo: "Resolução e Autorregulação", descricao: "Regras, diretrizes e condutas esperadas.", pasta: "resolucao-autorregulacao", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "resumo-contratual", titulo: "Resumo Contratual", descricao: "Pontos essenciais de contratos e orientações.", pasta: "resumo-contratual", categoria: "Institucional", publico: "Todos", capa: CAPA_PADRAO },
  { id: "seguranca-da-informacao", titulo: "Segurança da Informação", descricao: "Boas práticas e condutas de segurança.", pasta: "seguranca-da-informacao", categoria: "Compliance", publico: "Todos", capa: CAPA_PADRAO },
  { id: "seguridade", titulo: "Seguridade", descricao: "Produtos e orientações gerais de seguridade.", pasta: "seguridade", categoria: "Produtos", publico: "Agente de Crédito", capa: CAPA_PADRAO },
];

export default function TreinamentosPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [sessionCpf, setSessionCpf] = useState("");
  const [sessionNome, setSessionNome] = useState("");
  const [sessionPerfil, setSessionPerfil] = useState("");
  const [sessionEmpresa, setSessionEmpresa] = useState("");
  const [syncStatus, setSyncStatus] = useState("Sincronizando progresso…");

  const [progresso, setProgresso] = useState<ProgressoPorTreino>({});
  const [fluxo, setFluxo] = useState<FluxoTreinamento>({});
  const [agora, setAgora] = useState(() => Date.now());

  const totalTreinos = TREINAMENTOS.length;

  async function carregarProgressoDoBanco(cpf: string) {
    const local = lerProgressoLocal(cpf);
    const fluxoLocal = lerFluxoLocal(cpf);
    setProgresso(local);
    setFluxo(fluxoLocal);

    try {
      const res = await fetch(
        `/api/audit/events?actorCpf=${encodeURIComponent(cpf)}&module=treinamentos&action=TREINAMENTO_CONCLUIDO`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (!data?.ok) throw new Error("Resposta inválida");

      const remoto = (data.progress || {}) as ProgressoPorTreino;
      const mesclado = mesclarProgresso(local, remoto);

      setProgresso(mesclado);
      salvarProgressoLocal(cpf, mesclado);
      setSyncStatus("Progresso sincronizado com o banco por CPF.");
    } catch {
      setSyncStatus("Não foi possível sincronizar agora. Exibindo progresso salvo neste navegador.");
    }
  }

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }

    const cpf = onlyDigits(session.cpf || "");
    setSessionCpf(cpf);
    setSessionNome(session.nome || "");
    setSessionPerfil(session.perfil || "");
    setSessionEmpresa(session.empresa || "");

    carregarProgressoDoBanco(cpf);
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sessionCpf) return;

    for (const t of TREINAMENTOS) {
      const item = fluxo[t.id];
      if (!item?.acessado || !item.acessoISO || item.tempoMinimoCumprido) continue;

      const decorrido = Math.floor((agora - new Date(item.acessoISO).getTime()) / 1000);
      if (decorrido < TEMPO_MINIMO_SEGUNDOS) continue;

      const dataISO = new Date().toISOString();
      const novoFluxo: FluxoTreinamento = {
        ...fluxo,
        [t.id]: {
          ...item,
          tempoMinimoCumprido: true,
          tempoMinimoISO: dataISO,
        },
      };

      setFluxo(novoFluxo);
      salvarFluxoLocal(sessionCpf, novoFluxo);

      registrarEventoCentral({
        type: "TREINAMENTO_TEMPO_MINIMO_CUMPRIDO",
        module: "treinamentos",
        entityId: t.id,
        entityTitle: t.titulo,
        actorCpf: sessionCpf,
        actorNome: sessionNome,
        actorPerfil: sessionPerfil,
        actorEmpresa: sessionEmpresa,
        atISO: dataISO,
        obs: `Tempo mínimo de ${TEMPO_MINIMO_SEGUNDOS} segundos cumprido antes da conclusão do treinamento.`,
        meta: {
          pasta: t.pasta,
          categoria: t.categoria,
          publico: t.publico,
          tempoMinimoSegundos: TEMPO_MINIMO_SEGUNDOS,
          versao: METADATA_PADRAO.versao,
          proximaRevisao: METADATA_PADRAO.proximaRevisao,
          responsavel: METADATA_PADRAO.responsavel,
        },
      });

      break;
    }
  }, [agora, fluxo, sessionCpf, sessionNome, sessionPerfil, sessionEmpresa]);

  const concluidos = useMemo(() => {
    return Object.values(progresso || {}).filter((x) => x?.status === "Concluído").length;
  }, [progresso]);

  const pct = useMemo(() => {
    return totalTreinos > 0 ? Math.round((concluidos / totalTreinos) * 100) : 0;
  }, [concluidos, totalTreinos]);

  function salvarProgresso(novo: ProgressoPorTreino) {
    setProgresso(novo);
    if (sessionCpf) salvarProgressoLocal(sessionCpf, novo);
  }

  function salvarFluxo(novo: FluxoTreinamento) {
    setFluxo(novo);
    if (sessionCpf) salvarFluxoLocal(sessionCpf, novo);
  }

  async function atualizarProgresso() {
    if (!sessionCpf) return;
    setSyncStatus("Sincronizando progresso…");
    await carregarProgressoDoBanco(sessionCpf);
  }

  function statusDoTreino(id: string): "Pendente" | "Concluído" {
    return progresso?.[id]?.status ?? "Pendente";
  }

  function segundosRestantes(t: Treinamento) {
    const item = fluxo[t.id];
    if (!item?.acessoISO) return TEMPO_MINIMO_SEGUNDOS;
    if (item.tempoMinimoCumprido) return 0;
    const decorrido = Math.max(0, Math.floor((agora - new Date(item.acessoISO).getTime()) / 1000));
    return Math.max(0, TEMPO_MINIMO_SEGUNDOS - decorrido);
  }

  function tempoLabel(segundos: number) {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    if (min <= 0) return `${sec}s`;
    return `${min}min ${String(sec).padStart(2, "0")}s`;
  }

  function podeConcluir(t: Treinamento) {
    const item = fluxo[t.id];
    return Boolean(item?.acessado && item?.tempoMinimoCumprido && item?.declaracaoLeitura);
  }

  async function registrarEventoCentral(payload: any) {
    try {
      await fetch("/api/audit/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // não bloqueia o uso
    }
  }

  async function abrirTreinamento(t: Treinamento, hrefTreino: string) {
    const novaJanela = window.open("about:blank", "_blank", "noopener,noreferrer");
    const dataISO = new Date().toISOString();
    const itemAtual = fluxo[t.id] || {};
    const novoFluxo: FluxoTreinamento = {
      ...fluxo,
      [t.id]: {
        ...itemAtual,
        acessado: true,
        acessoISO: itemAtual.acessoISO || dataISO,
      },
    };

    salvarFluxo(novoFluxo);

    await registrarEventoCentral({
      type: "TREINAMENTO_ACESSADO",
      module: "treinamentos",
      entityId: t.id,
      entityTitle: t.titulo,
      actorCpf: sessionCpf,
      actorNome: sessionNome,
      actorPerfil: sessionPerfil,
      actorEmpresa: sessionEmpresa,
      atISO: dataISO,
      obs: "Colaborador abriu o material de treinamento antes da conclusão.",
      meta: {
        pasta: t.pasta,
        categoria: t.categoria,
        publico: t.publico,
        arquivoPdf: hrefTreino,
        tempoMinimoSegundos: TEMPO_MINIMO_SEGUNDOS,
        versao: METADATA_PADRAO.versao,
        proximaRevisao: METADATA_PADRAO.proximaRevisao,
        responsavel: METADATA_PADRAO.responsavel,
      },
    });

    if (novaJanela) {
      novaJanela.location.href = hrefTreino;
    } else {
      window.open(hrefTreino, "_blank", "noopener,noreferrer");
    }
  }

  function alterarDeclaracao(t: Treinamento, checked: boolean) {
    const novoFluxo: FluxoTreinamento = {
      ...fluxo,
      [t.id]: {
        ...(fluxo[t.id] || {}),
        declaracaoLeitura: checked,
      },
    };
    salvarFluxo(novoFluxo);
  }

  async function marcarConcluido(t: Treinamento) {
    if (statusDoTreino(t.id) === "Concluído") return;

    const item = fluxo[t.id];
    if (!item?.acessado) {
      alert("Abra o material de treinamento antes de marcar como concluído.");
      return;
    }

    if (!item?.tempoMinimoCumprido) {
      alert(`Aguarde o tempo mínimo de leitura. Faltam ${tempoLabel(segundosRestantes(t))}.`);
      return;
    }

    if (!item?.declaracaoLeitura) {
      alert("Marque a declaração de leitura antes de concluir o treinamento.");
      return;
    }

    const dataISO = new Date().toISOString();

    const novo: ProgressoPorTreino = {
      ...(progresso || {}),
      [t.id]: { status: "Concluído", dataISO },
    };

    salvarProgresso(novo);

    await registrarEventoCentral({
      type: "TREINAMENTO_CONCLUIDO",
      module: "treinamentos",
      entityId: t.id,
      entityTitle: t.titulo,
      actorCpf: sessionCpf,
      actorNome: sessionNome,
      actorPerfil: sessionPerfil,
      actorEmpresa: sessionEmpresa,
      atISO: dataISO,
      obs: "Concluiu treinamento após abrir material, cumprir tempo mínimo e declarar leitura.",
      meta: {
        pasta: t.pasta,
        categoria: t.categoria,
        publico: t.publico,
        versao: METADATA_PADRAO.versao,
        proximaRevisao: METADATA_PADRAO.proximaRevisao,
        responsavel: METADATA_PADRAO.responsavel,
        tempoMinimoSegundos: TEMPO_MINIMO_SEGUNDOS,
        declaracao: "Declaro que acessei e realizei a leitura do material de treinamento, estando ciente das orientações aplicáveis às minhas atividades.",
        acessoISO: item.acessoISO || "",
        tempoMinimoISO: item.tempoMinimoISO || "",
      },
    });

    setSyncStatus("Conclusão registrada no banco por CPF.");
    alert(`✅ "${t.titulo}" marcado como concluído.`);
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
        <div style={{ marginBottom: 12 }}>
          <Link href="/colaborador" className="btn btn-outline small">
            ← Voltar para Área do Colaborador
          </Link>
        </div>

        <div className="section-title">
          <h2>Treinamentos Obrigatórios</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 900 }}>
          Abra o material, cumpra o tempo mínimo de leitura e confirme a declaração antes de concluir. A prova vinculada só é liberada após a conclusão do treinamento.
        </p>

        <div className="trProgress">
          <div className="trProgressTop">
            <div>
              <strong>Progresso:</strong> {concluidos} / {totalTreinos} ({pct}%)
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="trHint">{syncStatus}</div>

              <button type="button" className="miniBtn" onClick={atualizarProgresso}>
                Atualizar progresso
              </button>
            </div>
          </div>

          <div className="trBar" aria-label="Barra de progresso">
            <div className="trFill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="treinos-grid">
            {TREINAMENTOS.map((t) => {
              const status = statusDoTreino(t.id);
              const isConcluido = status === "Concluído";
              const hrefTreino = `/treinamentos/${t.pasta}/material.pdf`;
              const hrefProva = t.provaHref || `/colaborador/provas?treinamento=${encodeURIComponent(t.id)}`;
              const fluxoItem = fluxo[t.id] || {};
              const faltam = segundosRestantes(t);
              const liberadoParaConcluir = podeConcluir(t);

              return (
                <div className="treino-card" key={t.id}>
                  <div className="treino-cover">
                    <img src={t.capa || CAPA_PADRAO} alt="" />
                  </div>

                  <div className="treino-body">
                    <div className="treino-tags">
                      <span className="treino-tag">{t.categoria}</span>
                      <span className="treino-tag">{t.publico}</span>
                      <span className="treino-tag">{status}</span>
                    </div>

                    <h3 className="treino-title">{t.titulo}</h3>

                    <div className="treino-meta">
                      <div><strong>Responsável:</strong> {METADATA_PADRAO.responsavel}</div>
                      <div><strong>Versão:</strong> {METADATA_PADRAO.versao}</div>
                      <div><strong>Próxima revisão:</strong> {METADATA_PADRAO.proximaRevisao}</div>
                    </div>

                    <p className="treino-desc">{t.descricao}</p>

                    <div className="fluxoBox">
                      <div className={fluxoItem.acessado ? "fluxoStep ok" : "fluxoStep"}>1. Abrir material</div>
                      <div className={fluxoItem.tempoMinimoCumprido ? "fluxoStep ok" : "fluxoStep"}>
                        2. Tempo mínimo {fluxoItem.tempoMinimoCumprido ? "cumprido" : `faltam ${tempoLabel(faltam)}`}
                      </div>
                      <label className="declaracaoBox">
                        <input
                          type="checkbox"
                          checked={Boolean(fluxoItem.declaracaoLeitura)}
                          disabled={isConcluido || !fluxoItem.tempoMinimoCumprido}
                          onChange={(e) => alterarDeclaracao(t, e.target.checked)}
                        />
                        <span>Declaro que acessei e realizei a leitura do material de treinamento.</span>
                      </label>
                    </div>

                    <div className="treino-actions">
                      <button className="btn btn-yellow" style={{ width: "100%", textAlign: "center" }} type="button" onClick={() => abrirTreinamento(t, hrefTreino)}>
                        Abrir treinamento
                      </button>

                      <Link
                        className="btn btn-ghost"
                        style={{
                          width: "100%",
                          textAlign: "center",
                          border: "1px dashed rgba(10,42,106,.25)",
                          background: isConcluido ? "#f3f6fc" : "#f7f7f7",
                          color: isConcluido ? "#5b6f95" : "#9a9a9a",
                          pointerEvents: isConcluido ? "auto" : "none",
                          opacity: isConcluido ? 1 : 0.65,
                        }}
                        href={hrefProva}
                      >
                        {isConcluido ? "Fazer prova" : "Prova bloqueada"}
                      </Link>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={isConcluido || !liberadoParaConcluir}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          border: "1px dashed rgba(10,42,106,.25)",
                          background: isConcluido ? "#eaf7ef" : liberadoParaConcluir ? "#f6f9ff" : "#f7f7f7",
                          color: isConcluido ? "#1b7a3a" : liberadoParaConcluir ? "#0a2a6a" : "#8a8a8a",
                          opacity: isConcluido || liberadoParaConcluir ? 1 : 0.7,
                          cursor: isConcluido || !liberadoParaConcluir ? "not-allowed" : "pointer",
                        }}
                        onClick={() => marcarConcluido(t)}
                      >
                        {isConcluido ? "✅ Concluído" : liberadoParaConcluir ? "Marcar como concluído" : "Conclusão bloqueada"}
                      </button>

                      <div className="treino-status">
                        Status: <strong>{status}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx global>{`
          .trProgress { background: #fff; border: 1px solid rgba(10, 42, 106, 0.08); border-radius: 14px; padding: 12px; margin-top: 10px; }
          .trProgressTop { display: flex; gap: 10px; justify-content: space-between; align-items: baseline; flex-wrap: wrap; font-size: 13px; opacity: 0.9; margin-bottom: 10px; }
          .trHint { font-size: 12px; opacity: 0.7; }
          .trBar { width: 100%; height: 10px; border-radius: 999px; overflow: hidden; background: #e9edf5; }
          .trFill { height: 10px; background: #0b3b8a; border-radius: 999px; }
          .miniBtn { border: 1px solid rgba(10, 42, 106, 0.14); background: rgba(255, 255, 255, 0.9); padding: 7px 10px; border-radius: 999px; font-size: 12px; font-weight: 900; color: #0a2a6a; cursor: pointer; white-space: nowrap; }
          .miniBtn:hover { background: rgba(10, 42, 106, 0.06); border-color: rgba(10, 42, 106, 0.2); }
          .treinos-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
          @media (max-width: 1100px) { .treinos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (max-width: 760px) { .treinos-grid { grid-template-columns: 1fr; } }
          .treino-meta { font-size: 12px; opacity: 0.9; margin: 8px 0 10px; padding: 8px 10px; border-radius: 10px; background: #f4f6fb; border: 1px solid rgba(0, 0, 0, 0.06); }
          .treino-meta div { margin-bottom: 2px; }
          .fluxoBox { margin: 10px 0 12px; border: 1px solid rgba(10,42,106,.1); background: #fff; border-radius: 14px; padding: 10px; display: grid; gap: 8px; }
          .fluxoStep { font-size: 12px; font-weight: 900; color: #8a6800; background: #fff8d6; border: 1px solid rgba(240, 220, 128, .8); border-radius: 999px; padding: 7px 9px; }
          .fluxoStep.ok { color: #0f5132; background: #eaf7ef; border-color: rgba(27,122,58,.18); }
          .declaracaoBox { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; font-weight: 800; color: #17326e; line-height: 1.35; padding: 8px 9px; border-radius: 12px; background: #f7f9ff; border: 1px dashed rgba(10,42,106,.18); }
          .declaracaoBox input { margin-top: 2px; }
          .declaracaoBox:has(input:disabled) { opacity: .65; }
        `}</style>
      </div>
    </main>
  );
}
