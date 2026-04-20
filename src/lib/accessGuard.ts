import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { clearSession, getSession } from "./auth";

function isAdminPerfil(perfil: string) {
  const p = String(perfil || "").toUpperCase();
  return p === "ADMIN" || p.startsWith("ADMIN_");
}

/**
 * Regra central de acesso ADMIN:
 * - sem sessão -> login
 * - status INATIVO -> limpa sessão e login
 * - não-admin -> /colaborador
 */
export function guardAdmin(router: AppRouterInstance) {
  const s = getSession();

  if (!s?.cpf) {
    router.replace("/colaborador/login");
    return { ok: false as const };
  }

  if (s.status === "INATIVO") {
    clearSession();
    router.replace("/colaborador/login");
    return { ok: false as const };
  }

  if (!isAdminPerfil(s.perfil)) {
    router.replace("/colaborador");
    return { ok: false as const };
  }

  return { ok: true as const, session: s };
}
