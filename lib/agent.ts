import { searchSimilarChunks, type RetrievedChunk } from "@/lib/vector";
import { writeAudit } from "@/lib/audit";

export async function retrieveWithAgent(input: {
  query: string;
  workspaceId?: string | null;
  userId?: string | null;
  embedding?: { model?: string; dimensions?: number };
}): Promise<RetrievedChunk[]> {
  const searchLike = /where|what|how|why|policy|document|find|summar/i.test(input.query);
  const kind = searchLike ? "search" : "chitchat";
  await writeAudit({
    event: "AGENT_QUERY_CLASSIFIED",
    userId: input.userId,
    workspaceId: input.workspaceId,
    metadata: { kind },
  }).catch(() => {});

  if (kind === "chitchat") return [];

  const first = await searchSimilarChunks(input.query, input.workspaceId, 4, input.embedding);
  await writeAudit({
    event: "AGENT_TOOL_CALLED",
    userId: input.userId,
    workspaceId: input.workspaceId,
    metadata: { tool: "searchSimilarChunks", hits: first.length },
  }).catch(() => {});

  if (first.length === 0) {
    await writeAudit({
      event: "MULTI_STEP_REASONING_STARTED",
      userId: input.userId,
      workspaceId: input.workspaceId,
      metadata: { step: 2 },
    }).catch(() => {});
    const second = await searchSimilarChunks(
      input.query.split(/\s+/).slice(0, 4).join(" "),
      input.workspaceId,
      4,
      input.embedding,
    );
    await writeAudit({
      event: "AGENT_TOOL_CALLED",
      userId: input.userId,
      workspaceId: input.workspaceId,
      metadata: { tool: "searchSimilarChunks", step: 2, hits: second.length },
    }).catch(() => {});
    return second;
  }

  return first;
}
