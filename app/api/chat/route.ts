import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
import { assertCanChat } from "@/lib/authz";
import { runGroundedChat } from "@/lib/run-chat";

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
    const rateLimit = await checkRateLimit(`chat_${clientIp}`, { limit: 40, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      await writeAudit({
        userId: user.id,
        event: "RATE_LIMIT_HIT",
        severity: "WARNING",
        metadata: { endpoint: "/api/chat", ip: clientIp, resetMs: rateLimit.resetMs },
      }).catch(() => {});
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before sending another query." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() },
      });
    }

    const body = await req.json();
    const { message, chatId, workspaceId: reqWorkspaceId } = body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const workspaceId =
      reqWorkspaceId || user.activeWorkspaceId || (await prisma.workspace.findFirst())?.id;
    if (!workspaceId) {
      return new Response(JSON.stringify({ error: "No workspace" }), { status: 400 });
    }

    try {
      await assertCanChat(user.id, workspaceId, user.role);
    } catch (err) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Forbidden" }), { status: 403 });
    }

    return runGroundedChat({
      message,
      userId: user.id,
      workspaceId,
      chatId,
      allowAdminOverride: user.role === "ADMIN",
      eventName: "chat_message",
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
