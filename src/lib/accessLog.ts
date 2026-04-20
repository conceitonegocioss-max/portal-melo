function normalizeCpf(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

export type AccessAction = "STATUS_CHANGE" | "PERFIL_CHANGE";

export type AccessLogEntry = {
  id: string; // único
  action: AccessAction;

  targetCpf: string; // cpf do usuário afetado (normalizado)
  targetNome?: string | null;
  targetEmpresa?: string | null;

  before?: string | null;
  after?: string | null;

  actorCpf?: string | null; // cpf de quem alterou (normalizado)
  actorNome?: string | null;

  createdAtISO: string;
  note?: string | null;
};

const KEY = "portal_access_log_v1";

function read(): AccessLogEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AccessLogEntry[];
  } catch {
    return [];
  }
}

function write(items: AccessLogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

function uid() {
  return `al_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function appendAccessLog(entry: Omit<AccessLogEntry, "id" | "createdAtISO" | "targetCpf"> & { targetCpf: string }) {
  const items = read();

  const normalized: AccessLogEntry = {
    id: uid(),
    createdAtISO: new Date().toISOString(),
    targetCpf: normalizeCpf(entry.targetCpf),
    action: entry.action,
    targetNome: entry.targetNome ?? null,
    targetEmpresa: entry.targetEmpresa ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    actorCpf: entry.actorCpf ? normalizeCpf(entry.actorCpf) : null,
    actorNome: entry.actorNome ?? null,
    note: entry.note ?? null,
  };

  // guarda mais recente primeiro
  items.unshift(normalized);

  // opcional: limita tamanho
  const limited = items.slice(0, 2000);

  write(limited);
}

export function listAccessLog(): AccessLogEntry[] {
  return read();
}

export function clearAccessLog() {
  write([]);
}
