import type { Connector, ConnectorDocument } from "@/lib/connectors/types";
import { env } from "@/lib/env";

export const githubConnector: Connector = {
  id: "github",
  async listUpdates(config) {
    const token = config.token || env.GITHUB_TOKEN;
    const repo = config.repo;
    if (!token || !repo) return [];
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${config.path || ""}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const body = await response.json();
    const files = (Array.isArray(body) ? body : [body]) as Array<{ path: string; type: string; download_url?: string }>;
    const docs: ConnectorDocument[] = [];
    for (const file of files.filter((item) => item.type === "file" && item.path.endsWith(".md")).slice(0, 20)) {
      docs.push(await this.fetchDocument(config, file.path));
    }
    return docs;
  },
  async fetchDocument(config, externalId) {
    const token = config.token || env.GITHUB_TOKEN;
    const response = await fetch(`https://api.github.com/repos/${config.repo}/contents/${externalId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.raw" },
    });
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const text = await response.text();
    return {
      externalId,
      title: externalId.split("/").pop() || externalId,
      text,
      sourceUrl: `https://github.com/${config.repo}/blob/HEAD/${externalId}`,
    };
  },
};
