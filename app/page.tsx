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
  XCircleIcon,
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
  ChevronDownIcon,
  ChevronUpIcon,
  UsersIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LifebuoyIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  CodeBracketIcon,
  PlayCircleIcon,
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
    id: "support",
    label: "Support SLA",
    query: "What is our customer refund policy and SLA for enterprise plan cancellations?",
    latency: "108ms",
    dimensions: 1024,
    sources: [
      { title: "Customer Terms of Service §4.2", score: "98.4%", type: "PDF" },
      { title: "Enterprise Billing SLA Policy", score: "94.7%", type: "Markdown" },
    ],
    answer:
      "Enterprise customers are entitled to a full pro-rated refund within the first 30 days of annual contract execution. Cancellation requests submitted through the admin billing portal are processed within 2 business days, with remaining credits returned to the original payment method.",
  },
  {
    id: "arch",
    label: "TypeScript Stack",
    query: "Why build RAG in 100% TypeScript instead of Python notebooks?",
    latency: "94ms",
    dimensions: 1024,
    sources: [
      { title: "Architecture Manifesto", score: "99.1%", type: "Markdown" },
      { title: "Production Deployment Guide", score: "95.2%", type: "DOCX" },
    ],
    answer:
      "Most RAG resources are fragmented Python Jupyter notebooks with zero auth, no persistent sessions, and separate frontend glue code. This Starter Kit unifies your client (React 19), server APIs (Next.js 16), database ORM (Prisma 7), and vector storage (pgvector) in a single end-to-end type-safe TypeScript repository. Zero Python microservices needed.",
  },
  {
    id: "vector",
    label: "pgvector Cosine Search",
    query: "How does the pgvector similarity search work under the hood?",
    latency: "82ms",
    dimensions: 1024,
    sources: [
      { title: "Database Vector Schema", score: "98.9%", type: "SQL" },
      { title: "Neon Serverless Indexing", score: "92.5%", type: "Documentation" },
    ],
    answer:
      "Document chunks are vectorized into 1024-dimension float arrays. We store them natively in PostgreSQL using the pgvector extension and query with the cosine distance operator `<=>`. This allows standard relational joins with workspaces, user access controls, and sub-100ms index scans without costly external vector databases.",
  },
  {
    id: "cost",
    label: "$0 Recurring Cost",
    query: "How does this platform operate at $0 recurring monthly cost?",
    latency: "76ms",
    dimensions: 1024,
    sources: [
      { title: "Cost & Infrastructure Spec", score: "99.5%", type: "Spec" },
      { title: "OpenRouter Free Models", score: "96.1%", type: "API Reference" },
    ],
    answer:
      "By pairing Neon PostgreSQL's generous free serverless tier with OpenRouter's completely free embeddings (liquid/lfm-2.5-embedding-350m:free) and chat models (nvidia/nemotron-3.5-lightning:free), you get a production-ready RAG application that costs $0.00/month while you develop, test, and run light production.",
  },
];

interface Persona {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  painPoint: string;
  solution: string;
  impactMetric: string;
  impactLabel: string;
  testimonial: string;
}

const PERSONAS: Persona[] = [
  {
    id: "developer",
    title: "The TypeScript Developer",
    subtitle: "Needs to ship a knowledge bot without Python glue code",
    icon: CodeBracketIcon,
    tag: "Primary Builder",
    painPoint:
      "Asked to add an AI chatbot to a Next.js product or client project, but every tutorial is in Python (LangChain, LlamaIndex). They don't want to spin up Python microservices or Docker clusters just to do RAG.",
    solution:
      "A 100% pure TypeScript codebase. Same language for UI, APIs, Prisma ORM, and pgvector cosine queries. Clone, customize in a weekend, and deploy without leaving the Node/Bun ecosystem.",
    impactMetric: "3 Weeks → 1 Weekend",
    impactLabel: "Development time cut",
    testimonial:
      "I was dreading writing Python glue code for our Next.js app. With this kit, I had our docs indexed and a streaming bot live on Vercel by Sunday afternoon.",
  },
  {
    id: "founder",
    title: "The SaaS Founder & Support Lead",
    subtitle: "Drowning in repetitive tickets already answered in docs",
    icon: LifebuoyIcon,
    tag: "Operational ROI",
    painPoint:
      "The support inbox gets 200 tickets a week. 140 of them are questions already answered in the knowledge base. Support reps are burnt out copying and pasting docs links, and senior engineers are interrupted constantly.",
    solution:
      "Deploy Mode 1 turnkey. Upload existing help docs (PDFs, Word, Markdown, or crawl URLs). Users get instant, cited answers at /chat or through an iframe widget embedded directly on the help center.",
    impactMetric: "65% Deflection",
    impactLabel: "Repetitive ticket reduction",
    testimonial:
      "Our first-response time dropped from 4 hours to 0 seconds. More than half our routine tickets are resolved automatically without burning out our support team.",
  },
  {
    id: "agency",
    title: "The Agency & Freelancer",
    subtitle: "Turning client AI requests into high-margin deliverables",
    icon: BriefcaseIcon,
    tag: "Revenue Multiplier",
    painPoint:
      "Clients constantly ask: 'Can you build an AI chatbot that knows everything about our company?' Building from scratch takes weeks of infrastructure setup, causing freelancers to either undercharge or turn down work.",
    solution:
      "A ready-to-brand foundation. Clone, upload client documents, drop the embeddable iframe snippet into their WordPress, Webflow, or custom site, and bill for custom value instead of reinventing infrastructure.",
    impactMetric: "$5,000+ Value",
    impactLabel: "Delivered in 24 hours",
    testimonial:
      "I delivered a branded AI assistant to a medical tech client in two days. What used to take a whole sprint is now a predictable, high-margin weekend project.",
  },
  {
    id: "learner",
    title: "The AI Engineering Learner",
    subtitle: "Wants to master production RAG, not shallow tutorials",
    icon: AcademicCapIcon,
    tag: "Knowledge Accelerator",
    painPoint:
      "Trying to break into AI engineering, but every resource is either a 100-line toy script or a Python notebook. There are no production-grade TypeScript codebases showing real-world chunking, pgvector search, and SSE streaming.",
    solution:
      "Study a production architecture. Inspect how sliding-window chunking works, how 1024-dim vectors query PostgreSQL with `<=>`, how SSE streams tokens chunk-by-chunk, and how rate limiting protects APIs.",
    impactMetric: "100% Inspectable",
    impactLabel: "Open-source reference code",
    testimonial:
      "This is the first real codebase that taught me how vector search and streaming actually fit into a Next.js App Router project without magic abstractions.",
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is it really $0 recurring cost forever, or is there a catch?",
    answer:
      "It is genuinely free to develop and run for light production. The kit leverages OpenRouter's generous free-tier chat models (like nvidia/nemotron-3.5-lightning:free) and embedding models (liquid/lfm-2.5-embedding-350m:free), paired with Neon's free serverless PostgreSQL (with pgvector 0.8.0) and Vercel's free hosting. You do not need to enter a credit card to get started.",
  },
  {
    question: "Why build this in TypeScript instead of using Python (LangChain / LlamaIndex)?",
    answer:
      "Almost all production web applications are built with TypeScript, React, and Next.js. Forcing developers to manage separate Python microservices introduces deployment complexity, cold starts, and fragile multi-language architectures. By building the entire RAG pipeline natively in TypeScript, your entire stack shares types, validation (Zod), ORM models (Prisma 7), and hosting environments.",
  },
  {
    question: "Where are my documents and embeddings stored? Is my data private?",
    answer:
      "Your documents, semantic chunks, and vector embeddings are stored entirely in your own PostgreSQL database. Unlike closed-source managed SaaS products (such as Chatbase or Intercom Fin), you own 100% of your data and infrastructure. Your proprietary documents are never shared or used to train public LLM foundation models.",
  },
  {
    question: "Can I embed this chatbot on my existing website (WordPress, Webflow, Shopify)?",
    answer:
      "Yes! The starter kit includes a dedicated standalone route at `/embed` specifically styled for iframes. In the Admin Overview (/admin), you can copy a single `<iframe src='.../embed' />` code snippet and drop it into any HTML page, customer portal, or help desk.",
  },
  {
    question: "Can I switch to paid models like OpenAI GPT-4o or Claude 3.5 Sonnet later?",
    answer:
      "Absolutely. The LLM and embedding layers in `lib/ai.ts` use the standard OpenAI-compatible API interface. You can effortlessly switch between OpenRouter free models, OpenAI, Anthropic, or Google Gemini simply by updating environment variables in your `.env` file without altering core application logic.",
  },
];

export default function Home() {
  const [activeSim, setActiveSim] = useState<SimulationPrompt>(SAMPLE_PROMPTS[0]);
  const [activePersona, setActivePersona] = useState<string>("developer");
  const [calculatorTier, setCalculatorTier] = useState<"starter" | "scale">("starter");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const copyCloneCmd = () => {
    navigator.clipboard.writeText("git clone https://github.com/rejisterjack/rag-starter-kit.git && cd rag-starter-kit && bun install && bun dev");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPersona = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];

  return (
    <div className="flex flex-col items-center justify-center space-y-24 py-8">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Pulsating Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold backdrop-blur-md shadow-sm shadow-primary/20 hover:border-primary/50 transition-colors">
          <SparklesIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Next-Gen Self-Hosted Knowledge Engine</span>
          <span className="text-default-400">•</span>
          <span className="text-success-600 dark:text-success-400 font-bold">$0 Recurring Operating Cost</span>
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-3xl">
          Own Your AI,{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            This Weekend.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-default-600 dark:text-default-300 max-w-2xl leading-relaxed">
          Clone the repository, upload your company documents (PDF, Word, Markdown, Text, or URLs), and deploy a production-grade AI knowledge chatbot you own 100% — running on your own infrastructure at <strong>$0 recurring cost</strong>.
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Link href="/chat">
            <Button
              size="lg"
              variant="primary"
              className="font-bold px-8 h-12 shadow-xl shadow-primary/30 text-sm flex items-center gap-2.5 rounded-xl hover:scale-105 transition-all duration-200"
            >
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
              <span>Launch Live Chatbot</span>
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

          <a href="#simulator">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold px-6 h-12 text-sm flex items-center gap-2 rounded-xl text-default-400 hover:text-foreground border border-transparent hover:border-default-200 dark:hover:border-default-100/30"
            >
              <PlayCircleIcon className="w-5 h-5" />
              <span>Watch 30s Interactive Demo</span>
            </Button>
          </a>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-8 border-t border-default-200/50 dark:border-default-100/30">
          <div className="p-3.5 rounded-2xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-foreground">0 ms</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">Cold Starts (Serverless)</div>
          </div>
          <div className="p-3.5 rounded-2xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-primary">1024-dim</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">pgvector Cosine Search</div>
          </div>
          <div className="p-3.5 rounded-2xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-foreground">100%</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">TypeScript + Prisma 7</div>
          </div>
          <div className="p-3.5 rounded-2xl border border-default-200/40 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-success-500">$0.00</div>
            <div className="text-[11px] text-default-400 font-medium mt-0.5">Forever Free Tier</div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THE PROBLEM VS THE SOLUTION                            */}
      {/* ========================================================= */}
      <section className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <Chip size="sm" color="danger" variant="soft" className="mb-2 font-semibold">
            The Real-World Bottleneck
          </Chip>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Why Building RAG Usually Takes Weeks of Agony
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Every company needs an AI that knows their documents. But developers get bogged down by Python microservices, fragile glue code, and runaway subscription fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Painful Status Quo */}
          <Card className="border border-danger-500/20 bg-danger-500/5 dark:bg-danger-500/10 p-6 rounded-3xl space-y-4">
            <CardHeader className="p-0 flex items-center gap-2.5 text-danger-600 dark:text-danger-400 font-bold text-base">
              <XCircleIcon className="w-6 h-6 shrink-0" />
              <span>The Painful Status Quo</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3.5 text-xs text-default-600 dark:text-default-300">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-danger-500/20 text-danger-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✕</span>
                <p><strong>Support Ticket Burnout:</strong> Support reps spend 70% of their workday answering the same questions already detailed in public documentation.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-danger-500/20 text-danger-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✕</span>
                <p><strong>The Python Microservice Tax:</strong> TypeScript developers are forced to learn Python, deploy separate FastAPI microservices, and manage heavy Docker environments.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-danger-500/20 text-danger-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✕</span>
                <p><strong>Runaway SaaS Bills:</strong> Paying $240 to $500/month for proprietary tools like Intercom Fin or Chatbase that hold your data hostage.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-danger-500/20 text-danger-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✕</span>
                <p><strong>Shallow Tutorials:</strong> Blog posts stop at "it works on my laptop," omitting auth, rate limiting, audit logging, and source citations.</p>
              </div>
            </CardContent>
          </Card>

          {/* The RAG Starter Kit Way */}
          <Card className="border border-success-500/30 bg-success-500/5 dark:bg-success-500/10 p-6 rounded-3xl space-y-4">
            <CardHeader className="p-0 flex items-center gap-2.5 text-success-600 dark:text-success-400 font-bold text-base">
              <CheckBadgeIcon className="w-6 h-6 shrink-0" />
              <span>The RAG Starter Kit Way</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3.5 text-xs text-default-600 dark:text-default-300">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-success-500/20 text-success-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                <p><strong>Instant 60%+ Deflection:</strong> End users receive instant, grounded responses with verifiable citations to exact source documents.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-success-500/20 text-success-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                <p><strong>100% Pure TypeScript:</strong> Next.js 16 App Router, React 19, Prisma 7, and native pgvector SQL. Single codebase, zero Python.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-success-500/20 text-success-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                <p><strong>$0.00 Recurring Operating Cost:</strong> OpenRouter free tier + Neon PostgreSQL free tier. No credit card required to deploy.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-success-500/20 text-success-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                <p><strong>Production-Hardened:</strong> Built-in sliding-window rate limiting, tamper-evident audit logging, and embeddable iframe widget.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE RAG PIPELINE SIMULATOR                     */}
      {/* ========================================================= */}
      <section id="simulator" className="w-full max-w-4xl scroll-mt-20">
        <div className="text-center mb-6">
          <Chip size="sm" color="accent" variant="soft" className="mb-2 font-semibold">
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
        <Card className="border border-default-200/60 dark:border-white/10 shadow-2xl bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl overflow-hidden rounded-3xl">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl border border-default-200/50 dark:border-white/10 bg-default-100/40 dark:bg-default-50/20 text-xs">
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
                  Nemotron 3.5 Lightning
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

      {/* ========================================================= */}
      {/* 4. WHO IS THIS BUILT FOR (PERSONAS SWITCHER)              */}
      {/* ========================================================= */}
      <section className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <Chip size="sm" color="default" variant="soft" className="mb-2 font-semibold">
            Target Personas
          </Chip>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Engineered Specifically For You
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-2 max-w-lg mx-auto">
            Select your role to see how the RAG Starter Kit solves your exact day-to-day workflow bottleneck.
          </p>

          {/* Persona Tab Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    activePersona === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                      : "border-default-200 dark:border-default-100/40 text-default-600 hover:border-primary/40 bg-default-50/50 dark:bg-default-50/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Persona Detail Card */}
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="accent" variant="soft" className="font-semibold text-xs">
                  {selectedPersona.tag}
                </Chip>
                <span className="text-xs text-default-400">•</span>
                <span className="text-xs text-default-400">{selectedPersona.subtitle}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {selectedPersona.title}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-default-600 dark:text-default-300 leading-relaxed">
                <p>
                  <strong className="text-danger-500 font-semibold">The Pain:</strong> {selectedPersona.painPoint}
                </p>
                <p>
                  <strong className="text-success-500 font-semibold">The Fix:</strong> {selectedPersona.solution}
                </p>
              </div>

              {/* Quote Block */}
              <div className="p-4 rounded-2xl bg-default-100/60 dark:bg-default-50/10 border-l-4 border-primary text-xs italic text-default-500">
                "{selectedPersona.testimonial}"
              </div>
            </div>

            {/* Impact KPI Box */}
            <div className="md:w-60 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 text-center shrink-0 space-y-2">
              <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {selectedPersona.impactLabel}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {selectedPersona.impactMetric}
              </div>
              <p className="text-[11px] text-default-400">
                Grounded on your own documents at $0 operating cost.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ========================================================= */}
      {/* 5. TWO DISTINCT MODES BENTO GRID                          */}
      {/* ========================================================= */}
      <section className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <Chip size="sm" color="default" variant="soft" className="mb-2 font-semibold">
            Flexible Deployment Paths
          </Chip>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Two Modes, One Codebase</h2>
          <p className="text-xs sm:text-sm text-default-500 mt-2 max-w-lg mx-auto">
            Engineered for both non-developers wanting an instant self-hosted AI and developers building custom client solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1 */}
          <Card className="p-6 border border-default-200/60 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-default-100/40 dark:from-default-50/20 to-transparent hover:border-success-500/30 transition-all duration-300 rounded-3xl">
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
                  <span><strong>Embed on any site via:</strong> <code className="text-primary font-mono bg-default-100 dark:bg-default-50 px-1 py-0.5 rounded">/embed</code></span>
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
            <CardFooter className="p-0 pt-2 flex gap-2">
              <Link href="/chat" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 border border-default-200 dark:border-white/10 h-10 rounded-xl">
                  <span>Try User Chatbot</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/embed" target="_blank" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 border border-default-200 dark:border-white/10 h-10 rounded-xl">
                  <span>Widget Preview ↗</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Mode 2 */}
          <Card className="p-6 border border-default-200/60 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-default-100/40 dark:from-default-50/20 to-transparent hover:border-primary/40 transition-all duration-300 rounded-3xl">
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
                <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 border border-default-200 dark:border-white/10 h-10 rounded-xl">
                  <span>Explore Knowledge Pipeline</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE ROI & COST CALCULATOR                      */}
      {/* ========================================================= */}
      <section className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Chip size="sm" color="success" variant="soft" className="mb-2 font-semibold">
            Unbeatable Economics
          </Chip>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Stop Burning $2,880+/Year on Proprietary AI
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-2 max-w-lg mx-auto">
            Proprietary chatbot SaaS tools charge per-seat and per-resolution fees. See what you save by owning your stack.
          </p>

          {/* Calculator Preset Toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setCalculatorTier("starter")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                calculatorTier === "starter"
                  ? "bg-success-500 text-white border-success-500 shadow-md shadow-success-500/20"
                  : "border-default-200 dark:border-default-100/40 text-default-600 hover:border-success-500/50"
              }`}
            >
              Small Team (50 Docs • 1,500 Queries/mo)
            </button>
            <button
              onClick={() => setCalculatorTier("scale")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                calculatorTier === "scale"
                  ? "bg-success-500 text-white border-success-500 shadow-md shadow-success-500/20"
                  : "border-default-200 dark:border-default-100/40 text-default-600 hover:border-success-500/50"
              }`}
            >
              Growing SaaS (500 Docs • 10,000 Queries/mo)
            </button>
          </div>
        </div>

        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-default-200/50 dark:divide-default-100/30">
            {/* Proprietary SaaS */}
            <div className="space-y-2 pt-2 md:pt-0">
              <span className="text-xs font-semibold text-danger-500 uppercase tracking-wider">
                Proprietary SaaS Bots
              </span>
              <div className="text-3xl font-black text-danger-500">
                {calculatorTier === "starter" ? "$240" : "$650"}
                <span className="text-xs font-normal text-default-400"> / month</span>
              </div>
              <p className="text-[11px] text-default-400">
                Intercom Fin / Chatbase / Pinecone lock-in with per-seat seat surcharges.
              </p>
            </div>

            {/* RAG Starter Kit */}
            <div className="space-y-2 pt-4 md:pt-0 md:px-4">
              <span className="text-xs font-semibold text-success-500 uppercase tracking-wider">
                RAG Starter Kit
              </span>
              <div className="text-3xl font-black text-success-500">
                $0.00
                <span className="text-xs font-normal text-default-400"> / month</span>
              </div>
              <p className="text-[11px] text-default-400">
                OpenRouter free models + Neon PostgreSQL free tier + Vercel hosting.
              </p>
            </div>

            {/* Annual Savings */}
            <div className="space-y-2 pt-4 md:pt-0 md:pl-4 bg-success-500/10 rounded-2xl p-4 border border-success-500/20">
              <span className="text-xs font-bold text-success-600 dark:text-success-400 uppercase tracking-wider">
                Net Annual Savings
              </span>
              <div className="text-3xl font-black text-foreground">
                {calculatorTier === "starter" ? "$2,880" : "$7,800"}
              </div>
              <p className="text-[11px] text-default-500">
                Put your budget into building product, not paying middleman markups.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ========================================================= */}
      {/* 7. DEEP-DIVE TECHNICAL PILLARS                            */}
      {/* ========================================================= */}
      <section className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <Chip size="sm" color="default" variant="soft" className="mb-2 font-semibold">
            Technical Architecture
          </Chip>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Built Like a Real Production System
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Most open-source RAG projects are toy demos that fall apart under load. This kit includes the hardened infrastructure you'd spend three weeks wiring from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-primary/40 transition-all duration-200 rounded-2xl">
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

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-success-500/40 transition-all duration-200 rounded-2xl">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center text-success-500">
                <CurrencyDollarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">pgvector Cosine Search</h4>
                <p className="text-[11px] text-default-400 font-normal">Native PostgreSQL</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Query vector embeddings directly in the same PostgreSQL database using the <code className="text-primary font-mono font-bold">{"<=>"}</code> distance operator. Zero separate vector database bills or synchronisation lag.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-warning-500/40 transition-all duration-200 rounded-2xl">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Multi-Format Ingestion</h4>
                <p className="text-[11px] text-default-400 font-normal">PDF, DOCX, MD, URLs</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Automatic text extraction and sliding-window chunking (1,000 chars, 200 overlap) preserving page numbers, section headers, and semantic integrity.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-primary/40 transition-all duration-200 rounded-2xl">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Real-Time SSE Streaming</h4>
                <p className="text-[11px] text-default-400 font-normal">Token-by-Token Delivery</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Server-Sent Events (SSE) deliver tokens smoothly with sub-150ms time-to-first-token, accompanied by verified source pills and a slide-over Citation Inspector.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-danger-500/40 transition-all duration-200 rounded-2xl">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center text-danger-500">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Rate Limiting & Audit</h4>
                <p className="text-[11px] text-default-400 font-normal">Anti-Bill Abuse</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Built-in sliding-window rate limiter protecting chat and uploads from DDoS attempts, coupled with a tamper-evident audit ledger tracking all actions.
            </CardContent>
          </Card>

          <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm hover:border-secondary/40 transition-all duration-200 rounded-2xl">
            <CardHeader className="p-0 flex items-center gap-3 font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Embeddable Anywhere</h4>
                <p className="text-[11px] text-default-400 font-normal">Single-Line Iframe</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-xs text-default-500 leading-relaxed">
              Dedicated `/embed` route without navigation bloat. Drop a single responsive <code className="text-primary font-mono font-bold">{"<iframe>"}</code> onto client sites, Webflow, WordPress, or help docs in seconds.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS                             */}
      {/* ========================================================= */}
      <section className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <Chip size="sm" color="default" variant="soft" className="mb-2 font-semibold">
            Common Questions
          </Chip>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-default-500 mt-1">
            Everything you need to know before deploying your AI knowledge base.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-primary shrink-0 ml-2" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-default-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <CardContent className="px-5 pb-5 pt-0 text-xs sm:text-sm text-default-600 dark:text-default-300 leading-relaxed border-t border-default-200/40 dark:border-default-100/20 pt-3">
                    {faq.answer}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FINAL HIGH-CONVERTING CALL TO ACTION                   */}
      {/* ========================================================= */}
      <section className="w-full max-w-4xl pb-10">
        <div className="relative overflow-hidden rounded-3xl border border-default-200/60 dark:border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-8 sm:p-12 backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
            <RocketLaunchIcon className="w-4 h-4" />
            <span>Ready to Deploy By Sunday?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop Paying for AI Chatbots.{" "}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Own Yours Today.
            </span>
          </h2>

          <p className="text-xs sm:text-base text-default-600 dark:text-default-300 max-w-xl mx-auto leading-relaxed">
            Join developers, founders, and agencies deploying production-grade RAG in hours. 100% open source, MIT licensed, and forever free to run.
          </p>

          {/* Quick Terminal Clone Snippet */}
          <div className="max-w-xl mx-auto relative group bg-black/50 border border-white/10 rounded-2xl p-4 text-left font-mono text-xs text-default-200 shadow-inner">
            <button
              type="button"
              onClick={copyCloneCmd}
              className="absolute top-3 right-3 text-default-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              title="Copy installation command"
            >
              {copied ? (
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-success-500" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4" />
              )}
            </button>
            <div className="text-default-500 select-none"># 1. Clone & launch locally in 30 seconds</div>
            <div><span className="text-primary font-bold">$</span> git clone https://github.com/rejisterjack/rag-starter-kit.git</div>
            <div><span className="text-primary font-bold">$</span> cd rag-starter-kit && bun install && bun dev</div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/chat">
              <Button
                size="lg"
                variant="primary"
                className="font-bold px-8 h-12 shadow-xl shadow-primary/30 text-sm flex items-center gap-2 rounded-xl hover:scale-105 transition-all"
              >
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                <span>Launch Live Chatbot</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold px-8 h-12 text-sm flex items-center gap-2 rounded-xl border border-default-200 dark:border-white/10 hover:border-primary/40 transition-all"
              >
                <WrenchScrewdriverIcon className="w-5 h-5 text-default-500" />
                <span>Open Knowledge Admin</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-default-400 pt-2">
            <span>✓ MIT Open Source</span>
            <span>✓ 100% Type-Safe</span>
            <span>✓ Zero Vendor Lock-in</span>
          </div>
        </div>
      </section>
    </div>
  );
}
