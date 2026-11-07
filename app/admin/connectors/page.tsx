"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";

type ConnectorId = string;

const CONFIG_FIELDS: Record<string, Array<{ key: string; label: string; placeholder: string }>> = {
  notion: [{ key: "databaseId", label: "Database ID", placeholder: "Notion database id" }],
  github: [{ key: "repo", label: "Repository", placeholder: "owner/repo" }],
  confluence: [
    { key: "baseUrl", label: "Base URL", placeholder: "https://your-domain.atlassian.net" },
    { key: "spaceId", label: "Space ID", placeholder: "Space id" },
    { key: "email", label: "Email", placeholder: "atlassian account email" },
    { key: "token", label: "API token", placeholder: "Atlassian API token" },
  ],
  "google-drive": [
    { key: "token", label: "OAuth access token", placeholder: "ya29...." },
    { key: "query", label: "Drive query", placeholder: "mimeType='text/plain'" },
  ],
  jira: [
    { key: "baseUrl", label: "Base URL", placeholder: "https://your-domain.atlassian.net" },
    { key: "email", label: "Email", placeholder: "atlassian account email" },
    { key: "token", label: "API token", placeholder: "Atlassian API token" },
    { key: "jql", label: "JQL", placeholder: "order by updated DESC" },
  ],
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorId[]>([]);
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/connectors")
      .then((res) => res.json())
      .then((data) => setConnectors(data.connectors || []));
  }, []);

  function setField(connector: string, key: string, value: string) {
    setConfigs((prev) => ({
      ...prev,
      [connector]: { ...(prev[connector] || {}), [key]: value },
    }));
  }

  async function sync(connector: string) {
    const fields = CONFIG_FIELDS[connector] || [];
    const config = { ...(configs[connector] || {}) };
    if (fields.length === 0) {
      setMessage(`No config fields defined for ${connector}`);
      return;
    }
    setBusy(connector);
    const res = await fetch("/api/connectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connector, config }),
    });
    const data = await res.json();
    setBusy(null);
    setMessage(res.ok ? `Queued ${data.created?.length || 0} documents` : data.error || "Sync failed");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Connectors</h1>
      <p className="text-sm text-default-500">
        Configure Notion, GitHub, Confluence, Google Drive, or Jira, then sync into the workspace knowledge base.
      </p>
      <ul className="space-y-4">
        {connectors.map((connector) => {
          const fields = CONFIG_FIELDS[connector] || [];
          return (
            <li key={connector} className="border rounded-xl px-3 py-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold capitalize">{connector.replace("-", " ")}</span>
                <Button size="sm" variant="primary" isDisabled={busy === connector} onPress={() => sync(connector)}>
                  {busy === connector ? "Syncing…" : "Sync"}
                </Button>
              </div>
              {fields.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label key={field.key} className="text-xs space-y-1">
                      <span className="text-default-500">{field.label}</span>
                      <input
                        className="w-full border rounded-lg px-2 py-1.5 text-xs"
                        placeholder={field.placeholder}
                        type={field.key === "token" ? "password" : "text"}
                        value={configs[connector]?.[field.key] || ""}
                        onChange={(event) => setField(connector, field.key, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
