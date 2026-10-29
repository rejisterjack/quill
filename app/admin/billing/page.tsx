"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useAuth } from "@/lib/auth-context";

export default function BillingPage() {
  const { activeWorkspace } = useAuth();
  const [message, setMessage] = useState("");
  const [connectionUri, setConnectionUri] = useState("");

  async function checkout() {
    if (!activeWorkspace) return;
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: activeWorkspace.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setMessage(data.error || "Checkout unavailable");
  }

  async function provision() {
    if (!activeWorkspace) return;
    const res = await fetch(`/api/workspaces/${activeWorkspace.id}/hosting`, { method: "POST" });
    const data = await res.json();
    if (data.connectionUri) setConnectionUri(data.connectionUri);
    setMessage(res.ok ? `Neon project ${data.projectId}` : data.error || "Provisioning failed");
  }

  async function tune() {
    if (!activeWorkspace) return;
    const res = await fetch(`/api/workspaces/${activeWorkspace.id}/tuning`, { method: "POST" });
    const data = await res.json();
    setMessage(res.ok ? `Tuning job ${data.job?.status}` : data.error || "Tuning failed");
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Plan</h1>
      <p className="text-sm text-default-500">
        Free includes 1 workspace and 3 seats. Pro is 10 workspaces, 10 seats, and 100,000 queries a month.
        The Stripe webhook sets the plan. Managed Postgres is a Neon project for a Pro workspace.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onPress={checkout}>Upgrade to Pro</Button>
        <Button variant="secondary" onPress={provision}>Provision Neon</Button>
        <Button variant="secondary" onPress={tune}>Start fine-tune</Button>
      </div>
      {message && <p className="text-sm">{message}</p>}
      {connectionUri && (
        <p className="text-xs break-all">
          Connection string, shown once: {connectionUri}
        </p>
      )}
    </div>
  );
}
