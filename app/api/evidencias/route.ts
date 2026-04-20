import { NextResponse } from "next/server";
import fs from "fs";
import { ensureDataDirSync, getDataFilePath } from "@/src/lib/dataDir";

/**
 * Central de Evidências (JSON em /data/evidencias.json)
 * Objetivo: manter registro administrativo auditável por colaborador (CPF),
 * com rastreabilidade mínima (quando/quem/o quê) e estrutura extensível.
 *
 * ⚠️ Compatibilidade:
 * - Mantém campos existentes (cpf, colaborador, empresa, emitidoEmISO, emitidoPor, concluidos, total, itens).
 * - Adiciona campos novos como opcionais (não quebra telas atuais).
 */

type EvidenciaItem = {
  treinamentoId: string;
  status: "concluido" | "pendente";
  dataISO?: string | null;
};

type EvidenciaCategoria =
  | "LGPD"
  | "PLDFT"
  | "CONTROLES_INTERNOS"
  | "TREINAMENTOS"
  | "GOVERNANCA"
  | "OUTROS";

type EvidenciaTipo =
  | "CIENCIA_TERMO"
  | "CONCLUSAO_TREINAMENTO"
  | "LEITURA_DOCUMENTO"
  | "CHECKLIST_CONTROLE"
  | "REGISTRO_AUDITORIA"
  | "OUTRO";

type EvidenciaMeta = {
  /** Identificador do controle/obrigação (se existir): ex "LGPD-ACESSOS-001" */
  controleId?: string | null;

  /** Referência interna/externa (ex: URL, id do documento, nº chamado, nº ata) */
  referencia?: string | null;

  /** Contexto/observação do registro (sem dados sensíveis desnecessários) */
  observacao?: string | null;

  /** Tags simples para pesquisa */
  tags?: string[];

  /** Nome do sistema/origem do registro */
  origem?: string | null;
};

type Evidencia = {
  id: string; // cpf + data (ou outro identificador)
  cpf: string;
  colaborador: string;
  empresa?: string | null;

  /** Data/hora do registro (ISO) */
  emitidoEmISO: string;

  /** Quem registrou/publicou (nome do admin) */
  emitidoPor?: string | null;

  /** Indicadores de progresso (compatível com o que você já usa) */
  concluidos: number;
  total: number;

  /** Itens (mantém como está: base em treinamentos/itens) */
  itens: EvidenciaItem[];

  /** ✅ NOVOS CAMPOS (opcionais) — não quebram o que existe */
  categoria?: EvidenciaCategoria;
  tipo?: EvidenciaTipo;

  /**
   * Nível de evidência (para auditoria interna):
   * - "BAIXO": informativo/apoio
   * - "MEDIO": registro com referência
   * - "ALTO": registro com arquivo/hash/assinatura (quando aplicável)
   */
  nivel?: "BAIXO" | "MEDIO" | "ALTO";

  /** Metadados estruturados (opcional) */
  meta?: EvidenciaMeta;

  /**
   * Trilha de retenção (opcional):
   * exemplo: "5 anos" ou data limite ISO.
   */
  retencaoAteISO?: string | null;

  /**
   * Indica se o registro possui conteúdo potencialmente sensível (LGPD):
   * manter "false" por padrão. Se "true", exige cautela no conteúdo.
   */
  contemDadosSensiveis?: boolean;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function getDbPath() {
  return getDataFilePath("evidencias.json");
}

function readDb(): { items: Evidencia[] } {
  const p = getDbPath();
  if (!fs.existsSync(p)) return { items: [] };
  const raw = fs.readFileSync(p, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function writeDb(db: { items: Evidencia[] }) {
  ensureDataDirSync();
  const p = getDbPath();
  fs.writeFileSync(p, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * Normaliza o payload para manter compatibilidade com o que já existe
 * e garantir mínimos de auditoria (sem “quebrar” telas).
 */
function normalizeEvidence(input: any): Evidencia {
  const cpfLimpo = onlyDigits(input?.cpf || "");
  const colaborador = String(input?.colaborador || "").trim();

  const emitidoEmISO = String(input?.emitidoEmISO || "").trim();
  const empresa = input?.empresa ?? null;

  const itens: EvidenciaItem[] = Array.isArray(input?.itens)
    ? input.itens.map((it: any) => ({
        treinamentoId: String(it?.treinamentoId || "").trim(),
        status: it?.status === "concluido" ? "concluido" : "pendente",
        dataISO: it?.dataISO ?? null,
      }))
    : [];

  // fallback de id: se não vier, cria um previsível (cpf + timestamp)
  const id =
    String(input?.id || "").trim() ||
    `${cpfLimpo || "SEMCPF"}_${Date.now()}`;

  const concluidos = Number.isFinite(Number(input?.concluidos))
    ? Number(input.concluidos)
    : itens.filter((i) => i.status === "concluido").length;

  const total = Number.isFinite(Number(input?.total))
    ? Number(input.total)
    : itens.length;

  const ev: Evidencia = {
    id,
    cpf: cpfLimpo,
    colaborador,
    empresa,
    emitidoEmISO,
    emitidoPor: input?.emitidoPor ?? null,
    concluidos,
    total,
    itens,

    // novos (opcionais)
    categoria: input?.categoria,
    tipo: input?.tipo,
    nivel: input?.nivel,
    meta: input?.meta,
    retencaoAteISO: input?.retencaoAteISO ?? null,
    contemDadosSensiveis:
      typeof input?.contemDadosSensiveis === "boolean"
        ? input.contemDadosSensiveis
        : false,
  };

  return ev;
}

export async function GET() {
  const db = readDb();
  return NextResponse.json({ ok: true, items: db.items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ normaliza antes de validar
    const ev = normalizeEvidence(body);

    if (!ev?.cpf || ev.cpf.length !== 11 || !ev?.colaborador || !ev?.emitidoEmISO) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Payload inválido. Campos obrigatórios: cpf (11 dígitos), colaborador, emitidoEmISO.",
        },
        { status: 400 }
      );
    }

    // ✅ regra LGPD: por padrão, não permitir conteúdo “livre” com dados sensíveis
    // (mantemos apenas flags/metadados estruturados; descrição/observação deve ser objetiva)
    if (ev.contemDadosSensiveis) {
      // Não bloqueia (para não quebrar), mas exige que venha pelo menos um meta.controleId ou meta.referencia.
      const temReferencia = !!ev.meta?.controleId || !!ev.meta?.referencia;
      if (!temReferencia) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Registro marcado como sensível exige referência mínima (meta.controleId ou meta.referencia).",
          },
          { status: 400 }
        );
      }
    }

    const db = readDb();

    // Se já existir evidência com mesmo id, substitui; senão adiciona
    const idx = db.items.findIndex((x) => x.id === ev.id);
    if (idx >= 0) db.items[idx] = ev;
    else db.items.unshift(ev); // mais recente primeiro

    writeDb(db);

    return NextResponse.json({ ok: true, saved: ev.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erro ao salvar evidência." },
      { status: 500 }
    );
  }
}
