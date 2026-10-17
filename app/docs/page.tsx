"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
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
  ShieldCheckIcon,
  ArrowPathIcon,
  ServerStackIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<
    "quickstart" | "architecture" | "env" | "api" | "vector" | "deploy"
  >("quickstart");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => {
      setCopiedSnippetId(null);
    }, 2000);
  };

  const CodeSnippet = ({
    code,
    language = "bash",
    filename,
    id,
  }: {
    code: string;
    language?: string;
    filename?: string;
    id: string;
  }) => {
    const isCopied = copiedSnippetId === id;
    return (
      <div className="rounded-2xl border border-default-200/80 dark:border-white/10 bg-black/80 dark:bg-black/90 overflow-hidden shadow-lg font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 text-[11px] text-default-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-success-500/80 inline-block" />
            {filename && <span className="ml-2 font-medium text-default-300">{filename}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="uppercase text-[10px] text-default-500 font-bold">{language}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(code, id)}
              className="flex items-center gap-1 text-default-300 hover:text-white transition-colors"
            >
              {isCopied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-success-400" />
                  <span className="text-success-400 font-bold text-[10px]">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        <pre className="p-4 text-default-200 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 sm:py-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-sm">
          <BookOpenIcon className="w-4 h-4" />
          <span>Documentation & Architecture Blueprint</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Developer Reference & Guide
            </h1>
            <p className="text-sm sm:text-base text-default-500 max-w-2xl leading-relaxed">
              Step-by-step local setup, PostgreSQL pgvector schemas, streaming REST APIs, and production deployment blueprints.
            </p>
          </div>

          {/* Quick Filter */}
          <div className="relative w-full md:w-72">
            <MagnifyingGlassIcon className="w-4 h-4 text-default-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides or APIs..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-default-100 dark:bg-default-50/10 border border-default-200/60 dark:border-default-100/30 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-default-200/60 dark:border-default-100/30 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: "quickstart", label: "5-Minute Quickstart", icon: CommandLineIcon },
          { id: "architecture", label: "Architecture & Data Flow", icon: CubeTransparentIcon },
          { id: "env", label: "Environment Variables", icon: KeyIcon },
          { id: "api", label: "REST API Reference", icon: CodeBracketIcon },
          { id: "vector", label: "pgvector & Models", icon: CpuChipIcon },
          { id: "deploy", label: "Production Deployment", icon: ServerStackIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 5-Minute Quickstart */}
      {activeTab === "quickstart" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-1">
              <span className="text-[11px] font-mono font-bold text-primary uppercase">Prerequisite 1</span>
              <h4 className="font-bold text-foreground text-sm">Node.js 20+ or Bun</h4>
              <p className="text-xs text-default-400">Bun is recommended for ultra-fast startup and native TypeScript.</p>
            </Card>
            <Card className="p-4 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-1">
              <span className="text-[11px] font-mono font-bold text-success-500 uppercase">Prerequisite 2</span>
              <h4 className="font-bold text-foreground text-sm">PostgreSQL with pgvector</h4>
              <p className="text-xs text-default-400">Free serverless database from Neon, Supabase, or local Docker.</p>
            </Card>
            <Card className="p-4 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-1">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">Prerequisite 3</span>
              <h4 className="font-bold text-foreground text-sm">OpenRouter API Key</h4>
              <p className="text-xs text-default-400">100% free account with zero credit card required.</p>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="flex-grow space-y-3 w-full">
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Clone the Repository & Install Dependencies</h3>
                  <p className="text-xs text-default-500">
                    Get the complete repository from GitHub and install all required packages.
                  </p>
                </div>
                <CodeSnippet
                  id="qs-clone"
                  filename="terminal"
                  language="bash"
                  code={`# Clone the official starter repository\ngit clone https://github.com/rejisterjack/rag-starter-kit.git\ncd rag-starter-kit\n\n# Install dependencies with Bun (recommended) or npm\nbun install`}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="flex-grow space-y-3 w-full">
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Configure Environment Variables</h3>
                  <p className="text-xs text-default-500">
                    Copy the template and supply your PostgreSQL connection string and free OpenRouter key.
                  </p>
                </div>
                <CodeSnippet
                  id="qs-env"
                  filename=".env"
                  language="env"
                  code={`# Copy the template file\ncp .env.example .env\n\n# Edit .env with your credentials:\nDATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"\nOPENROUTER_API_KEY="sk-or-v1-..."\nNEXT_PUBLIC_APP_URL="http://localhost:7392"`}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="flex-grow space-y-3 w-full">
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Push Prisma Schema & Seed Admin Account</h3>
                  <p className="text-xs text-default-500">
                    Synchronize Prisma models with PostgreSQL and enable the pgvector extension.
                  </p>
                </div>
                <CodeSnippet
                  id="qs-db"
                  filename="terminal"
                  language="bash"
                  code={`# Ensure Prisma client is generated\nbun run prisma generate\n\n# Push database schema to PostgreSQL (creates Document, DocumentChunk, ChatSession, User tables)\nbun run prisma db push`}
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center shrink-0 text-sm">
                4
              </div>
              <div className="flex-grow space-y-3 w-full">
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Launch the Development Server</h3>
                  <p className="text-xs text-default-500">
                    Start Next.js 16 on port 7392 and test the streaming chatbot interface.
                  </p>
                </div>
                <CodeSnippet
                  id="qs-run"
                  filename="terminal"
                  language="bash"
                  code={`# Run with Next.js Turbopack\nbun dev\n\n# Visit http://localhost:7392 in your browser\n# Default Demo Admin Login: admin / admin123 (or demo / demo123)`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture & Data Flow */}
      {activeTab === "architecture" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">End-to-End RAG Architecture Pipeline</h2>
            <p className="text-xs sm:text-sm text-default-500">
              How documents are parsed, converted into 1024-dimensional dense vectors, retrieved via PostgreSQL cosine distance, and streamed to the user with citations.
            </p>
          </div>

          {/* Visual Step-by-Step Architecture Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="font-bold text-foreground text-sm">Document Ingestion & Parsing</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                Upload PDFs, Word DOCX files, raw Markdown, or scrape web documentation URLs. The server uses <code>pdf-parse</code>, <code>mammoth</code>, and <code>cheerio</code> to strip markup and extract clean raw text.
              </p>
            </Card>

            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="font-bold text-foreground text-sm">Sliding-Window Chunking</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                Text is divided into semantically coherent chunks of <strong>500 characters</strong> with a <strong>100 character overlap</strong>. This overlap prevents loss of context at chunk boundaries.
              </p>
            </Card>

            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="font-bold text-foreground text-sm">Dense Vector Embeddings</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                Each chunk is passed to OpenRouter's <code>liquid/lfm-2.5-embedding-350m:free</code> model. It outputs a 1024-dimensional floating point dense vector representing semantic meaning.
              </p>
            </Card>

            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">4</span>
                <h4 className="font-bold text-foreground text-sm">Native pgvector Storage</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                Chunks and vector coordinates are written directly to PostgreSQL in a table with a <code>vector(1024)</code> column. No separate vector database (like Pinecone) is required.
              </p>
            </Card>

            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold text-xs">5</span>
                <h4 className="font-bold text-foreground text-sm">Cosine Distance Similarity (&lt;=&gt;)</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                When a user asks a question, the query is vectorized and compared against all chunks using PostgreSQL's cosine operator: <code>embedding &lt;=&gt; $1::vector</code>, selecting top matches in &lt;100ms.
              </p>
            </Card>

            <Card className="p-5 rounded-2xl border border-default-200/60 dark:border-default-100/30 bg-default-50/60 dark:bg-default-50/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center font-bold text-xs">6</span>
                <h4 className="font-bold text-foreground text-sm">Grounded SSE Streaming Response</h4>
              </div>
              <p className="text-xs text-default-400 leading-relaxed">
                Retrieved chunks are injected as system context into <code>nvidia/nemotron-3.5-lightning:free</code>. The answer streams in real-time with document citations and source attribution.
              </p>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-sm">PostgreSQL Vector Query Example</h3>
            <CodeSnippet
              id="arch-sql"
              language="sql"
              filename="retrieval.sql"
              code={`-- pgvector native cosine distance retrieval\nSELECT \n  c.id, \n  c.content, \n  c."documentId",\n  d.name AS "documentName",\n  1 - (c.embedding <=> $1::vector) AS similarity\nFROM "DocumentChunk" c\nJOIN "Document" d ON c."documentId" = d.id\nWHERE 1 - (c.embedding <=> $1::vector) > 0.45\nORDER BY c.embedding <=> $1::vector ASC\nLIMIT 5;`}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Environment Variables */}
      {activeTab === "env" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Environment Variables Reference</h2>
            <p className="text-xs sm:text-sm text-default-500">
              Configure your database connection, AI keys, and application URLs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-default-200/60 dark:border-default-100/20 bg-default-100/40 dark:bg-default-50/20">
                  <th className="p-4 sm:p-5 font-bold text-foreground">Variable Name</th>
                  <th className="p-4 sm:p-5 font-bold text-foreground">Status</th>
                  <th className="p-4 sm:p-5 font-bold text-foreground">Default / Example</th>
                  <th className="p-4 sm:p-5 font-bold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200/40 dark:divide-default-100/20 text-default-600 dark:text-default-300">
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">DATABASE_URL</td>
                  <td className="p-4">
                    <Chip size="sm" color="danger" variant="soft" className="font-bold text-[10px]">
                      Required
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">postgresql://user:pass@host/db</td>
                  <td className="p-4 text-xs">
                    PostgreSQL connection URI. Must support the <code>pgvector</code> extension (Neon, Supabase, RDS, or local).
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">OPENROUTER_API_KEY</td>
                  <td className="p-4">
                    <Chip size="sm" color="danger" variant="soft" className="font-bold text-[10px]">
                      Required
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">sk-or-v1-abc123xyz...</td>
                  <td className="p-4 text-xs">
                    OpenRouter authorization key. Free tier accounts can access Nemotron and Liquid LFM models without billing.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">NEXT_PUBLIC_APP_URL</td>
                  <td className="p-4">
                    <Chip size="sm" color="default" variant="soft" className="font-bold text-[10px]">
                      Optional
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">http://localhost:7392</td>
                  <td className="p-4 text-xs">
                    The public canonical URL used for embeddable iframe generation and CORS origin verification.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">JWT_SECRET</td>
                  <td className="p-4">
                    <Chip size="sm" color="default" variant="soft" className="font-bold text-[10px]">
                      Optional
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">super-secure-random-secret</td>
                  <td className="p-4 text-xs">
                    Secret key used by <code>jose</code> to sign and verify session JWTs for user authentication and RBAC.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">CHUNK_SIZE</td>
                  <td className="p-4">
                    <Chip size="sm" color="default" variant="soft" className="font-bold text-[10px]">
                      Optional
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">500</td>
                  <td className="p-4 text-xs">
                    Maximum character length per text chunk when splitting uploaded documents.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-primary">CHUNK_OVERLAP</td>
                  <td className="p-4">
                    <Chip size="sm" color="default" variant="soft" className="font-bold text-[10px]">
                      Optional
                    </Chip>
                  </td>
                  <td className="p-4 font-mono text-default-400">100</td>
                  <td className="p-4 text-xs">
                    Character overlap between adjacent sliding-window chunks.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: REST API Reference */}
      {activeTab === "api" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">REST API Endpoints</h2>
            <p className="text-xs sm:text-sm text-default-500">
              Integrate RAG Starter Kit into your mobile apps, internal tools, and client platforms.
            </p>
          </div>

          {/* Endpoint 1: POST /api/chat */}
          <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="success" variant="soft" className="font-mono font-bold">
                  POST
                </Chip>
                <code className="text-sm font-mono font-bold text-foreground">/api/chat</code>
              </div>
              <span className="text-xs text-default-400">Server-Sent Events (SSE) Streaming</span>
            </div>
            <p className="text-xs text-default-500 leading-relaxed">
              Accepts user query, queries pgvector for matching chunks, grounds LLM context, and streams text tokens in real time.
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">cURL Example</h4>
              <CodeSnippet
                id="api-chat-curl"
                language="bash"
                filename="chat.sh"
                code={`curl -X POST http://localhost:7392/api/chat \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "message": "What is our customer refund policy?",\n    "chatId": "chat-uuid-optional"\n  }'`}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">SSE Response Stream</h4>
              <CodeSnippet
                id="api-chat-res"
                language="json"
                filename="stream.txt"
                code={`data: {"chunk": "Based "}\ndata: {"chunk": "on the "}\ndata: {"chunk": "provided document, "}\ndata: {"chunk": "refunds are processed within 14 business days."}\ndata: {"sources": [{"title": "Terms_of_Service.pdf", "similarity": 0.89}]}\ndata: [DONE]`}
              />
            </div>
          </Card>

          {/* Endpoint 2: POST /api/documents/upload */}
          <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="success" variant="soft" className="font-mono font-bold">
                  POST
                </Chip>
                <code className="text-sm font-mono font-bold text-foreground">/api/documents/upload</code>
              </div>
              <span className="text-xs text-default-400">Multipart Form-Data / JSON URL</span>
            </div>
            <p className="text-xs text-default-500 leading-relaxed">
              Uploads and processes documents (PDF, DOCX, TXT, MD) or parses live Web URLs, automatically generating 1024-dimensional pgvector embeddings.
            </p>

            <CodeSnippet
              id="api-upload-curl"
              language="bash"
              filename="upload.sh"
              code={`# Upload a local file\ncurl -X POST http://localhost:7392/api/documents/upload \\\n  -F "file=@/path/to/handbook.pdf"\n\n# Or ingest a Web URL\ncurl -X POST http://localhost:7392/api/documents/upload \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://example.com/docs/cancellation-policy"\n  }'`}
            />
          </Card>

          {/* Endpoint 3: GET /api/documents/[id]/chunks */}
          <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="accent" variant="soft" className="font-mono font-bold">
                  GET
                </Chip>
                <code className="text-sm font-mono font-bold text-foreground">/api/documents/[id]/chunks</code>
              </div>
              <span className="text-xs text-default-400">JSON Inspector</span>
            </div>
            <p className="text-xs text-default-500 leading-relaxed">
              Retrieves all vector chunks and token lengths for a specific document in the admin inspector view.
            </p>

            <CodeSnippet
              id="api-chunks-curl"
              language="bash"
              filename="get-chunks.sh"
              code={`curl -X GET http://localhost:7392/api/documents/doc-12345/chunks`}
            />
          </Card>
        </div>
      )}

      {/* Tab 5: pgvector & Model Cascade */}
      {activeTab === "vector" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">pgvector Tuning & Model Cascade</h2>
            <p className="text-xs sm:text-sm text-default-500">
              Understanding vector dimensions, distance operators, and index acceleration in PostgreSQL.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
              <div className="flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Primary Chat Inference Model</h3>
              </div>
              <div className="space-y-2 text-xs text-default-500 leading-relaxed">
                <p>
                  <strong className="text-foreground">Model:</strong> <code>nvidia/nemotron-3.5-lightning:free</code>
                </p>
                <p>
                  <strong className="text-foreground">Cost:</strong> $0.00 / 100% Free on OpenRouter
                </p>
                <p>
                  <strong className="text-foreground">Context Window:</strong> 128,000 tokens
                </p>
                <p>
                  <strong className="text-foreground">Strengths:</strong> Strict factual grounding, resistance to hallucination, rapid streaming token generation.
                </p>
              </div>
            </Card>

            <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
              <div className="flex items-center gap-2">
                <CircleStackIcon className="w-5 h-5 text-success-500" />
                <h3 className="font-bold text-foreground">Vector Embeddings Model</h3>
              </div>
              <div className="space-y-2 text-xs text-default-500 leading-relaxed">
                <p>
                  <strong className="text-foreground">Model:</strong> <code>liquid/lfm-2.5-embedding-350m:free</code>
                </p>
                <p>
                  <strong className="text-foreground">Dimensions:</strong> 1024 dense float values
                </p>
                <p>
                  <strong className="text-foreground">Cost:</strong> $0.00 / 100% Free on OpenRouter
                </p>
                <p>
                  <strong className="text-foreground">Distance Metric:</strong> Cosine similarity (<code>&lt;=&gt;</code>)
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
            <h3 className="font-bold text-foreground text-sm">HNSW vs IVFFlat Indexing in PostgreSQL</h3>
            <p className="text-xs text-default-500 leading-relaxed">
              When scaling past 50,000 document chunks, create an HNSW (Hierarchical Navigable Small World) index for sub-5 millisecond vector retrieval:
            </p>
            <CodeSnippet
              id="pg-hnsw"
              language="sql"
              filename="create_hnsw_index.sql"
              code={`-- Enable pgvector extension\nCREATE EXTENSION IF NOT EXISTS vector;\n\n-- Create HNSW index for high-speed cosine similarity (<=>)\nCREATE INDEX ON "DocumentChunk" \nUSING hnsw (embedding vector_cosine_ops)\nWITH (m = 16, ef_construction = 64);`}
            />
          </Card>
        </div>
      )}

      {/* Tab 6: Production Deployment */}
      {activeTab === "deploy" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Production Deployment Options</h2>
            <p className="text-xs sm:text-sm text-default-500">
              Deploy your self-hosted instance to Vercel, Docker Compose, Railway, or your own Linux VPS.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
              <h3 className="font-bold text-foreground text-base">Option A: Deploy to Vercel (Fastest)</h3>
              <p className="text-xs text-default-500">
                Push your repository to GitHub, link it in Vercel, and configure the two required environment variables (<code>DATABASE_URL</code> and <code>OPENROUTER_API_KEY</code>).
              </p>
              <CodeSnippet
                id="deploy-vercel"
                language="bash"
                filename="vercel.sh"
                code={`# Install Vercel CLI\nbun add -g vercel\n\n# Deploy to production\nvercel --prod`}
              />
            </Card>

            <Card className="p-6 rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10 space-y-4">
              <h3 className="font-bold text-foreground text-base">Option B: Self-Host with Docker Compose</h3>
              <p className="text-xs text-default-500">
                Run both PostgreSQL with pgvector and Next.js in isolated local or cloud containers.
              </p>
              <CodeSnippet
                id="deploy-docker"
                language="yaml"
                filename="docker-compose.yml"
                code={`version: '3.8'\nservices:\n  postgres:\n    image: pgvector/pgvector:pg16\n    environment:\n      POSTGRES_USER: rag_user\n      POSTGRES_PASSWORD: rag_secret_password\n      POSTGRES_DB: rag_db\n    ports:\n      - "5432:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  app:\n    build: .\n    ports:\n      - "7392:7392"\n    environment:\n      DATABASE_URL: "postgresql://rag_user:rag_secret_password@postgres:5432/rag_db"\n      OPENROUTER_API_KEY: "\${OPENROUTER_API_KEY}"\n    depends_on:\n      - postgres\n\nvolumes:\n  pgdata:`}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Bottom Help CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-primary/20 backdrop-blur-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-foreground">
            Need help or want custom deployment assistance?
          </h3>
          <p className="text-xs sm:text-sm text-default-500">
            Open an issue on GitHub or join our community discussions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/chat">
            <Button size="md" variant="primary" className="font-bold rounded-xl px-5">
              <span>Test Chatbot</span>
              <RocketLaunchIcon className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <a
            href="https://github.com/rejisterjack/rag-starter-kit"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="md" variant="secondary" className="font-semibold rounded-xl px-5 border border-default-200/60 dark:border-default-100/30">
              GitHub Repository
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
