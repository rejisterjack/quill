"use client";

import React, { useEffect, useState } from "react";

type Evidence = {
  attestation?: string;
  auditChainOk?: boolean;
  controls?: Array<{ id: string; name: string; evidence: string }>;
  baaWorksheet?: { title: string; status: string; safeguards: string[] };
};

export default function CompliancePage() {
  const [packet, setPacket] = useState<Evidence | null>(null);

  useEffect(() => {
    fetch("/api/admin/compliance")
      .then((res) => res.json())
      .then(setPacket)
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Compliance evidence</h1>
      <p className="text-sm text-default-500">{packet?.attestation}</p>
      <p className="text-sm">Audit chain {packet?.auditChainOk ? "verifies" : "does not verify"}.</p>
      <ul className="space-y-2 text-sm">
        {(packet?.controls || []).map((control) => (
          <li key={control.id}>
            <strong>{control.id} {control.name}.</strong> {control.evidence}
          </li>
        ))}
      </ul>
      {packet?.baaWorksheet && (
        <div className="text-sm">
          <p className="font-semibold">{packet.baaWorksheet.title} ({packet.baaWorksheet.status})</p>
          <p>{packet.baaWorksheet.safeguards.join(". ")}.</p>
        </div>
      )}
    </div>
  );
}
