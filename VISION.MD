# Quill

The fastest way for a TypeScript developer to go from "I have documents"
to "I have a production chatbot" — in one weekend, at zero cost.

A developer clones this repository, uploads their documents, and by Sunday
has a fully working, production-grade AI chatbot they own completely —
deployed to their own infrastructure, using their own API keys, trained on
their own knowledge base.

---

## The problem

Here is what happens every week, in real companies, right now.

**The drowning support team.**
A SaaS company has 400 pages of documentation. Their support inbox receives
200 tickets per week. Of those, 140 are questions already answered in the
docs. Their support team is burnt out answering the same things repeatedly.
The founder knows an AI chatbot would cut ticket volume in half. But building
one properly — with auth, file storage, background processing, real-time
streaming, and something that actually survives production traffic — takes
weeks they do not have.

**The new employee who can't find anything.**
A company has five years of knowledge scattered across Google Drive,
Confluence, and Notion pages. A new hire spends their first month asking
"where is the X document?" The answer is always "let me find that for you,"
which means senior people are interrupted constantly. Nobody has time to
build a proper internal knowledge tool.

**The freelancer with a client request.**
A client asks for "an AI chatbot trained on our product." Without a
production-ready foundation, the freelancer either says no, undercharges
and struggles, or spends three weeks building infrastructure instead of
the actual product.

**The developer who wants to learn RAG properly.**
A developer trying to break into AI engineering finds every resource is
either a Python Jupyter notebook or a 200-line tutorial. There is no real
TypeScript codebase showing how production RAG actually works — how
documents flow from upload to pgvector, how streaming SSE works end-to-end,
how background jobs and rate limiting and analytics fit together. The learning
resources do not exist for the TypeScript ecosystem.

These four problems share one root cause: people need a chatbot that knows
their specific knowledge, and nobody has the time or infrastructure expertise
to build one from scratch.

---

## Who it is for

**Primary — The TypeScript developer who needs to ship a chatbot.**
They work in Next.js, NestJS, or Node.js. They have been asked to add an AI
chatbot to a product, an internal tool, or a client project. They know React
and TypeScript well. They have looked at LangChain and LlamaIndex — both
Python. They have tried piecing something together from tutorials — it works
locally but they do not know how to make it production-ready. They do not want
to pay for OpenAI before they have shipped an MVP.

**Secondary — The developer learning AI engineering.**
They want to break into AI engineering from a TypeScript background. They want
to understand how production RAG actually works in a real codebase — not a
notebook. They want something they can run for free, read from top to bottom,
and use as a reference.

**Tertiary — The freelancer or agency.**
They get client requests for AI chatbots trained on content. They need a
production-ready foundation, not a proof of concept. Clone, configure,
customise, deploy. What would be three weeks of infrastructure work becomes
a day.

---

## Who it is not for

- **Non-technical users.** This is code-first. If you cannot read TypeScript,
  use a no-code tool instead.
- **Python developers.** LangChain, LlamaIndex, and RAGFlow are better choices.
  TypeScript-first is a feature, not a limitation.
- **People who just want to use a chatbot.** Use ChatGPT or Claude. Quill is
  for builders, not end users of AI.
- **Enterprise teams needing vendor SLAs.** This is open source and
  self-hosted. No enterprise support contracts.
- **Developers who want a no-code configuration experience.** Code-first,
  always.

---

## Two ways to use it

**Deploy as-is.**
Clone → configure → deploy → upload documents → chatbot is live. The
developer does not touch the code. They configure environment variables and
upload their content. This is the support bot use case, the internal
knowledge base use case, and the client chatbot use case.

**Fork and customise.**
Clone → study the codebase → change the UI, the RAG pipeline, the models,
the workflows → deploy something bespoke. This is the learning use case and
the "I need something specific" use case.

The README must make this choice clear in its first 200 words. A developer
landing on this repo must know which path they are taking and what to do next.

---

## What "production-ready" means here

Most tutorials stop at "it works on your laptop." Quill goes further.

| What | Why it matters |
|---|---|
| NextAuth.js v5 with OAuth | Sign in with GitHub or Google — no custom auth to build |
| Inngest background jobs | Large document uploads process asynchronously without blocking the UI |
| Cloudinary file storage | Uploaded files stored durably in the cloud, not on local disk |
| Upstash Redis rate limiting | The chatbot cannot be abused into API bills |
| pgvector on PostgreSQL | Vector search in the same Postgres database — no separate vector service |
| PostHog analytics | You know how people use the chatbot |
| Streaming SSE | Tokens appear as they generate, like ChatGPT, over standard HTTP |
| Source citations | Every answer shows which document it came from |
| Playwright E2E tests | You can change the code and know things still work |

---

## Technical differentiators

**TypeScript all the way down.**
The entire production RAG ecosystem is Python. Quill is one of the only
production-grade RAG systems built entirely in TypeScript. Same language as
your frontend, your API routes, and your type definitions. No context
switching, no Python environment management, no mixed-language complexity.

**Free to run by default.**
The default configuration costs zero — not "free trial, then paid":
- Chat and LLM via OpenRouter free models (DeepSeek, Llama, Mistral)
- Embeddings via Google Gemini free tier (1,500 requests per day)
- Hosting on Vercel free tier, database on Prisma Postgres free tier

A developer runs this from development through to light production without
spending a dollar. Paid providers (OpenAI, Anthropic) are opt-in, swappable
per workspace via environment variables.

**No WebSocket broker needed.**
Streaming is powered natively via HTTP Server-Sent Events and ReadableStream.
Zero dependency on Ably, Pusher, or any persistent socket service.

---

## Design principles

**Production-first, not demo-first.**
Every feature is built the way it would ship in a real product. If something
would not survive production, it does not go in.

**Free by default.**
The zero-cost configuration is not a compromise — it is the feature.
Developers who can run something for free will try it. A credit card wall
before the first successful run kills adoption.

**TypeScript all the way down.**
No Python, no shell script hacks, no mixed-language workarounds.

**Zero-config start, full-config depth.**
Running it locally should take under ten minutes with no prior RAG knowledge.
Customising every pipeline parameter should be possible without touching
core logic.

**The README is a product.**
A developer landing on the repo should understand what it is, choose their
path, and be running it within thirty minutes. Confusion is a bug.

**Observability from day one.**
Analytics, audit logging, and rate limiting are built in because production
systems need them from the start, not as an afterthought.

**One thing, done exceptionally well.**
The goal is not to be the most feature-complete RAG project. It is to be
the best starting point for a TypeScript developer who needs to ship a real
chatbot to real users. Depth over breadth.

---

## What success looks like

**3 months**
- A developer lands on this repo, understands it in five minutes, and has
  a running chatbot in under thirty minutes
- At least three documented real-world deployments shared publicly
- 200+ GitHub stars from organic traffic
- One published technical article explaining the architecture

**6 months**
- 500+ GitHub stars
- Developers sharing publicly that they shipped a client chatbot with this
- An embeddable `<script>` widget so devs can drop the chatbot on any page
- Listed in at least one curated "awesome-selfhosted" or "awesome-llm" list

**12 months**
- The reference TypeScript RAG implementation, the way `create-t3-app` is
  the reference for the T3 stack
- An active contributor community building connectors (Notion, GitHub, etc.)
- Used in portfolios by developers who learned production RAG from this codebase

---

## Positioning

For TypeScript developers who need to add a document-aware AI chatbot to
their product, their client's site, or their company's internal tools —
Quill is the only open-source project that gives you a production-ready,
deployable chatbot in a single weekend.

Unlike Python-based tools that require leaving the TypeScript ecosystem,
unlike minimal templates that stop at "works on my machine," and unlike
managed SaaS that owns your data and charges monthly — Quill is
TypeScript-native, self-hosted, costs nothing to run, and ships with
everything a real production system needs already wired in.

You own the code. You own the data. You own the infrastructure.

---

*Maintained by [@rejisterjack](https://github.com/rejisterjack).*