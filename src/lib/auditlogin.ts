import fs from "fs/promises";
import path from "path";

export type LoginAction = "LOGIN_OK" | "LOGIN_FALHA" | "LOGOUT";

export type AuditLoginEntry = {
  id: string; // identificador único do registro
  atISO: string; // data/hora ISO
  action: LoginAction;

  cpf: string; // normalizado (somente dígitos)
  nome?: string;
  empresa?: string;
  perfil?: string;

  // contexto técnico
  ip?: string;
  userAgent?: string;

  // observação curta (sem dados sensíveis)
  obs?: string;
};

const FILE_NAME = "audit-logins.json";

function dataFilePath() {
  return path.join(process.cwd(), "data", FILE_NAME);
}

async function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  await fs.mkdir(dir, { recursive: true });
}

async function readFileSafe(): Promise<AuditLoginEntry[]> {
  try {
    const fp = dataFilePath();
    const raw = await fs.readFile(fp, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AuditLoginEntry[];
    return [];
  } catch {
    return [];
  }
}

async function writeFileSafe(items: AuditLoginEntry[]) {
  await ensureDataDir();
  const fp = dataFilePath();
  await fs.writeFile(fp, JSON.stringify(items, null, 2), "utf-8");
}

export function normalizeCpf(input: string) {
  return (input || "").replace(/\D/g, "");
}

export function newId() {
  // simples e suficiente p/ auditoria local
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function appendLoginLog(entry: Omit<AuditLoginEntry, "id" | "atISO"> & { atISO?: string }) {
  const items = await readFileSafe();

  const normalized: AuditLoginEntry = {
    id: newId(),
    atISO: entry.atISO || new Date().toISOString(),
    action: entry.action,
    cpf: normalizeCpf(entry.cpf || ""),
    nome: entry.nome,
    empresa: entry.empresa,
    perfil: entry.perfil,
    ip: entry.ip,
    userAgent: entry.userAgent,
    obs: entry.obs,
  };

  // mais recente primeiro
  items.unshift(normalized);

  // limite (evita crescer sem controle)
  const limited = items.slice(0, 5000);

  await writeFileSafe(limited);
  return normalized;
}

export async function listLoginLog(): Promise<AuditLoginEntry[]> {
  return await readFileSafe();
}

export async function clearLoginLog() {
  await writeFileSafe([]);
}
