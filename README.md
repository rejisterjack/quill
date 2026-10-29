# Quill — Own Your AI Knowledge Base

> **The fastest way for a TypeScript developer to go from "I have documents" to "I have a production chatbot" — in one weekend, at zero cost.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![HeroUI](https://img.shields.io/badge/UI-HeroUI-pink?style=flat)](https://heroui.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-blue?style=flat&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/Language-1024--dim%20TypeScript-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat)](LICENSE)

---

## ⚡ What is this? (Understand in 60 Seconds)

A developer clones this repository, uploads their documents (company policies, product docs, help articles, internal wikis, or web URLs), and in a single weekend has a production-grade, self-hosted AI chatbot they own 100% — deployed to their own infrastructure, using their own API keys, with **$0 recurring operating cost**.

### Two Distinct Modes — One Codebase

Depending on your objective, this repository is designed to serve you in one of two clear ways:

| Mode | Who it's for | How it works |
| :--- | :--- | :--- |
| **Mode 1: Deploy As-Is**<br>*(Turnkey Application)* | Founders, support leads, agencies who need a live chatbot today without writing new code. | **1.** Clone & configure `.env`.<br>**2.** Builder manages knowledge base at **`/admin`**.<br>**3.** End users chat at **`/chat`** or via the embeddable widget at **`/embed`**. |
| **Mode 2: Fork & Customise**<br>*(Starter Kit / Reference)* | TypeScript developers and AI engineers building bespoke AI apps. | **1.** Clean, idiomatic TypeScript codebase.<br>**2.** Fully inspectable RAG pipeline, semantic chunker, and pgvector cosine search (`<=>`).<br>**3.** Extensible HeroUI components and API routes. |

> **The Rule of Thumb:** When you deploy this, your users chat at `/chat` (or inside an iframe pointing to `/embed`). You manage the knowledge base from `/admin`.

---

## 🚀 Key Technical Highlights

1. **100% TypeScript All the Way Down**: No Python microservices, no Jupyter notebooks, and no complex mixed-language bridges. Everything runs natively on Next.js 16 and Node/Bun.
2. **$0.00 Recurring Operating Cost**:
   - **LLM**: OpenRouter free tier (`nvidia/nemotron-3.5-lightning:free` or `liquid/lfm-2.5-2.6b:free`)
   - **Embeddings**: OpenRouter / Google Gemini free tier (`liquid/lfm-2.5-embedding-350m:free` generating 1024-dim dense vectors)
   - **Vector Database**: Neon PostgreSQL with `pgvector` free tier (0.8.0)
   - **Hosting**: Vercel / Railway / Render free tiers
3. **HeroUI Design System**: Built with modern dark-mode glassmorphism, responsive ambient meshes, and Heroicons.
4. **pgvector Cosine Search (`<=>`)**: Native vector similarity search in the same PostgreSQL database as your user accounts, workspaces, and audit logs.
5. **Real-Time SSE Streaming with Verified Citations**: Tokens stream chunk-by-chunk with zero UI freezing, accompanied by clickable citation badges and a slide-over Citation Inspector modal.
6. **Multi-Format Ingestion**: Ingest PDF, Word (`.docx`), Markdown (`.md`), Plain Text (`.txt`), or crawl public web URLs.
7. **Production Safeguards**: Sliding-window rate limiting engine to prevent API bill abuse, and tamper-evident audit logging tracking all admin actions and vector operations.
8. **Embeddable Widget**: Iframe-ready route at `/embed` with snippet generator in `/admin`.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Documents: PDF / DOCX / MD / URL] --> B[Server-side Extractor & Sliding Chunker]
    B --> C[OpenRouter Embedding Model: 1024-dim]
    C --> D[(Neon PostgreSQL + pgvector)]
    
    E[End User Query] --> F[OpenRouter Embedding Model]
    F --> G[Cosine Distance Query: <=> operator]
    G --> D
    D --> H[Top-K Ranked Context Chunks]
    H --> I[OpenRouter Streaming Chat LLM]
    I --> J[Server-Sent Events: SSE Stream]
    J --> K[HeroUI Chat Interface with Verified Citations]
```

---

## 🛠️ Quickstart (5 Minutes)

### 1. Prerequisites
- [Bun](https://bun.sh/) (or Node.js 20+)
- A PostgreSQL database with `pgvector` enabled (e.g. free instance on [Neon](https://neon.tech))
- A free API key from [OpenRouter](https://openrouter.ai/keys)

### 2. Clone and Install
```bash
git clone https://github.com/rejisterjack/quill.git
cd quill
bun install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
# Database (PostgreSQL with pgvector)
DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"

# OpenRouter Free LLM & Embedding keys
OPENROUTER_API_KEY="sk-or-v1-..."
NEXT_PUBLIC_APP_URL="http://localhost:7392"

# Session secret. Required in production.
AUTH_SECRET="your-super-secret-jwt-key"
```

### 4. Push Schema & Seed Initial Workspace
```bash
bun prisma db push
bun prisma db seed
```

Default credentials:
- **Admin**: `admin@quill.dev` / `Admin1234!`
- **Demo User**: `demo@quill.dev` / `Demo1234!`

### 5. Launch the Server
```bash
bun dev --port 7392
```

Open [http://localhost:7392](http://localhost:7392) in your browser:
- **Landing Page & Live RAG Playground**: `http://localhost:7392/`
- **End-User Chat Assistant**: `http://localhost:7392/chat`
- **Embeddable Standalone Widget**: `http://localhost:7392/embed`
- **Admin Knowledge Base Suite**: `http://localhost:7392/admin`
  - Document Upload & Chunk Inspector: `/admin/documents`
  - Analytics & Cost Calculator: `/admin/analytics`
  - Tamper-Evident Audit Logs: `/admin/audit`

---

## 💻 Embed on External Websites

To embed the AI chatbot into any external help desk, customer portal, or documentation site:

```html
<iframe
  src="https://your-domain.com/embed"
  width="100%"
  height="650"
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
  allow="clipboard-write"
></iframe>
```

---

## 📁 Repository Structure

```
├── app/
│   ├── page.tsx                  # Landing page with interactive RAG visualizer
│   ├── layout.tsx                # App layout with HeroUI provider & ambient mesh
│   ├── login/page.tsx            # Auth portal with demo quick-login credentials
│   ├── chat/page.tsx             # End-user chat with SSE stream & citation inspector
│   ├── embed/page.tsx            # Standalone embeddable chat widget for iframes
│   ├── admin/                    # Admin Management Suite
│   │   ├── page.tsx              # Overview, pipeline diagram & embed generator
│   │   ├── documents/page.tsx    # Multi-tab upload modal & chunk inspector
│   │   ├── analytics/page.tsx    # Latency gauge, format mix & cost calculator
│   │   └── audit/page.tsx        # Tamper-evident audit log with severity filters
│   └── api/                      # Full-stack API endpoints
│       ├── chat/route.ts         # SSE streaming with pgvector cosine retrieval
│       ├── documents/upload/     # Document parser, sliding chunker & embedder
│       └── auth/                 # JWT authentication & session verification
├── components/                   # HeroUI components & navigation bar
├── lib/
│   ├── ai.ts                     # OpenRouter API clients (chat & embeddings)
│   ├── vector.ts                 # pgvector native cosine distance SQL queries
│   ├── chunker.ts                # Sliding-window document chunking engine
│   ├── parsers.ts                # PDF, DOCX, Markdown, Text & Web scrapers
│   └── rate-limit.ts             # Sliding-window rate limiter (anti-bill abuse)
└── prisma/
    └── schema.prisma             # PostgreSQL schema with pgvector extension
```

---

## 🛡️ Production Readiness Checklist

- [x] **100% TypeScript** with strict type safety across all frontend and API routes
- [x] **pgvector Indexing** with `<=>` cosine distance similarity
- [x] **Server-Sent Events (SSE)** streaming with token delivery
- [x] **Sliding-Window Rate Limiting** on chat and document ingestion routes
- [x] **Tamper-Evident Audit Logging** recording administrative and ingestion actions
- [x] **Multi-format Ingestion** supporting PDF, DOCX, Markdown, Text, and URLs
- [x] **Embeddable Iframe Widget** for third-party websites and customer portals
- [x] **Zero Recurring Cost** architecture verified with OpenRouter free tier

---

## 📄 License

`Document.content` is encrypted at rest with AES-256-GCM (`lib/crypto.ts`). Chunk text used for retrieval stays plaintext so search still works. Set `ENCRYPTION_KEY` in production.

Distributed under the [MIT License](LICENSE). Built for builders.
