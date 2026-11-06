"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type SamlMetadata = {
  protocol?: string;
  entryPoint?: string;
  issuer?: string;
  cert?: string;
};

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ssoMetadata?: SamlMetadata | null;
  scimTokenHash?: string | null;
  targetDatabaseUrl?: string | null;
  neonProjectId?: string | null;
};

export default function EnterpriseAdminPage() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [entryPoint, setEntryPoint] = useState("");
  const [issuer, setIssuer] = useState("");
  const [cert, setCert] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => {
        const rows = (data.workspaces || []) as WorkspaceRow[];
        const current =
          rows.find((row) => row.id === user?.activeWorkspaceId) || rows[0] || null;
        setWorkspace(current);
        const meta = current?.ssoMetadata;
        setEntryPoint(meta?.entryPoint || "");
        setIssuer(meta?.issuer || "");
        setCert(meta?.cert || "");
      })
      .catch(() => setMessage("Could not load workspace."));
  }, [user?.activeWorkspaceId]);

  async function saveSso() {
    if (!workspace) return;
    const res = await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssoMetadata: { protocol: "saml", entryPoint, issuer, cert },
      }),
    });
    setMessage(res.ok ? "SAML settings saved." : "Save failed.");
  }

  async function issueScim() {
    if (!workspace) return;
    const res = await fetch(`/api/workspaces/${workspace.id}/scim-token`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Could not issue a SCIM token.");
      return;
    }
    setToken(data.token);
    setWorkspace({ ...workspace, scimTokenHash: "issued" });
    setMessage("SCIM token issued. Copy it now; it is not shown again.");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Enterprise</h1>
        <p className="mt-1 text-sm text-zinc-400">
          SAML sign-in, a SCIM bearer for /api/scim/v2, and whether chat and documents use a Neon tenant database.
        </p>
      </div>
      {message && <p className="text-sm text-zinc-300">{message}</p>}
      {!workspace ? (
        <p className="text-sm text-zinc-500">No workspace.</p>
      ) : (
        <>
          <section className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
            <p>Workspace: {workspace.name}</p>
            <p>Plan: {workspace.plan}</p>
            <p>Tenant database: {workspace.targetDatabaseUrl ? "bound" : "shared control database"}</p>
            <p>Neon project: {workspace.neonProjectId || "not provisioned"}</p>
            <p>SCIM token: {workspace.scimTokenHash ? "issued" : "not issued"}</p>
          </section>
          <section className="space-y-3">
            <label className="block text-sm text-zinc-300">
              SSO entry point
              <input
                value={entryPoint}
                onChange={(event) => setEntryPoint(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm text-zinc-100"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              IdP issuer
              <input
                value={issuer}
                onChange={(event) => setIssuer(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-sm text-zinc-100"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              IdP signing certificate
              <textarea
                value={cert}
                onChange={(event) => setCert(event.target.value)}
                rows={6}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-100"
              />
            </label>
            <button onClick={saveSso} className="rounded-lg bg-white px-3 py-2 text-sm text-black">
              Save SAML
            </button>
            <p className="text-xs text-zinc-500">
              Login: /api/auth/saml/{workspace.slug}. ACS: /api/auth/saml/{workspace.slug}/acs. SCIM base: /api/scim/v2.
            </p>
            <button onClick={issueScim} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white">
              Issue SCIM token
            </button>
            {token && <p className="break-all font-mono text-xs text-zinc-200">{token}</p>}
          </section>
        </>
      )}
    </div>
  );
}
