import { prisma } from "@/lib/prisma";
import { streamChatCompletion } from "@/lib/ai";
import { retrieveWithAgent } from "@/lib/agent";
import { writeAudit } from "@/lib/audit";
import { consumeQuery } from "@/lib/quota";
import { captureProductEvent } from "@/lib/analytics";

export async function runGroundedChat(input: {
  message: string;
  userId: string;
  workspaceId: string;
  chatId?: string | null;
  allowAdminOverride?: boolean;
  eventName?: "chat_message" | "embed_message";
}) {
  const quota = await consumeQuery(input.workspaceId);
  if (!quota.allowed) {
    return new Response(JSON.stringify({ error: "Monthly query quota exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: input.workspaceId } });
  const started = Date.now();
  const sources = await retrieveWithAgent({
    query: input.message,
    workspaceId: input.workspaceId,
    userId: input.userId,
    embedding: {
      model: workspace?.embeddingModel,
      dimensions: workspace?.embeddingDimensions,
    },
  });
  const retrievalMs = Date.now() - started;

  let chatId = input.chatId || null;
  if (chatId) {
    const existing = await prisma.chat.findUnique({ where: { id: chatId }, select: { userId: true } });
    if (!existing || (existing.userId !== input.userId && !input.allowAdminOverride)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
  } else {
    const title = input.message.trim().split(/\s+/).slice(0, 6).join(" ") || "New Conversation";
    const created = await prisma.chat.create({
      data: { title, userId: input.userId, workspaceId: input.workspaceId, model: workspace?.chatModel },
    });
    chatId = created.id;
  }

  await prisma.message.create({
    data: { chatId, role: "USER", content: input.message.trim() },
  });
  await writeAudit({
    event: "CHAT_MESSAGE_SENT",
    userId: input.userId,
    workspaceId: input.workspaceId,
    metadata: { chatId, promptLength: input.message.length },
  }).catch(() => {});

  const history = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const aiStream = await streamChatCompletion({
    model: workspace?.chatModel,
    messages: history.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
    })),
    contextChunks: sources.map((source) => ({
      documentTitle: source.documentTitle,
      content: source.content,
      similarity: source.similarity,
      pageNumber: source.pageNumber,
      section: source.section,
    })),
  });

  const encoder = new TextEncoder();
  let fullAssistantResponse = "";
  const topSimilarity = sources.find((source) => source.similarity !== null)?.similarity ?? null;

  const readableStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `event: sources\ndata: ${JSON.stringify({
            chatId,
            sources: sources.map((s) => ({
              chunkId: s.id,
              documentTitle: s.documentTitle,
              documentName: s.documentTitle,
              similarity: s.similarity,
              match: s.match,
              content: s.content,
              snippet: s.content,
              pageNumber: s.pageNumber,
              page: s.pageNumber,
              section: s.section,
            })),
          })}\n\n`,
        ),
      );

      if (aiStream) {
        try {
          for await (const chunk of aiStream) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) {
              fullAssistantResponse += token;
              controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ token })}\n\n`));
            }
          }
        } catch (streamErr) {
          console.warn("Stream interrupted", streamErr);
        }
      }

      if (!fullAssistantResponse.trim()) {
        const fallbackText =
          sources.length > 0
            ? `Based on the documentation for **${sources[0].documentTitle}**:\n\n${sources[0].content}`
            : "I couldn't find specific documentation matching your query in the current knowledge base.";
        fullAssistantResponse = fallbackText;
        controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ token: fallbackText })}\n\n`));
      }

      const assistantMessage = await prisma.message.create({
        data: {
          chatId: chatId!,
          role: "ASSISTANT",
          content: fullAssistantResponse,
          sources: sources as unknown as object,
          metadata: { retrievalMs, topSimilarity },
        },
      });
      await captureProductEvent(input.eventName || "chat_message", {
        workspaceId: input.workspaceId,
        latency: retrievalMs,
      });

      controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ chatId, messageId: assistantMessage.id })}\n\n`));
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
