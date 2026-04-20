import { prisma } from "@/src/lib/prisma";

export async function writeAuditLog(input: {
  action: string;
  actorCpf: string;
  actorName?: string | null;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actorCpf: input.actorCpf,
        actorName: input.actorName ?? null,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (e) {
    console.error("auditLog error:", e);
    throw e;
  }
}