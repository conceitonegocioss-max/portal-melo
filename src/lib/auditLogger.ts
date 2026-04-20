import { getSession } from "@/src/lib/auth";

type AuditEventType =
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

export async function logEvent(input: {
  type: AuditEventType;
  module?: string;
  entityId?: string;
  entityTitle?: string;
  targetCpf?: string;
  meta?: Record<string, any>;
  obs?: string;
}) {
  try {
    const session = getSession();

    await fetch("/api/audit/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: input.type,
        module: input.module,
        entityId: input.entityId,
        entityTitle: input.entityTitle,
        targetCpf: input.targetCpf,
        meta: input.meta,
        obs: input.obs,
        atISO: new Date().toISOString(),

        // ator vem da sessão
        actorCpf: session?.cpf || "",
        actorNome: session?.nome || "",
        actorPerfil: session?.perfil || "",
        actorEmpresa: session?.empresa || "",
      }),
    });
  } catch {
    // ✅ não quebra o app se falhar
  }
}