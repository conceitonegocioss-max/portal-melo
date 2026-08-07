"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/src/lib/auth";

type ProgressoItem = {
  status?: string;
  dataISO?: string;
};

type ProgressoPorTreino = Record<string, ProgressoItem>;

type TreinoVinculado = {
  treinamentoId: string;
  treinamentoTitulo: string;
};

const VINCULOS_PROVA_TREINAMENTO: Record<string, TreinoVinculado> = {
  "atendimento-ao-cliente": {
    treinamentoId: "atendimento-ao-cliente",
    treinamentoTitulo: "Atendimento ao Cliente",
  },
  "codigo-de-etica": {
    treinamentoId: "codigo-de-etica-e-conduta",
    treinamentoTitulo: "Código de Ética e Conduta",
  },
  "credito-responsavel": {
    treinamentoId: "credito-responsavel",
    treinamentoTitulo: "Crédito Responsável",
  },
  "autorregulacao-consignado": {
    treinamentoId: "resolucao-autorregulacao",
    treinamentoTitulo: "Resolução e Autorregulação",
  },
  fraude: {
    treinamentoId: "prevencao-a-fraude",
    treinamentoTitulo: "Prevenção à Fraude",
  },
  lgpd: {
    treinamentoId: "lgpd",
    treinamentoTitulo: "LGPD",
  },
  pldft: {
    treinamentoId: "pld-ft",
    treinamentoTitulo: "PLD-FT",
  },
  "seguranca-informacao": {
    treinamentoId: "seguranca-da-informacao",
    treinamentoTitulo: "Segurança da Informação",
  },
  "publico-vulneravel": {
    treinamentoId: "publico-vulneravel",
    treinamentoTitulo: "Público Vulnerável",
  },
  "resumo-contratual": {
    treinamentoId: "resumo-contratual",
    treinamentoTitulo: "Resumo Contratual",
  },
  "produtos-consignado": {
    treinamentoId: "produtos-modalidades-credito",
    treinamentoTitulo: "Produtos e Modalidades de Crédito",
  },
  consorcio: {
    treinamentoId: "basico-consorcio",
    treinamentoTitulo: "Básico de Consórcio",
  },
  ourocap: {
    treinamentoId: "ourocap",
    treinamentoTitulo: "Ourocap",
  },
  "abertura-conta": {
    treinamentoId: "abertura-de-contas",
    treinamentoTitulo: "Abertura de Contas",
  },
  seguridade: {
    treinamentoId: "seguridade",
    treinamentoTitulo: "Seguridade",
  },
  portabilidade: {
    treinamentoId: "produtos-modalidades-credito",
    treinamentoTitulo: "Produtos e Modalidades de Crédito",
  },
  mailing: {
    treinamentoId: "lista-de-mailing",
    treinamentoTitulo: "Lista de Mailing",
  },
};

function onlyDigits(v: string) {
  return String(v || "").replace(/\D/g, "");
}

function keyByCpf(cpf: string) {
  return `portal_treinamentos_progress_v1_${cpf}`;
}

function lerProgressoLocal(cpf: string): ProgressoPorTreino {
  try {
    const raw = localStorage.getItem(keyByCpf(cpf));
    const parsed = raw ? (JSON.parse(raw) as ProgressoPorTreino) : {};

    if (parsed.ourocapp && !parsed.ourocap) {
      parsed.ourocap = parsed.ourocapp;
    }

    return parsed;
  } catch {
    return {};
  }
}

function treinoConcluido(progress: ProgressoPorTreino, treinamentoId: string) {
  const item = progress?.[treinamentoId];
  return String(item?.status || "").toLowerCase() === "concluído" || String(item?.status || "").toLowerCase() === "concluido";
}

function mesclarProgresso(local: ProgressoPorTreino, remoto: ProgressoPorTreino): ProgressoPorTreino {
  const merged = { ...(local || {}), ...(remoto || {}) };
  if (merged.ourocapp && !merged.ourocap) merged.ourocap = merged.ourocapp;
  return merged;
}

function salvarProgressoLocal(cpf: string, progresso: ProgressoPorTreino) {
  if (!cpf) return;
  try {
    localStorage.setItem(keyByCpf(cpf), JSON.stringify(progresso));
  } catch {}
}

export default function ProvaBloqueioLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const provaId = String(params.id || "");
  const vinculo = VINCULOS_PROVA_TREINAMENTO[provaId];

  const [carregando, setCarregando] = useState(true);
  const [liberada, setLiberada] = useState(false);
  const [nome, setNome] = useState("");

  useEffect(() => {
    async function verificarLiberacao() {
      try {
        const session: any = getSession();
        setNome(session?.nome || "");

        if (!vinculo) {
          setLiberada(true);
          return;
        }

        const cpf = onlyDigits(session?.cpf || "");
        if (!cpf) {
          setLiberada(false);
          return;
        }

        const local = lerProgressoLocal(cpf);
        if (treinoConcluido(local, vinculo.treinamentoId)) {
          setLiberada(true);
          return;
        }

        try {
          const res = await fetch(
            `/api/audit/events?actorCpf=${encodeURIComponent(cpf)}&module=treinamentos&action=TREINAMENTO_CONCLUIDO`,
            { cache: "no-store" }
          );
          const data = await res.json();
          const remoto = (data?.progress || {}) as ProgressoPorTreino;
          const mesclado = mesclarProgresso(local, remoto);
          salvarProgressoLocal(cpf, mesclado);
          setLiberada(treinoConcluido(mesclado, vinculo.treinamentoId));
        } catch {
          setLiberada(false);
        }
      } finally {
        setCarregando(false);
      }
    }

    void verificarLiberacao();
  }, [provaId, vinculo]);

  const tituloTreino = useMemo(() => vinculo?.treinamentoTitulo || "treinamento vinculado", [vinculo]);

  if (carregando) {
    return (
      <main className="provaGatePage">
        <section className="provaGateBox">
          <h1>Validando liberação da prova…</h1>
          <p>Estamos verificando se o treinamento vinculado foi concluído.</p>
        </section>
        <GateStyles />
      </main>
    );
  }

  if (!liberada) {
    return (
      <main className="provaGatePage">
        <section className="provaGateBox bloqueada">
          <div className="gateBadge">PROVA BLOQUEADA</div>
          <h1>Conclua o treinamento antes da prova</h1>
          <p>
            {nome ? <strong>{nome}</strong> : "O colaborador"} precisa concluir o treinamento <strong>{tituloTreino}</strong> para liberar esta avaliação.
          </p>
          <div className="gateNote">
            Regra de conformidade: treinamento concluído → prova liberada → prova realizada.
          </div>
          <div className="gateActions">
            <Link className="gateBtn primary" href="/colaborador/treinamentos">
              Acessar treinamentos
            </Link>
            <Link className="gateBtn" href="/colaborador/provas">
              Voltar para provas
            </Link>
          </div>
        </section>
        <GateStyles />
      </main>
    );
  }

  return <>{children}</>;
}

function GateStyles() {
  return (
    <style jsx global>{`
      .provaGatePage {
        min-height: 100%;
        background: #f3f5f9;
        color: #0b2a6f;
        font-family: Arial, sans-serif;
        padding: 32px 22px 48px;
      }
      .provaGateBox {
        max-width: 880px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid #dbe3f0;
        border-radius: 22px;
        padding: 26px;
        box-shadow: 0 12px 30px rgba(15, 35, 95, 0.06);
      }
      .provaGateBox.bloqueada {
        border-color: rgba(180, 40, 40, 0.22);
        background: linear-gradient(180deg, #fff, #fff8f8);
      }
      .provaGateBox h1 {
        margin: 0;
        font-size: 32px;
        line-height: 1.15;
        font-weight: 950;
        color: #0b2a6f;
      }
      .provaGateBox p {
        margin: 14px 0 0;
        font-size: 15px;
        line-height: 1.5;
        color: #17326e;
        font-weight: 750;
      }
      .gateBadge {
        display: inline-flex;
        margin-bottom: 12px;
        border-radius: 999px;
        padding: 7px 11px;
        background: #fff4f4;
        border: 1px solid #f1c8c8;
        color: #a22b2b;
        font-size: 11px;
        font-weight: 950;
      }
      .gateNote {
        margin-top: 16px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(10, 42, 106, 0.12);
        background: #f7f9ff;
        color: #17326e;
        font-size: 13px;
        font-weight: 800;
      }
      .gateActions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 18px;
      }
      .gateBtn {
        min-height: 42px;
        border-radius: 999px;
        border: 1px solid #ccd6e6;
        background: #fff;
        color: #0b2a6f;
        padding: 0 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 950;
        text-decoration: none;
      }
      .gateBtn.primary {
        background: #f4c400;
        border-color: #e0b900;
      }
      @media (max-width: 760px) {
        .provaGatePage { padding: 22px 14px 36px; }
        .provaGateBox { padding: 20px; }
        .provaGateBox h1 { font-size: 26px; }
      }
    `}</style>
  );
}
