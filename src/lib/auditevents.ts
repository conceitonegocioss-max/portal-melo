import fs from "fs/promises";
import { getDataDir, getDataFilePath } from "@/src/lib/dataDir";

export type AuditEventType =
  | "LOGIN_OK"
  | "LOGIN_FALHA"
  | "LOGOUT"
  | "PAGE_VIEW"
  | "TREINAMENTO_ABERTO"
  | "TREINAMENTO_CONCLUIDO"
  | "PROVA_INICIADA"
  | "PROVA_FINALIZADA"
  | "TERMO_ACEITO"
  | "USUARIO_ALTERADO"
  | "EXPORT_EVIDENCIA"
  | "EXPORT_RELATORIO"
  | "OUTRO";

export type AuditEventEntry = {
  id: string;
  atISO: string;
  type: AuditEventType;

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

const FILE_NAME = "audit-events.json";

function dataFilePath() {
  return getDataFilePath(FILE_NAME);
}

async function ensureDataDir() {
  await fs.mkdir(getDataDir(), { recursive: true });
}

async function readFileSafe(): Promise<AuditEventEntry[]> {
  try {
    const fp = dataFilePath();
    const raw = await fs.readFile(fp, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AuditEventEntry[];
    return [];
  } catch {
    return [];
  }
}

async function writeFileSafe(items: AuditEventEntry[]) {
  await ensureDataDir();
  const fp = dataFilePath();
  await fs.writeFile(fp, JSON.stringify(items, null, 2), "utf-8");
}

export function normalizeCpf(input: string) {
  return (input || "").replace(/\D/g, "");
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function appendEventLog(
  entry: Omit<AuditEventEntry, "id" | "atISO"> & { atISO?: string }
) {
  const items = await readFileSafe();

  const normalized: AuditEventEntry = {
    id: newId(),
    atISO: entry.atISO || new Date().toISOString(),
    type: entry.type,

    actorCpf: entry.actorCpf ? normalizeCpf(entry.actorCpf) : undefined,
    actorNome: entry.actorNome,
    actorPerfil: entry.actorPerfil,
    actorEmpresa: entry.actorEmpresa,

    targetCpf: entry.targetCpf ? normalizeCpf(entry.targetCpf) : undefined,

    module: entry.module,
    entityId: entry.entityId,
    entityTitle: entry.entityTitle,

    meta: entry.meta,
    obs: entry.obs,

    ip: entry.ip,
    userAgent: entry.userAgent,
  };

  items.unshift(normalized);

  const limited = items.slice(0, 10000);

  await writeFileSafe(limited);
  return normalized;
}

export async function listEventLog(): Promise<AuditEventEntry[]> {
  return await readFileSafe();
}

export async function clearEventLog() {
  await writeFileSafe([]);
}
