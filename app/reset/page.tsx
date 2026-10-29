"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.get("token"), password }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Password updated. You can sign in." : data.error || "Reset failed");
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto py-16 space-y-4">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full border rounded-xl px-3 py-2"
        placeholder="New password"
      />
      <Button type="submit" variant="primary">Update password</Button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
