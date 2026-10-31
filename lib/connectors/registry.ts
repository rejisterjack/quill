import type { Connector } from "@/lib/connectors/types";
import { notionConnector } from "@/lib/connectors/notion";
import { githubConnector } from "@/lib/connectors/github";
import { confluenceConnector } from "@/lib/connectors/confluence";
import { googleDriveConnector } from "@/lib/connectors/google-drive";
import { jiraConnector } from "@/lib/connectors/jira";

const connectors: Connector[] = [
  notionConnector,
  githubConnector,
  confluenceConnector,
  googleDriveConnector,
  jiraConnector,
];

export function getConnector(id: string): Connector | undefined {
  return connectors.find((connector) => connector.id === id);
}

export function listConnectors(): string[] {
  return connectors.map((connector) => connector.id);
}
