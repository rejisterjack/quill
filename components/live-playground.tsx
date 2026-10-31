"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useAuth } from "@/lib/auth-context";

export function LivePlayground() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !question.trim()) return;
    setBusy(true);
    setAnswer("");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question, workspaceId: user.activeWorkspaceId }),
    });
    if (!response.ok || !response.body) {
      setAnswer("The knowledge base did not answer. Sign in as an admin and upload a document first.");
      setBusy(false);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const block of events) {
        if (!block.includes("event: token")) continue;
        const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const parsed = JSON.parse(dataLine.slice(5).trim());
        text += parsed.token || "";
        setAnswer(text);
      }
    }
    setBusy(false);
  }

  if (!user) {
    return (
      <p className="text-xs text-default-500 mt-3">
        Sample, not your knowledge base. Sign in to ask your own documents.
      </p>
    );
  }

  return (
    <form onSubmit={ask} className="mt-4 space-y-2 text-left">
      <input
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask your knowledge base"
        className="w-full rounded-xl border px-3 py-2 text-sm"
      />
      <Button type="submit" variant="primary" isDisabled={busy}>
        {busy ? "Asking…" : "Ask live"}
      </Button>
      {answer && <p className="text-sm whitespace-pre-wrap">{answer}</p>}
    </form>
  );
}
