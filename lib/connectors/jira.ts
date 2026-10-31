import type { Connector } from "@/lib/connectors/types";

export const jiraConnector: Connector = {
  id: "jira",
  async listUpdates(config) {
    const auth = Buffer.from(`${config.email}:${config.token}`).toString("base64");
    const response = await fetch(
      `${config.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(config.jql || "order by updated DESC")}&maxResults=10`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    if (!response.ok) throw new Error(`Jira ${response.status}`);
    const data = await response.json();
    return ((data.issues || []) as Array<{ key: string; fields?: { summary?: string; description?: unknown } }>).map(
      (issue) => ({
        externalId: issue.key,
        title: issue.fields?.summary || issue.key,
        text: JSON.stringify(issue.fields?.description || ""),
        sourceUrl: `${config.baseUrl}/browse/${issue.key}`,
      }),
    );
  },
  async fetchDocument(config, externalId) {
    const listed = await this.listUpdates(config);
    const found = listed.find((item) => item.externalId === externalId);
    if (!found) throw new Error("Jira issue not found");
    return found;
  },
};
