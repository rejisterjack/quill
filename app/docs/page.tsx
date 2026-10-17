"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, Chip } from "@heroui/react";
import {
  BookOpenIcon,
  CommandLineIcon,
  KeyIcon,
  CircleStackIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"quickstart" | "env" | "api" | "models">("quickstart");
  const [copied, setCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <BookOpenIcon className="w-4 h-4" />
          <span>Documentation & Technical Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Developer Reference & Architecture
        </h1>
        <p className="text-sm sm:text-base text-default-500 max-w-2xl leading-relaxed">
          Everything you need to configure, deploy, customize, and extend your self-hosted AI knowledge base.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-default-200/50 dark:border-default-100/30 pb-3">
        <button
          onClick={() => setActiveTab("quickstart")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "quickstart"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/20"
          }`}
        >
          <CommandLineIcon className="w-4 h-4" />
          <span>5-Minute Quickstart</span>
        </button>
        <button
          onClick={() => setActiveTab("env")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "env"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/20"
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          <span>Environment Variables</span>
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "api"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/20"
          }`}
        >
          <CodeBracketIcon className="w-4 h-4" />
          <span>API Routes Reference</span>
        </button>
        <button
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "models"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/20"
          }`}
        >
          <CpuChipIcon className="w-4 h-4" />
          <span>Model Cascade & pgvector</span>
        </button>
      </div>

      {/* Quickstart Tab */}
      {activeTab === "quickstart" && (
        <div className="space-y-6">
          <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-foreground">Step-by-Step Setup</h2>
            <div className="space-y-4 text-xs sm:text-sm text-default-600 dark:text-default-300">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Clone and Install Dependencies</p>
                  <p className="text-xs text-default-400">Works with Bun (recommended) or Node 20+.</p>
                  <pre className="p-3 rounded-xl bg-black/50 text-default-200 font-mono text-xs overflow-x-auto">
                    <code>git clone https://github.com/rejisterjack/rag-starter-kit.git&#10;cd rag-starter-kit&#10;bun install</code>
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Configure Environment</p>
                  <p className="text-xs text-default-400">Copy the sample file and supply your PostgreSQL connection string and free OpenRouter API key.</p>
                  <pre className="p-3 rounded-xl bg-black/50 text-default-200 font-mono text-xs overflow-x-auto">
                    <code>cp .env.example .env</code>
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Sync Schema & Seed Admin</p>
                  <p className="text-xs text-default-400">Pushes the Prisma schema to your PostgreSQL database with pgvector enabled.</p>
                  <pre className="p-3 rounded-xl bg-black/50 text-default-200 font-mono text-xs overflow-x-auto">
                    <code>bun prisma db push</code>
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Start the Server</p>
                  <pre className="p-3 rounded-xl bg-black/50 text-default-200 font-mono text-xs overflow-x-auto">
                    <code>bun dev --port 7392</code>
                  </pre>
                  <p className="text-xs text-default-400">Open <code className="text-primary">http://localhost:7392</code> in your browser.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Environment Variables Tab */}
      {activeTab === "env" && (
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-foreground">Required Environment Variables</h2>
          <div className="divide-y divide-default-200/50 dark:divide-default-100/30 text-xs sm:text-sm">
            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-primary font-mono font-bold">DATABASE_URL</code>
                <Chip size="sm" color="danger" variant="soft">Required</Chip>
              </div>
              <p className="text-default-500">PostgreSQL connection string with pgvector extension enabled (e.g. from Neon, Supabase, or self-hosted Postgres).</p>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-primary font-mono font-bold">OPENROUTER_API_KEY</code>
                <Chip size="sm" color="danger" variant="soft">Required</Chip>
              </div>
              <p className="text-default-500">Your OpenRouter API key. Free models require $0 balance and no credit card.</p>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-primary font-mono font-bold">NEXT_PUBLIC_APP_URL</code>
                <Chip size="sm" color="default" variant="soft">Optional</Chip>
              </div>
              <p className="text-default-500">Application URL for generating embed widget iframe codes. Defaults to <code className="text-primary">http://localhost:7392</code>.</p>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-primary font-mono font-bold">JWT_SECRET</code>
                <Chip size="sm" color="default" variant="soft">Optional</Chip>
              </div>
              <p className="text-default-500">Secret key used for signing session JWT authentication tokens.</p>
            </div>
          </div>
        </Card>
      )}

      {/* API Reference Tab */}
      {activeTab === "api" && (
        <div className="space-y-4">
          <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="success" variant="soft" className="font-mono font-bold">POST</Chip>
              <code className="font-mono font-bold text-foreground">/api/chat</code>
            </div>
            <p className="text-xs text-default-500">Real-time Server-Sent Events (SSE) chat endpoint with pgvector cosine retrieval and source citations.</p>
            <div className="p-3 rounded-xl bg-black/50 text-xs font-mono text-default-300">
              <div>// Request Payload</div>
              <div>{`{ "message": "What is our cancellation policy?", "chatId": "opt-id" }`}</div>
            </div>
          </Card>

          <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="success" variant="soft" className="font-mono font-bold">POST</Chip>
              <code className="font-mono font-bold text-foreground">/api/documents/upload</code>
            </div>
            <p className="text-xs text-default-500">Uploads and processes documents (PDF, DOCX, Markdown, Text, or Web URLs) with automatic sliding-window chunking and pgvector embedding.</p>
          </Card>

          <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="accent" variant="soft" className="font-mono font-bold">GET</Chip>
              <code className="font-mono font-bold text-foreground">/api/documents/[id]/chunks</code>
            </div>
            <p className="text-xs text-default-500">Inspects underlying vector chunks and similarity indices for a specific document.</p>
          </Card>
        </div>
      )}

      {/* Models & pgvector Tab */}
      {activeTab === "models" && (
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-foreground">Active Model Cascade & Distance Metrics</h2>
          <div className="space-y-3 text-xs sm:text-sm text-default-600 dark:text-default-300">
            <div className="p-3.5 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
              <p className="font-bold text-foreground">Primary Chat Model: <code className="text-primary">nvidia/nemotron-3.5-lightning:free</code></p>
              <p className="text-xs text-default-500">Ultra-fast inference with strict grounding on retrieved knowledge base context.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
              <p className="font-bold text-foreground">Embeddings Model: <code className="text-primary">liquid/lfm-2.5-embedding-350m:free</code></p>
              <p className="text-xs text-default-500">Generates 1024-dimensional dense vectors stored in PostgreSQL via pgvector.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
              <p className="font-bold text-foreground">Vector Distance Metric: <code className="text-success-500">Cosine Distance (&lt;=&gt;)</code></p>
              <p className="text-xs text-default-500">Calculates cosine similarity between document vectors and user query vector directly inside PostgreSQL.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Bottom CTA */}
      <div className="flex justify-between items-center p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div>
          <h3 className="font-bold text-foreground">Ready to test it live?</h3>
          <p className="text-xs text-default-500">Try the interactive streaming chatbot or upload your first PDF.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button size="sm" variant="primary" className="font-bold">
              Launch Chat
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="sm" variant="secondary" className="font-semibold">
              Admin Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
