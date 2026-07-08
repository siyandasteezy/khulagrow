import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

/**
 * Append-only audit trail. Every mutation route calls this so SAHPRA
 * inspectors can reconstruct who did what, when, on which record.
 */
export async function audit(opts: {
  userId?: string;
  farmId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT";
  entity: string;
  entityId?: string;
  detail?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId,
        farmId: opts.farmId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        detail: opts.detail,
      },
    });
  } catch (err) {
    // The audit trail must never take down the primary operation.
    console.error("audit log failed", err);
  }
}
