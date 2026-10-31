import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { complianceEvidence } from "@/lib/compliance";

export async function archiveAuditChain() {
  if (!env.AUDIT_ARCHIVE_URL) return { archived: false };
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
  const evidence = await complianceEvidence().catch(() => null);
  const body = JSON.stringify({
    evidence,
    chain: rows.map((row) => ({
      id: row.id,
      event: row.event,
      createdAt: row.createdAt,
      metadata: row.metadata,
    })),
  });
  const response = await fetch(env.AUDIT_ARCHIVE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!response.ok) throw new Error(`Audit archive failed (${response.status})`);
  return { archived: true, count: rows.length };
}
