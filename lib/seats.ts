import { prisma } from "@/lib/prisma";

export class SeatLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeatLimitError";
  }
}

export function workspaceLimitFor(plan: "FREE" | "PRO") {
  return plan === "PRO" ? 10 : 1;
}

export async function assertSeatAvailable(workspaceId: string, existingUserId?: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");
  if (existingUserId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existingUserId } },
    });
    if (member && (member.status === "ACTIVE" || member.status === "PENDING")) return workspace;
  }
  const members = await prisma.workspaceMember.count({
    where: { workspaceId, status: { in: ["ACTIVE", "PENDING"] } },
  });
  const invites = await prisma.workspaceInvite.count({
    where: { workspaceId, expiresAt: { gt: new Date() } },
  });
  if (members + invites >= workspace.seatLimit) {
    throw new SeatLimitError(`Seat limit is ${workspace.seatLimit}`);
  }
  return workspace;
}

export async function assertCanCreateWorkspace(userId: string) {
  const owned = await prisma.workspace.findMany({
    where: { ownerId: userId },
    select: { plan: true },
  });
  const plan = owned.some((workspace) => workspace.plan === "PRO") ? "PRO" : "FREE";
  const limit = workspaceLimitFor(plan);
  if (owned.length >= limit) {
    throw new SeatLimitError(
      plan === "PRO"
        ? "Pro includes 10 workspaces"
        : "The free plan includes 1 workspace. Upgrade to Pro for 10.",
    );
  }
  return { plan, limit, owned: owned.length };
}
