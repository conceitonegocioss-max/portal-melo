type AnySession = {
  cpf?: string;
  role?: string;
  perfil?: string;
  isAdmin?: boolean;
  admin?: boolean;
  permissoes?: string[];
  [k: string]: any;
};

function norm(v: unknown) {
  return String(v ?? "").trim().toUpperCase();
}

/**
 * Regra tolerante para não travar:
 * - isAdmin/admin boolean
 * - role/perfil == ADMIN
 * - permissoes contém ADMIN ou AUDITORIA_ADMIN
 */
export function isAdmin(session: AnySession | null | undefined): boolean {
  if (!session) return false;

  if (session.isAdmin === true || session.admin === true) return true;

  const role = norm(session.role);
  const perfil = norm(session.perfil);

  if (role === "ADMIN" || perfil === "ADMIN") return true;
  if (role === "AUDITORIA_ADMIN" || perfil === "AUDITORIA_ADMIN") return true;

  const perms = Array.isArray(session.permissoes) ? session.permissoes.map(norm) : [];
  if (perms.includes("ADMIN") || perms.includes("AUDITORIA_ADMIN")) return true;

  return false;
}
