"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Chip,
} from "@heroui/react";
import { useAuth } from "@/lib/auth-context";
import {
  DocumentTextIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
  SparklesIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const { user, activeWorkspace } = useAuth();
  const [chatModel, setChatModel] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [embeddingDimensions, setEmbeddingDimensions] = useState("1024");
  const [stats, setStats] = useState({
    documents: 0,
    chunks: 0,
    chats: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [docsRes, chatsRes, statsRes] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/chats"),
          fetch("/api/admin/stats"),
        ]);

        const docsData = await docsRes.json();
        const chatsData = await chatsRes.json();
        const statsData = await statsRes.json();

        const docs = docsData.documents || [];
        const totalChunks = docs.reduce(
          (acc: number, d: any) => acc + (d.chunkCount || 0),
          0
        );

        setStats({
          documents: docs.length,
          chunks: totalChunks,
          chats: (chatsData.chats || []).length,
          users: statsData.users || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-default-200/60 dark:border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Knowledge Base Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-default-500 max-w-xl leading-relaxed">
            Manage vector embeddings, inspect semantic chunks, monitor retrieval latency, and test live chat grounding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/documents">
            <Button
              variant="primary"
              className="font-bold text-xs h-10 px-4 shadow-md shadow-primary/25 rounded-xl flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Documents</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant="secondary"
              className="font-semibold text-xs h-10 px-4 border border-default-200/60 dark:border-white/10 rounded-xl flex items-center gap-1.5"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary" />
              <span>Test Chat</span>
            </Button>
          </Link>
        </div>
      </div>

      <form
        className="flex flex-wrap gap-2 items-end"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!activeWorkspace) return;
          await fetch(`/api/workspaces/${activeWorkspace.id}/models`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatModel,
              embeddingModel,
              embeddingDimensions: Number(embeddingDimensions),
            }),
          });
        }}
      >
        <input className="border rounded-lg px-2 py-1 text-xs" placeholder="Chat model" value={chatModel} onChange={(event) => setChatModel(event.target.value)} />
        <input className="border rounded-lg px-2 py-1 text-xs" placeholder="Embedding model" value={embeddingModel} onChange={(event) => setEmbeddingModel(event.target.value)} />
        <input className="border rounded-lg px-2 py-1 text-xs w-24" placeholder="Dimensions" value={embeddingDimensions} onChange={(event) => setEmbeddingDimensions(event.target.value)} />
        <Button type="submit" size="sm" variant="secondary">Save models</Button>
      </form>

      {/* 2. Four Elevated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-4.5 rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 flex justify-between items-center text-default-500 text-xs font-semibold">
            <span className="tracking-wide">INDEXED DOCUMENTS</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DocumentTextIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{stats.documents}</div>
            <div className="flex items-center gap-1 text-[11px] text-success-500 font-semibold mt-1">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Active in pgvector</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-4.5 rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 flex justify-between items-center text-default-500 text-xs font-semibold">
            <span className="tracking-wide">SEMANTIC CHUNKS</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Squares2X2Icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{stats.chunks}</div>
            <div className="text-[11px] text-primary font-medium mt-1">
              1024-dimension float arrays
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-4.5 rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 flex justify-between items-center text-default-500 text-xs font-semibold">
            <span className="tracking-wide">TOTAL SESSIONS</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{stats.chats}</div>
            <div className="text-[11px] text-default-400 font-medium mt-1">
              User conversations grounded
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-4.5 rounded-2xl shadow-md hover:border-success-500/40 transition-all">
          <CardHeader className="p-0 flex justify-between items-center text-default-500 text-xs font-semibold">
            <span className="tracking-wide">INFRASTRUCTURE</span>
            <div className="w-7 h-7 rounded-lg bg-success-500/10 flex items-center justify-center text-success-500">
              <CircleStackIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-xl font-bold flex items-center gap-1.5 text-success-600 dark:text-success-400">
              <span>Healthy</span>
            </div>
            <div className="text-[11px] text-default-400 mt-1">
              PostgreSQL + pgvector ready
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Two Column Architecture & Config Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture Flow */}
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-5 rounded-2xl space-y-4 shadow-lg">
          <CardHeader className="p-0 font-bold text-sm sm:text-base flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-5 h-5 text-primary" />
            <span>End-to-End Pipeline Workflow</span>
          </CardHeader>
          <CardContent className="p-0 space-y-3.5 text-xs text-default-600 dark:text-default-300">
            <div className="flex gap-3 items-start p-2.5 rounded-xl bg-default-100/40 dark:bg-default-50/10 border border-default-200/40 dark:border-default-100/20">
              <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">Ingest Documents</p>
                <p className="text-[11px] text-default-400 mt-0.5">
                  Upload PDFs, Word DOCX files, Markdown files, or crawl public web URLs. Text extraction is automatic.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-2.5 rounded-xl bg-default-100/40 dark:bg-default-50/10 border border-default-200/40 dark:border-default-100/20">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">Semantic Chunking & pgvector</p>
                <p className="text-[11px] text-default-400 mt-0.5">
                  Sliding-window chunker generates semantic units, calls OpenRouter free embeddings, and persists vectors directly to Neon PostgreSQL.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-2.5 rounded-xl bg-default-100/40 dark:bg-default-50/10 border border-default-200/40 dark:border-default-100/20">
              <div className="w-6 h-6 rounded-lg bg-success-500/20 text-success-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground">Grounded Chatbot with Citations</p>
                <p className="text-[11px] text-default-400 mt-0.5">
                  End users query <code className="text-primary font-mono text-xs">/chat</code> with real-time SSE token streaming and clickable source citations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Configuration Spec */}
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-5 rounded-2xl space-y-4 shadow-lg">
          <CardHeader className="p-0 font-bold text-sm sm:text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-indigo-500" />
              <span>Active Environment Spec</span>
            </div>
            <Chip size="sm" color="success" variant="soft" className="text-[10px] font-bold">
              $0.00 / month
            </Chip>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 font-medium">Database Layer</span>
              <span className="font-semibold text-foreground">Neon PostgreSQL + pgvector</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 font-medium">Vector Dimension</span>
              <span className="font-mono text-primary font-bold">1024 dims (liquid/lfm-2.5)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 font-medium">Chat Model</span>
              <span className="font-mono text-foreground">nvidia/nemotron-3.5-lightning:free</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 font-medium">Distance Metric</span>
              <span className="font-mono text-success-500 font-bold">Cosine Distance (&lt;=&gt;)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-default-400 font-medium">Web Stack</span>
              <span className="font-semibold text-foreground">Next.js 16 • React 19 • HeroUI</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embeddable Widget Snippet (Vision Core Feature) */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent backdrop-blur-xl p-5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                Embed Chatbot on Any External Site
              </h3>
            </div>
            <p className="text-xs text-default-500 mt-1">
              Drop this responsive iframe widget onto your documentation portal, client website, or internal wiki.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/embed" target="_blank">
              <Button size="sm" variant="secondary" className="text-xs font-semibold">
                Open Standalone Preview ↗
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              className="text-xs font-bold"
              onPress={() => {
                const key = window.prompt("Paste an embed API key") || "YOUR_KEY";
                const code = `<iframe src="${window.location.origin}/embed?key=${key}" width="100%" height="650" style="border:none; border-radius:16px;" allow="clipboard-write"></iframe>\n<script src="${window.location.origin}/widget.js" data-key="${key}"></script>`;
                navigator.clipboard.writeText(code);
                alert("Iframe embed snippet copied to clipboard!");
              }}
            >
              Copy Embed Code
            </Button>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-default-300 overflow-x-auto">
          <code>
            {`<iframe src="/embed" width="100%" height="650" style="border:none; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" allow="clipboard-write"></iframe>`}
          </code>
        </div>
      </Card>
    </div>
  );
}
