import { prisma } from "@/lib/prisma";

export async function consumeQuery(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");
  const period = new Date().toISOString().slice(0, 7);
  const count = workspace.monthlyQueryPeriod === period ? workspace.monthlyQueryCount : 0;
  if (count >= workspace.monthlyQueryLimit) {
    return { allowed: false, remaining: 0 };
  }
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      monthlyQueryPeriod: period,
      monthlyQueryCount: count + 1,
    },
  });
  return { allowed: true, remaining: workspace.monthlyQueryLimit - count - 1 };
}
