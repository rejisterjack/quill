export interface ConnectorDocument {
  externalId: string;
  title: string;
  text: string;
  sourceUrl?: string;
}

export interface Connector {
  id: string;
  listUpdates(config: Record<string, string>): Promise<ConnectorDocument[]>;
  fetchDocument(config: Record<string, string>, externalId: string): Promise<ConnectorDocument>;
}
