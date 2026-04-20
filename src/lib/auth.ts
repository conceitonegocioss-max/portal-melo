export type Perfil = "ADMIN" | "COLABORADOR" | "GESTOR";

export type SessionUser = {
  id?: string;
  nome: string;
  cpf: string;
  perfil: Perfil;
  empresa?: string | null;
  status?: "ATIVO" | "INATIVO";
};

const SESSION_KEY = "portal_colaborador_session_v1";

export function normalizeCpf(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizePerfil(value: unknown): Perfil {
  const perfil = String(value ?? "").toUpperCase().trim();

  if (perfil === "ADMIN") return "ADMIN";
  if (perfil === "GESTOR") return "GESTOR";
  return "COLABORADOR";
}

function normalizeStatus(value: unknown): "ATIVO" | "INATIVO" {
  const status = String(value ?? "").toUpperCase().trim();
  return status === "INATIVO" ? "INATIVO" : "ATIVO";
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return null;

    return {
      id: parsed.id ? String(parsed.id) : undefined,
      nome: String(parsed.nome ?? ""),
      cpf: normalizeCpf(parsed.cpf),
      perfil: normalizePerfil(parsed.perfil),
      empresa: parsed.empresa ? String(parsed.empresa) : null,
      status: normalizeStatus(parsed.status),
    };
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  if (typeof window === "undefined") return;

  const session: SessionUser = {
    id: user.id ? String(user.id) : undefined,
    nome: String(user.nome ?? ""),
    cpf: normalizeCpf(user.cpf),
    perfil: normalizePerfil(user.perfil),
    empresa: user.empresa ? String(user.empresa) : null,
    status: normalizeStatus(user.status),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAdminPerfil(perfil: unknown) {
  return normalizePerfil(perfil) === "ADMIN";
}

export function isGestorPerfil(perfil: unknown) {
  return normalizePerfil(perfil) === "GESTOR";
}

export function isColaboradorPerfil(perfil: unknown) {
  return normalizePerfil(perfil) === "COLABORADOR";
}