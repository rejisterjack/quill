import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let client: PostHog | null = null;

function posthog(): PostHog | null {
  if (!env.POSTHOG_KEY) return null;
  if (!client) {
    client = new PostHog(env.POSTHOG_KEY, { host: env.NEXT_PUBLIC_POSTHOG_HOST });
  }
  return client;
}

export async function captureProductEvent(
  event: "document_ingested" | "chat_message" | "embed_message",
  properties: Record<string, string | number | null | undefined>,
) {
  const ph = posthog();
  if (!ph) return;
  const safe: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    safe[key] = value;
  }
  ph.capture({
    distinctId: String(properties.workspaceId || "quill"),
    event,
    properties: safe,
  });
}
