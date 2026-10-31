import { prisma } from "@/lib/prisma";

export async function workspaceRole(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member || member.status === "REMOVED" || member.status === "SUSPENDED") return null;
  return member.role;
}

export async function assertCanChat(userId: string, workspaceId: string, globalRole?: string) {
  if (globalRole === "ADMIN") return;
  const role = await workspaceRole(userId, workspaceId);
  if (!role || role === "VIEWER") {
    throw new Error("Forbidden: viewers cannot send chat messages");
  }
}

export async function assertCanUpload(userId: string, workspaceId: string, globalRole?: string) {
  if (globalRole === "ADMIN") return;
  const role = await workspaceRole(userId, workspaceId);
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("Forbidden: only workspace owners and admins can upload");
  }
}
