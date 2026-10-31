import type { Connector, ConnectorDocument } from "@/lib/connectors/types";
import { env } from "@/lib/env";

async function notionFetch(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Notion ${response.status}`);
  return response.json();
}

function richText(block: { paragraph?: { rich_text?: Array<{ plain_text?: string }> } }): string {
  return (block.paragraph?.rich_text || []).map((item) => item.plain_text || "").join("");
}

export const notionConnector: Connector = {
  id: "notion",
  async listUpdates(config) {
    const token = config.token || env.NOTION_TOKEN;
    const databaseId = config.databaseId;
    if (!token || !databaseId) return [];
    const data = await notionFetch(`/databases/${databaseId}/query`, token, { method: "POST", body: "{}" });
    const results = (data.results || []) as Array<{ id: string; url?: string }>;
    const docs: ConnectorDocument[] = [];
    for (const page of results.slice(0, 20)) {
      docs.push(await this.fetchDocument(config, page.id));
    }
    return docs;
  },
  async fetchDocument(config, externalId) {
    const token = config.token || env.NOTION_TOKEN;
    const page = await notionFetch(`/pages/${externalId}`, token);
    const blocks = await notionFetch(`/blocks/${externalId}/children`, token);
    const text = ((blocks.results || []) as Array<{ paragraph?: { rich_text?: Array<{ plain_text?: string }> } }>)
      .map((block) => richText(block))
      .filter(Boolean)
      .join("\n");
    const titleProp = page.properties
      ? Object.values(page.properties as Record<string, { title?: Array<{ plain_text?: string }> }>)[0]
      : undefined;
    const title = titleProp?.title?.[0]?.plain_text || "Notion page";
    return { externalId, title, text, sourceUrl: page.url };
  },
};
