import { env } from "@/lib/env";
import { prisma, prismaForUrl, type PrismaClient } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { encryptContent, decryptContent } from "@/lib/crypto";

/**
 * Control-plane rows (users, workspaces, billing, audit) stay on DATABASE_URL.
 * Documents, chunks, chats, and messages use the tenant URI when
 * `workspace.targetDatabaseUrl` is set.
 */
export async function resolveWorkspaceDatabaseUrl(workspaceId: string): Promise<string> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { targetDatabaseUrl: true },
  });
  const stored = decryptContent(workspace?.targetDatabaseUrl);
  return stored || env.DATABASE_URL || process.env.DATABASE_URL || "";
}

export async function prismaForWorkspace(workspaceId: string): Promise<PrismaClient> {
  const url = await resolveWorkspaceDatabaseUrl(workspaceId);
  return prismaForUrl(url);
}

export async function provisionManagedDatabase(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");
  if (workspace.plan !== "PRO") {
    throw new Error("Managed Neon Postgres is included on the Pro plan");
  }
  if (!env.NEON_API_KEY) {
    throw new Error("NEON_API_KEY is required to provision managed Postgres");
  }
  if (workspace.neonProjectId) {
    return {
      alreadyProvisioned: true,
      projectId: workspace.neonProjectId,
      hasTargetDatabaseUrl: Boolean(workspace.targetDatabaseUrl),
    };
  }

  const response = await fetch("https://console.neon.tech/api/v2/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.NEON_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project: { name: `quill-${workspace.slug}`.slice(0, 60), pg_version: 16 },
    }),
  });
  const payload = (await response.json()) as {
    project?: { id?: string };
    connection_uris?: Array<{ connection_uri?: string }>;
    message?: string;
  };
  if (!response.ok || !payload.project?.id) {
    throw new Error(payload.message || `Neon project creation failed (${response.status})`);
  }

  const connectionUri = payload.connection_uris?.[0]?.connection_uri || null;
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      hostingProvider: "neon",
      neonProjectId: payload.project.id,
      ...(connectionUri ? { targetDatabaseUrl: encryptContent(connectionUri) } : {}),
    },
  });
  await writeAudit({
    event: "WORKSPACE_SETTINGS_CHANGED",
    userId,
    workspaceId,
    metadata: {
      hostingProvider: "neon",
      neonProjectId: payload.project.id,
      targetDatabaseUrlStored: Boolean(connectionUri),
    },
  }).catch(() => {});

  return {
    alreadyProvisioned: false,
    projectId: payload.project.id,
    connectionUri,
  };
}
