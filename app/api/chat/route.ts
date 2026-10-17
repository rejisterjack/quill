import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchSimilarChunks } from "@/lib/vector";
import { streamChatCompletion } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Please sign in to send messages." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const clientIp = req.headers.get("x-forwarded-for") || user.id || "127.0.0.1";
    const rateLimit = checkRateLimit(`chat_${clientIp}`, { limit: 40, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          event: "RATE_LIMIT_HIT",
          severity: "WARNING",
          metadata: { endpoint: "/api/chat", ip: clientIp, resetMs: rateLimit.resetMs },
        },
      }).catch(() => {});

      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before sending another query." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
      );
    }

    const body = await req.json();
    const { message, chatId: existingChatId, workspaceId: reqWorkspaceId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const workspaceId =
      reqWorkspaceId ||
      user.activeWorkspaceId ||
      (await prisma.workspace.findFirst())?.id;

    // 1. Retrieve relevant chunks via pgvector
    const sources = await searchSimilarChunks(message, workspaceId, 4);

    // 2. Resolve or create chat conversation
    let chatId = existingChatId;
    if (chatId) {
      const existing = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { userId: true },
      });
      if (!existing || (existing.userId !== user.id && user.role !== "ADMIN")) {
        return new Response(JSON.stringify({ error: "Forbidden: You do not have permission for this chat." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Auto-title from the first 6 words of message
      const title =
        message.trim().split(/\s+/).slice(0, 6).join(" ") || "New Conversation";
      
      const newChat = await prisma.chat.create({
        data: {
          title,
          userId: user.id,
          workspaceId: workspaceId || null,
        },
      });
      chatId = newChat.id;
    }

    // 3. Save User message
    await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content: message.trim(),
      },
    });

    // Log chat message event to audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        workspaceId,
        event: "CHAT_MESSAGE_SENT",
        severity: "INFO",
        metadata: { chatId, promptLength: message.length },
      },
    }).catch(() => {});

    // 4. Fetch previous conversation history
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const messages = history.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
    }));

    // 5. Open AI stream
    const aiStream = await streamChatCompletion({
      messages,
      contextChunks: sources,
    });

    // Prepare response stream using SSE protocol
    const encoder = new TextEncoder();
    let fullAssistantResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        // Send initial metadata with citations
        const sourcesEvent = `event: sources\ndata: ${JSON.stringify({
          chatId,
          sources: sources.map((s) => ({
            chunkId: s.id,
            documentTitle: s.documentTitle,
            similarity: s.similarity,
            snippet: s.content.slice(0, 200) + "...",
            pageNumber: s.pageNumber,
            section: s.section,
          })),
        })}\n\n`;
        controller.enqueue(encoder.encode(sourcesEvent));

        if (aiStream) {
          try {
            for await (const chunk of aiStream) {
              const token = chunk.choices[0]?.delta?.content || "";
              if (token) {
                fullAssistantResponse += token;
                const tokenEvent = `event: token\ndata: ${JSON.stringify({ token })}\n\n`;
                controller.enqueue(encoder.encode(tokenEvent));
              }
            }
          } catch (streamErr) {
            console.warn("Stream interrupted, delivering current buffer:", streamErr);
          }
        }

        // If AI model was unreachable or gave empty response, provide a high-quality fallback synthesis from the sources
        if (!fullAssistantResponse.trim()) {
          const fallbackText =
            sources.length > 0
              ? `Based on the documentation for **${sources[0].documentTitle}**:\n\n${sources[0].content}\n\n*Source: [Source 1: ${sources[0].documentTitle}]*`
              : "I couldn't find specific documentation matching your query in the current knowledge base. You can upload relevant documents in the Admin portal to expand my knowledge.";

          fullAssistantResponse = fallbackText;
          const tokenEvent = `event: token\ndata: ${JSON.stringify({ token: fallbackText })}\n\n`;
          controller.enqueue(encoder.encode(tokenEvent));
        }

        // 6. Persist Assistant message to database
        try {
          await prisma.message.create({
            data: {
              chatId,
              role: "ASSISTANT",
              content: fullAssistantResponse,
              sources: sources as unknown as object,
            },
          });
        } catch (dbErr) {
          console.error("Failed to save assistant message:", dbErr);
        }

        // Send done event
        const doneEvent = `event: done\ndata: ${JSON.stringify({ chatId })}\n\n`;
        controller.enqueue(encoder.encode(doneEvent));
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
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
