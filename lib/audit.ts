import { createHash } from "crypto";
import type { AuditEvent, AuditSeverity, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const AUDIT_GENESIS = "quill-audit-genesis-v1";

export function hashAuditPayload(prevHash: string, event: string, metadata: unknown): string {
  return createHash("sha256")
    .update(`${prevHash}|${event}|${JSON.stringify(metadata ?? {})}`)
    .digest("hex");
}

export async function writeAudit(input: {
  event: AuditEvent;
  severity?: AuditSeverity;
  userId?: string | null;
  workspaceId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const previous = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { metadata: true },
  });
  const prevMeta = (previous?.metadata ?? {}) as { hash?: string };
  const prevHash = prevMeta.hash || AUDIT_GENESIS;
  const body = input.metadata ?? {};
  const hash = hashAuditPayload(prevHash, input.event, body);
  const metadata = {
    ...(typeof body === "object" && body !== null ? body : { value: body }),
    prevHash,
    hash,
  };

  return prisma.auditLog.create({
    data: {
      event: input.event,
      severity: input.severity ?? "INFO",
      userId: input.userId ?? undefined,
      workspaceId: input.workspaceId ?? undefined,
      metadata,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}

export async function verifyAuditChain(): Promise<{ ok: boolean; badId?: string }> {
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
  let prev = AUDIT_GENESIS;
  for (const row of rows) {
    const meta = (row.metadata ?? {}) as { prevHash?: string; hash?: string };
    const { prevHash: _p, hash: _h, ...rest } = meta;
    const expected = hashAuditPayload(prev, row.event, rest);
    if (meta.prevHash !== prev || meta.hash !== expected) {
      return { ok: false, badId: row.id };
    }
    prev = meta.hash || prev;
  }
  return { ok: true };
}
