function normalizeCpf(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}
import { appendAccessLog } from "./accessLog";

export type UserStatus = "ATIVO" | "INATIVO";
export type UserPerfil = "ADMIN" | "COLABORADOR";

type OverrideItem = {
  cpf: string; // normalizado (somente dígitos)
  status?: UserStatus;
  perfil?: UserPerfil;
  updatedAtISO?: string;
  updatedBy?: string; // nome/id do admin
};

type OverridesDB = Record<string, OverrideItem>; // key = cpf

const KEY = "portal_user_overrides_v1";

function readDB(): OverridesDB {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OverridesDB;
  } catch {
    return {};
  }
}

function writeDB(db: OverridesDB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function getOverride(cpf: string): OverrideItem | null {
  const c = normalizeCpf(cpf);
  if (!c) return null;
  const db = readDB();
  return db[c] || null;
}

export function getEffectiveStatus(cpf: string): UserStatus {
  const o = getOverride(cpf);
  return o?.status === "INATIVO" ? "INATIVO" : "ATIVO";
}

export function getEffectivePerfil(cpf: string, basePerfil: UserPerfil): UserPerfil {
  const o = getOverride(cpf);
  return (o?.perfil as UserPerfil) || basePerfil;
}

export function setStatus(
  cpf: string,
  status: UserStatus,
  updatedBy?: string,
  meta?: { actorCpf?: string; actorNome?: string; targetNome?: string; targetEmpresa?: string }
) {
  const c = normalizeCpf(cpf);
  if (!c) return;

  const before = getEffectiveStatus(c);

  const db = readDB();
  db[c] = {
    ...(db[c] || { cpf: c }),
    cpf: c,
    status,
    updatedAtISO: new Date().toISOString(),
    updatedBy: updatedBy || db[c]?.updatedBy,
  };
  writeDB(db);

  // ✅ Log auditável
  appendAccessLog({
    action: "STATUS_CHANGE",
    targetCpf: c,
    targetNome: meta?.targetNome,
    targetEmpresa: meta?.targetEmpresa,
    before,
    after: status,
    actorCpf: meta?.actorCpf || null,
    actorNome: meta?.actorNome || updatedBy || null,
    note: "Alteração de status (controle de acesso)",
  });
}

export function setPerfil(
  cpf: string,
  perfil: UserPerfil,
  updatedBy?: string,
  meta?: { actorCpf?: string; actorNome?: string; targetNome?: string; targetEmpresa?: string; basePerfil?: string }
) {
  const c = normalizeCpf(cpf);
  if (!c) return;

  const before = meta?.basePerfil || null;

  const db = readDB();
  db[c] = {
    ...(db[c] || { cpf: c }),
    cpf: c,
    perfil,
    updatedAtISO: new Date().toISOString(),
    updatedBy: updatedBy || db[c]?.updatedBy,
  };
  writeDB(db);

  // ✅ Log auditável
  appendAccessLog({
    action: "PERFIL_CHANGE",
    targetCpf: c,
    targetNome: meta?.targetNome,
    targetEmpresa: meta?.targetEmpresa,
    before,
    after: perfil,
    actorCpf: meta?.actorCpf || null,
    actorNome: meta?.actorNome || updatedBy || null,
    note: "Alteração de perfil (controle de acesso)",
  });
}
