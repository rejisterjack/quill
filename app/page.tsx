"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, CardFooter, Chip } from "@heroui/react";
import {
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  CubeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  ArrowRightIcon,
  SparklesIcon,
  CommandLineIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface SimulationPrompt {
  id: string;
  label: string;
  query: string;
  latency: string;
  dimensions: number;
  sources: { title: string; score: string; type: string }[];
  answer: string;
}

const SAMPLE_PROMPTS: SimulationPrompt[] = [
  {
    id: "arch",
    label: "TypeScript Stack",
    query: "Why build RAG in 100% TypeScript instead of Python notebooks?",
    latency: "112ms",
    dimensions: 1024,
    sources: [
      { title: "Architecture Manifesto", score: "97.4%", type: "Markdown" },
      { title: "Production Deployment Guide", score: "93.1%", type: "PDF" },
    ],
    answer:
      "Most RAG resources are fragmented Python scripts with zero auth, no persistent sessions, and separate frontend glue code. This Starter Kit unifies your client (React 19), server APIs (Next.js 16), database ORM (Prisma 7), and vector storage (pgvector) in a single end-to-end type-safe TypeScript repository. Zero Python microservices needed.",
  },
  {
    id: "vector",
    label: "pgvector Cosine Search",
    query: "How does the pgvector similarity search work under the hood?",
    latency: "94ms",
    dimensions: 1024,
    sources: [
      { title: "Database Vector Schema", score: "98.2%", type: "SQL" },
      { title: "Neon Serverless Indexing", score: "91.8%", type: "Documentation" },
    ],
    answer:
      "Document chunks are vectorized into 1024-dimension float arrays. We store them natively in PostgreSQL using the pgvector extension and query with the cosine distance operator `<=>`. This allows standard relational joins with workspaces, user access controls, and sub-100ms index scans without costly external vector databases.",
  },
  {
    id: "cost",
    label: "$0 Recurring Cost",
    query: "How does this platform operate at $0 recurring monthly cost?",
    latency: "86ms",
    dimensions: 1024,
    sources: [
      { title: "Cost & Infrastructure Spec", score: "99.0%", type: "Spec" },
      { title: "OpenRouter Free Models", score: "95.5%", type: "API Reference" },
    ],
    answer:
      "By pairing Neon PostgreSQL's generous free serverless tier with OpenRouter's completely free embeddings and chat models (such as liquid/lfm-2.5-embedding-350m:free and mistral-7b-instruct:free), you get a production-ready RAG application that costs $0/month while you develop and test.",
  },
];

export default function Home() {
  const [activeSim, setActiveSim] = useState<SimulationPrompt>(SAMPLE_PROMPTS[0]);
  const [copied, setCopied] = useState(false);

  const copyCloneCmd = () => {
    navigator.clipboard.writeText("git clone https://github.com/rejisterjack/rag-starter-kit.git && cd rag-starter-kit && bun install && bun dev");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-6">
      {/* 1. Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Glow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold backdrop-blur-md shadow-sm shadow-primary/20 hover:border-primary/50 transition-colors">
          <SparklesIcon className="w-3.5 h-3.5 text-primary" />
          <span>Next-Gen Self-Hosted Knowledge Engine</span>
          <span className="text-default-400">•</span>
          <span className="text-success-600 dark:text-success-400 font-bold">$0 Recurring Cost</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-3xl">
          Own Your AI,{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            This Weekend.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-default-600 dark:text-default-300 max-w-2xl leading-relaxed">
          Clone the repository, index your documents (PDF, DOCX, Markdown, Text, or URLs), and deploy a production-grade AI knowledge base chatbot you own 100% — at <strong>$0 recurring cost</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Link href="/chat">
            <Button
              size="lg"
              variant="primary"
              className="font-bold px-8 h-12 shadow-xl shadow-primary/30 text-sm flex items-center gap-2.5 rounded-xl hover:scale-105 transition-all duration-200"
            >
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
              <span>Launch Chatbot</span>
            </Button>
          </Link>

          <Link href="/admin">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold px-8 h-12 text-sm flex items-center gap-2.5 rounded-xl border border-default-200 dark:border-white/10 hover:border-primary/40 transition-all duration-200"
            >
              <WrenchScrewdriverIcon className="w-5 h-5 text-default-500" />
              <span>Admin Knowledge Base</span>
            </Button>
          </Link>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-8 border-t border-default-200/50 dark:border-default-100/30">
          <div className="p-3 rounded-xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-foreground">0 ms</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">Cold Starts (Serverless)</div>
          </div>
          <div className="p-3 rounded-xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-primary">1024-dim</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">pgvector Cosine Search</div>
          </div>
          <div className="p-3 rounded-xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-foreground">100%</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">TypeScript + Prisma 7</div>
          </div>
          <div className="p-3 rounded-xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-success-500">$0.00</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">Forever Free Tier</div>
          </div>
        </div>
      </section>

      {/* 2. Interactive RAG Pipeline Simulator */}
      <section className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <Chip size="sm" color="accent" variant="soft" className="mb-2">
            Interactive Architecture Playground
          </Chip>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            See the Retrieval Pipeline in Action
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-1 max-w-lg mx-auto">
            Click any prompt below to trace how OpenRouter embeddings, PostgreSQL vector cosine indexing, and SSE generation combine.
          </p>

          {/* Prompt Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveSim(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  activeSim.id === p.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
                    : "border-default-200 dark:border-default-100/40 text-default-600 hover:border-primary/40 bg-default-50/50 dark:bg-default-50/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Pipeline Showcase Card */}
        <Card className="border border-default-200/60 dark:border-white/10 shadow-2xl bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-default-200/60 dark:border-default-100/40 flex justify-between items-center bg-default-100/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger-400" />
              <span className="w-3 h-3 rounded-full bg-warning-400" />
              <span className="w-3 h-3 rounded-full bg-success-400" />
              <span className="text-xs font-mono text-default-400 ml-2">Live RAG Retrieval Trace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-default-400">Latency: <strong className="text-success-500">{activeSim.latency}</strong></span>
              <Chip size="sm" color="success" variant="soft" className="text-[10px] font-mono">
                pgvector &lt;=&gt;
              </Chip>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* User Query */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[85%] shadow-md shadow-indigo-500/20">
                {activeSim.query}
              </div>
            </div>

            {/* 3-Step Pipeline Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-default-200/50 dark:border-white/10 bg-default-100/40 dark:bg-default-50/20 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                  <span>1. Embeddings</span>
                </div>
                <div className="font-mono text-default-700 dark:text-default-300">
                  {activeSim.dimensions} Dimensions
                </div>
                <div className="text-[11px] text-default-400">liquid/lfm-2.5-350m</div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-default-200/60 dark:sm:border-default-100/40 sm:pl-3">
                <div className="text-[10px] font-semibold text-success-500 uppercase tracking-wider flex items-center gap-1">
                  <span>2. Vector Scan</span>
                </div>
                <div className="font-mono text-default-700 dark:text-default-300">
                  Neon PostgreSQL
                </div>
                <div className="text-[11px] text-default-400">pgvector cosine match</div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-default-200/60 dark:sm:border-default-100/40 sm:pl-3">
                <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <span>3. Generation</span>
                </div>
                <div className="font-mono text-default-700 dark:text-default-300">
                  Mistral 7B Free
                </div>
                <div className="text-[11px] text-default-400">SSE Streamed Response</div>
              </div>
            </div>

            {/* Assistant Grounded Answer */}
            <div className="flex justify-start">
              <div className="bg-default-100/60 dark:bg-default-100/30 rounded-2xl rounded-tl-sm p-5 text-sm max-w-[95%] border border-default-200/60 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-default-200/50 dark:border-default-100/30">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                    <SparklesIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">Grounded Knowledge Assistant</span>
                  <span className="text-[10px] text-default-400">• Synthesized from 2 sources</span>
                </div>

                <p className="text-default-700 dark:text-default-200 leading-relaxed text-sm">
                  {activeSim.answer}
                </p>

                {/* Citation Chips */}
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-default-400 font-semibold">Citations:</span>
                  {activeSim.sources.map((src, idx) => (
                    <Chip
                      key={idx}
                      size="sm"
                      variant="soft"
                      color="accent"
                      className="text-xs border border-primary/20 flex items-center gap-1"
                    >
                      <DocumentTextIcon className="w-3 h-3 inline mr-1 text-primary" />
                      <span>{src.title}</span>
                      <span className="font-mono text-[10px] text-primary-600 dark:text-primary-300 ml-1">
                        ({src.score})
                      </span>
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. The Two Modes Bento Cards */}
      <section className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <Chip size="sm" color="default" variant="soft" className="mb-2">
            Flexible Deployment Paths
          </Chip>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Two Modes, One Codebase</h2>
          <p className="text-xs sm:text-sm text-default-500 mt-1 max-w-lg mx-auto">
            Engineered for both non-developers wanting an instant self-hosted AI and developers building custom client solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1 */}
          <Card className="p-6 border border-default-200/60 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-default-100/40 dark:from-default-50/20 to-transparent hover:border-success-500/30 transition-all duration-300">
            <div className="absolute top-4 right-4">
              <Chip size="sm" color="success" variant="soft" className="font-semibold">
                Mode 1: Non-Dev / Turnkey
              </Chip>
            </div>
            <CardHeader className="p-0 flex flex-col items-start gap-1">
              <div className="w-12 h-12 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-500 mb-2 shadow-inner">
                <RocketLaunchIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Deploy As-Is</h3>
              <p className="text-xs text-default-500">The "Ready to Use" Turnkey Path</p>
            </CardHeader>
            <CardContent className="p-0 py-4 text-sm text-default-600 dark:text-default-300 space-y-3.5">
              <p className="text-xs sm:text-sm leading-relaxed">
                Connect your database URL, deploy with one click to Vercel or your own VPS, and begin indexing documents through the admin web dashboard.
              </p>
              <ul className="text-xs space-y-2.5 text-default-500">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>End users chat at:</strong> <code className="text-primary font-mono bg-default-100 dark:bg-default-50 px-1 py-0.5 rounded">/chat</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>You manage knowledge at:</strong> <code className="text-primary font-mono bg-default-100 dark:bg-default-50 px-1 py-0.5 rounded">/admin</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span>Zero code changes needed. Production live in under 20 minutes.</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-0 pt-2">
              <Link href="/chat" className="w-full">
                <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 border border-default-200 dark:border-white/10 h-10">
                  <span>Try User Chatbot</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Mode 2 */}
          <Card className="p-6 border border-default-200/60 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-default-100/40 dark:from-default-50/20 to-transparent hover:border-primary/40 transition-all duration-300">
            <div className="absolute top-4 right-4">
              <Chip size="sm" color="accent" variant="soft" className="font-semibold">
                Mode 2: Developers
              </Chip>
            </div>
            <CardHeader className="p-0 flex flex-col items-start gap-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                <CubeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Starter Kit</h3>
              <p className="text-xs text-default-500">The "Fork & Customise" Foundation</p>
            </CardHeader>
            <CardContent className="p-0 py-4 text-sm text-default-600 dark:text-default-300 space-y-3.5">
              <p className="text-xs sm:text-sm leading-relaxed">
                Study a clean, production TypeScript RAG codebase. Swap OpenRouter for OpenAI or Anthropic, customise chunking rules, and embed directly into client applications.
              </p>
              
              {/* Terminal Code Snippet */}
              <div className="relative group bg-default-900 text-default-100 p-3.5 rounded-xl font-mono text-xs border border-default-800 space-y-1">
                <button
                  type="button"
                  onClick={copyCloneCmd}
                  className="absolute top-2.5 right-2.5 text-default-400 hover:text-white p-1 rounded hover:bg-default-800 transition-colors"
                  title="Copy command"
                >
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-success-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </button>
                <div className="text-default-400 select-none"># Clone & start development</div>
                <div><span className="text-primary font-bold">$</span> git clone https://github.com/rejisterjack/rag-starter-kit.git</div>
                <div><span className="text-primary font-bold">$</span> bun install && bun dev</div>
              </div>
            </CardContent>
            <CardFooter className="p-0 pt-2">
              <Link href="/admin/documents" className="w-full">
                <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 border border-default-200 dark:border-white/10 h-10">
                  <span>Explore Knowledge Pipeline</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 4. Architecture Pillars */}
      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-primary/40 transition-all duration-200">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CpuChipIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">100% TypeScript</h4>
                <p className="text-[11px] text-default-400 font-normal">Unified Runtime</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              No Python virtual environments, no Docker orchestrations, no mixed-language glue code. One unified language for your client, API, database, and vector pipeline.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-success-500/40 transition-all duration-200">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-500">
                <CurrencyDollarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">$0 to Run by Default</h4>
                <p className="text-[11px] text-default-400 font-normal">Zero Recurring Bills</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Free forever for development and light production using OpenRouter free models and Neon PostgreSQL free tier. No credit card required to deploy.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-warning-500/40 transition-all duration-200">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Enterprise Guardrails</h4>
                <p className="text-[11px] text-default-400 font-normal">Production Hardened</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Includes multi-tenant workspaces, role-based access, tamper-evident audit logging, rate limiting, and clickable source citations on every answer.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
