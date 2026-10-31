"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const [message, setMessage] = useState("");

  async function accept() {
    const res = await fetch(`/api/invites/${params.token}`, { method: "POST" });
    const data = await res.json();
    setMessage(res.ok ? "You joined the workspace." : data.error || "Invite failed");
  }

  return (
    <div className="max-w-md mx-auto py-16 space-y-4">
      <h1 className="text-2xl font-bold">Workspace invite</h1>
      <Button variant="primary" onPress={accept}>Accept invite</Button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
