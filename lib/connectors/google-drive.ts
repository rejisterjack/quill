import type { Connector } from "@/lib/connectors/types";

export const googleDriveConnector: Connector = {
  id: "google-drive",
  async listUpdates(config) {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(config.query || "mimeType='text/plain'")}&pageSize=10`,
      { headers: { Authorization: `Bearer ${config.token}` } },
    );
    if (!response.ok) throw new Error(`Drive ${response.status}`);
    const data = await response.json();
    return Promise.all(
      ((data.files || []) as Array<{ id: string }>).map((file) => this.fetchDocument(config, file.id)),
    );
  },
  async fetchDocument(config, externalId) {
    const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${externalId}?fields=name,webViewLink`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    const file = await meta.json();
    const body = await fetch(`https://www.googleapis.com/drive/v3/files/${externalId}?alt=media`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    return {
      externalId,
      title: file.name || "Drive file",
      text: await body.text(),
      sourceUrl: file.webViewLink,
    };
  },
};
