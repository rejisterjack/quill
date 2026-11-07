"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useAuth } from "@/lib/auth-context";

type TuningJob = {
  id: string;
  status: string;
  model: string | null;
  providerJobId: string | null;
  error: string | null;
};

export default function BillingPage() {
  const { activeWorkspace } = useAuth();
  const [message, setMessage] = useState("");
  const [connectionUri, setConnectionUri] = useState("");
  const [jobs, setJobs] = useState<TuningJob[]>([]);
  const [chatModel, setChatModel] = useState("");
  const [limitsLabel, setLimitsLabel] = useState("Free: 3 seats. Pro: 10 seats, 100,000 queries / month.");

  useEffect(() => {
    fetch("/api/billing/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.limits?.pro) {
          setLimitsLabel(
            `Free: ${data.limits.free.seats} seats. Pro: ${data.limits.pro.seats} seats, ${Number(
              data.limits.pro.monthlyQueries,
            ).toLocaleString()} queries / month.`,
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    fetch(`/api/workspaces/${activeWorkspace.id}/tuning`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        if (data.chatModel) setChatModel(data.chatModel);
      })
      .catch(() => {});
  }, [activeWorkspace]);

  async function checkout() {
    if (!activeWorkspace) return;
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: activeWorkspace.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setMessage(data.error || "Checkout unavailable — join the waitlist on /pricing if Stripe is unset");
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
    const res = await fetch(`/api/workspaces/${activeWorkspace.id}/tuning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setMessage(res.ok ? `Tuning job ${data.job?.status}` : data.error || "Tuning failed");
    if (data.job) setJobs((prev) => [data.job, ...prev]);
  }

  async function refreshJobs() {
    if (!activeWorkspace) return;
    const res = await fetch(`/api/workspaces/${activeWorkspace.id}/tuning`);
    const data = await res.json();
    setJobs(data.jobs || []);
    if (data.chatModel) setChatModel(data.chatModel);
    setMessage("Tuning jobs refreshed");
  }

  async function applyModel(model: string) {
    if (!activeWorkspace || !model) return;
    const res = await fetch(`/api/workspaces/${activeWorkspace.id}/tuning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply", model }),
    });
    const data = await res.json();
    if (res.ok) {
      setChatModel(data.chatModel);
      setMessage(`chatModel set to ${data.chatModel}`);
    } else {
      setMessage(data.error || "Apply failed");
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Plan</h1>
      <p className="text-sm text-default-500">
        {limitsLabel} The Stripe webhook sets the plan. Managed Postgres is a Neon project for a Pro workspace; the
        connection URI is stored encrypted as targetDatabaseUrl for migrate-to-cloud.
      </p>
      {chatModel && (
        <p className="text-xs text-default-500">
          Active chat model: <span className="font-mono text-foreground">{chatModel}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onPress={checkout}>
          Upgrade to Pro
        </Button>
        <Button variant="secondary" onPress={provision}>
          Provision Neon
        </Button>
        <Button variant="secondary" onPress={tune}>
          Start fine-tune
        </Button>
        <Button variant="ghost" onPress={refreshJobs}>
          Refresh jobs
        </Button>
      </div>
      {jobs.length > 0 && (
        <ul className="space-y-2 text-sm border rounded-xl p-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {job.status}
                {job.model ? ` · ${job.model}` : ""}
                {job.error ? ` · ${job.error}` : ""}
              </span>
              {job.model && (job.status || "").toLowerCase() === "succeeded" && (
                <Button size="sm" variant="secondary" onPress={() => applyModel(job.model!)}>
                  Use as chat model
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {message && <p className="text-sm">{message}</p>}
      {connectionUri && (
        <p className="text-xs break-all">
          Connection string, shown once: {connectionUri}
        </p>
      )}
    </div>
  );
}
