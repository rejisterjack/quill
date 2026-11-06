/**
 * Collect final assistant text from a Quill chat SSE response
 * (`event: token` with `{ token }` payloads). Ignores sources/done.
 */
export async function collectSseText(response: Response): Promise<string> {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/event-stream")) {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body) as { error?: string; text?: string };
      if (parsed.error) return parsed.error;
      if (parsed.text) return parsed.text;
    } catch {
      /* plain text */
    }
    return body.trim();
  }

  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const block of events) {
      if (!block.includes("event: token")) continue;
      const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      try {
        const parsed = JSON.parse(dataLine.slice(5).trim()) as { token?: string };
        text += parsed.token || "";
      } catch {
        /* skip malformed token frames */
      }
    }
  }

  return text.trim();
}
