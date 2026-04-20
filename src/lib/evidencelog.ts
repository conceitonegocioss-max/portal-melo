// src/lib/evidenceLog.ts
export type EvidenceAction =
  | "VIEW"
  | "DOWNLOAD"
  | "COPY"
  | "ACK_ON"
  | "ACK_OFF";

export type EvidenceLogEntry = {
  id: string;
  cpf: string;
  atISO: string; // timestamp ISO
  area: "SCRIPTS";
  itemId: string; // ex: "script-abrir-chamado"
  itemTitle: string;
  itemVersion: string; // ex: "v1.0"
  action: EvidenceAction;
  meta?: Record<string, string | number | boolean | null>;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function nowISO() {
  return new Date().toISOString();
}

function randomId() {
  // suficiente p/ log local
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function logsKeyByCpf(cpf: string) {
  return `portal_evidence_logs_v1_${onlyDigits(cpf)}`;
}

function ackKeyByCpf(cpf: string) {
  return `portal_scripts_ack_v1_${onlyDigits(cpf)}`; // { [scriptId]: { acknowledged: true, atISO, version } }
}

export function getEvidenceLogs(cpf: string): EvidenceLogEntry[] {
  if (typeof window === "undefined") return [];
  const key = logsKeyByCpf(cpf);
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as EvidenceLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendEvidenceLog(entry: Omit<EvidenceLogEntry, "id" | "atISO"> & { atISO?: string }) {
  if (typeof window === "undefined") return;
  const cpf = onlyDigits(entry.cpf);
  if (!cpf) return;

  const key = logsKeyByCpf(cpf);
  const newEntry: EvidenceLogEntry = {
    id: randomId(),
    atISO: entry.atISO || nowISO(),
    ...entry,
    cpf,
  };

  const existing = getEvidenceLogs(cpf);
  existing.unshift(newEntry); // mais recente primeiro
  localStorage.setItem(key, JSON.stringify(existing));
}

export type ScriptAckState = {
  acknowledged: boolean;
  atISO: string;
  version: string;
};

export function getScriptsAckMap(cpf: string): Record<string, ScriptAckState> {
  if (typeof window === "undefined") return {};
  const key = ackKeyByCpf(cpf);
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, ScriptAckState>) : {};
  } catch {
    return {};
  }
}

export function setScriptAck(cpf: string, scriptId: string, state: ScriptAckState) {
  if (typeof window === "undefined") return;
  const cpfDigits = onlyDigits(cpf);
  if (!cpfDigits) return;

  const key = ackKeyByCpf(cpfDigits);
  const map = getScriptsAckMap(cpfDigits);
  map[scriptId] = state;
  localStorage.setItem(key, JSON.stringify(map));
}
