"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/connectors")
      .then((res) => res.json())
      .then((data) => setConnectors(data.connectors || []));
  }, []);

  async function sync(connector: string) {
    const config: Record<string, string> = {};
    if (connector === "notion") {
      config.databaseId = window.prompt("Notion database id") || "";
    }
    if (connector === "github") {
      config.repo = window.prompt("GitHub owner/repo") || "";
    }
    const res = await fetch("/api/connectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connector, config }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Queued ${data.created?.length || 0} documents` : data.error || "Sync failed");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Connectors</h1>
      <ul className="space-y-2">
        {connectors.map((connector) => (
          <li key={connector} className="flex items-center justify-between border rounded-xl px-3 py-2">
            <span>{connector}</span>
            <Button size="sm" variant="primary" onPress={() => sync(connector)}>Sync</Button>
          </li>
        ))}
      </ul>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
