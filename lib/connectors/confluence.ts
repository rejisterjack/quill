import type { Connector } from "@/lib/connectors/types";

export const confluenceConnector: Connector = {
  id: "confluence",
  async listUpdates(config) {
    const response = await fetch(
      `${config.baseUrl}/wiki/api/v2/pages?space-id=${config.spaceId}&limit=10`,
      { headers: { Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString("base64")}` } },
    );
    if (!response.ok) throw new Error(`Confluence ${response.status}`);
    const data = await response.json();
    return Promise.all(
      ((data.results || []) as Array<{ id: string }>).map((page) => this.fetchDocument(config, page.id)),
    );
  },
  async fetchDocument(config, externalId) {
    const auth = Buffer.from(`${config.email}:${config.token}`).toString("base64");
    const response = await fetch(`${config.baseUrl}/wiki/api/v2/pages/${externalId}?body-format=storage`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!response.ok) throw new Error(`Confluence ${response.status}`);
    const page = await response.json();
    const html = page.body?.storage?.value || "";
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { externalId, title: page.title || "Confluence page", text, sourceUrl: page._links?.webui };
  },
};
