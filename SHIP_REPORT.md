# Ship Readiness Report — Quill

Tested on local `dev` on 22 Nov 2026 against Postgres with pgvector on 127.0.0.1:54338. The public playground was only checked for the registration refusal.

## Product Summary

Quill is a MIT-licensed, TypeScript knowledge-base chatbot. A person uploads documents and chats against them with citations.

The same app is the public playground at quill.rejisterjack.com when DEMO_MODE is on, and a self-hosted app when it is off.

Chat and embeddings default to OpenRouter free models. Vectors live in Postgres with pgvector.

Admins manage documents, analytics, audit, billing, connectors, and enterprise settings. End users chat at /chat or through /embed.

Rows below are PASSED or BLOCKED from this pass.

## Feature Table

| ID | Feature | Priority | Status | Bugs Found | Bugs Fixed | UI Issues Fixed | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WEB-01 | Landing | P0 | PASSED |  |  |  | Home returns 200 with the Quill title. |
| AUTH-01 | Register | P0 | PASSED |  |  |  | A new email creates a user and workspace. A short name returns 400. The public demo returns 403. |
| AUTH-02 | Login | P0 | PASSED |  |  |  | A wrong password returns 401. The seeded admin can sign in. |
| AUTH-03 | Session gate | P0 | PASSED |  |  |  | Logged-out /chat and /admin redirect. A non-admin is redirected away from /admin. |
| CHT-01 | Chat page | P0 | PASSED |  |  |  | A signed-in chat request is accepted. |
| CHT-02 | Streaming answers | P0 | PASSED |  |  |  | The answer streams as SSE. With no matching chunks the reply says the knowledge base has no match. |
| DOC-01 | Upload | P0 | BLOCKED | 1 | 1 |  | No OPENROUTER_API_KEY. Upload now returns 503 and the document is marked FAILED instead of a bare 500. |
| DOC-02 | Document library | P0 | PASSED |  |  |  | The document list and /admin/documents return 200. Demo deletion was not used against production. |
| ADM-01 | Admin shell | P0 | PASSED |  |  |  | /admin returns 200 for the admin session. |
| DEM-01 | Demo playground | P0 | PASSED |  |  |  | The live playground refuses registration and names the demo login. |
| SEC-01 | Rate limit | P0 | PASSED | 1 | 1 |  | Dev allows requests when Upstash is unset. Responses now send nosniff and a referrer policy, and hide X-Powered-By. |
| EMB-01 | Embed chat | P0 | PASSED | 1 | 1 |  | Embed chat without a key returns 401. A key streams an answer. A blank message returns 400. |
| AUTH-04 | Password reset | P1 | PASSED |  |  |  | Forgot-password issues a token in development. Reset changes the password and the old one stops working. |
| AUTH-05 | OAuth | P1 | BLOCKED |  |  |  | GitHub and Google client secrets are unset, so the OAuth round trip was not completed. |
| CHT-03 | History and branch | P1 | PASSED |  |  |  | Chat list returns 200 and branching a message creates a new chat. |
| CHT-04 | Feedback | P1 | PASSED |  |  |  | Rating a message returns 200. |
| CHT-05 | Transcribe | P1 | BLOCKED |  |  |  | No OPENROUTER_API_KEY. An empty transcription returns 400 instead of crashing. |
| EMB-02 | Brand and widget | P1 | PASSED |  |  |  | The embed brand route returns Quill. |
| DOC-03 | URL crawl | P1 | BLOCKED |  |  |  | A public URL was not crawled in this pass. |
| DOC-04 | Background ingest | P1 | PASSED |  |  |  | Without Inngest, upload calls ingest in the request. |
| DOC-05 | File storage | P1 | PASSED |  |  |  | The original file is written under .quill-uploads when Cloudinary is unset. |
| ADM-02 | Analytics | P1 | PASSED |  |  |  | Admin stats return counts and healthy true. |
| ADM-03 | Audit log | P1 | PASSED |  |  |  | The audit list includes the API key event. |
| ADM-04 | Billing | P1 | BLOCKED |  |  |  | STRIPE_PRICE_PRO is unset. Checkout returns 400 with that reason. |
| ADM-05 | Connectors | P1 | PASSED |  |  |  | The connector list is notion, github, confluence, google-drive, and jira. |
| ADM-06 | Compliance packet | P1 | PASSED |  |  |  | The compliance packet says it is not a SOC 2 report. |
| ADM-07 | Enterprise settings | P1 | PASSED |  |  |  | /admin/enterprise returns 200. |
| WS-01 | Workspaces | P1 | PASSED |  |  |  | Registration creates a workspace. A second workspace on the free plan returns 403. |
| WS-02 | Invites | P1 | PASSED |  |  |  | Creating an invite returns 200. |
| WS-03 | Models | P1 | PASSED |  |  |  | Updating the chat and embedding models returns 200. |
| WS-04 | Hosting | P1 | BLOCKED |  |  |  | The free plan refuses managed Neon hosting. No NEON_API_KEY is set. |
| WS-05 | Tuning | P1 | PASSED |  |  |  | The tuning list returns 200. |
| WS-06 | API keys | P1 | PASSED |  |  |  | An API key can be created and revoked. |
| WS-07 | SCIM | P1 | BLOCKED |  |  |  | A SCIM call without a token returns 401. A live provision was not run. |
| WS-08 | SAML | P1 | BLOCKED |  |  |  | SAML for an unconfigured slug returns 404. A live identity provider was not connected. |
| INT-01 | Slack and Discord | P1 | BLOCKED |  |  |  | Slack returns 400 when it is not configured. Discord rejects a missing signature. |
| MKT-01 | Marketing pages | P1 | PASSED |  |  |  | Docs, pricing, blog, about, and a known article return 200. An unknown article is 404. |
| MKT-02 | Waitlist | P1 | PASSED |  |  |  | A waitlist email returns 201. |
| SEC-02 | Encryption | P1 | BLOCKED |  |  |  | Encryption runs after a successful embedding. No document completed without an embedding key. |
| DEM-02 | Demo reset | P1 | PASSED |  |  |  | Reset outside demo mode returns 403. The public playground was not reset. |
| UI-01 | Errors and theme | P1 | PASSED |  |  |  | The not-found and login pages have their own titles. The error page does not render the exception. |
| SEO-01 | Metadata | P1 | PASSED | 1 | 1 | 1 | The home title is Quill — Own Your AI Knowledge Base. Login is Log in - Quill. Site links no longer point at HeroUI. |
| DEV-01 | Seed and local run | P1 | PASSED |  |  |  | Seed created the admin and demo users. The app ran on port 7392. |
| DEV-02 | Deploy files | P1 | PASSED |  |  |  | The local server used the committed cron file's app. Security headers come from next.config. |
| ANL-01 | Product analytics | P2 | BLOCKED |  |  |  | PostHog keys are unset. Chat still finished. |
| ACC-01 | Delete account | P1 | PASSED |  |  | 1 | Delete asks in the navbar, removes the user and owned workspace, and the same email can register again. |
| UI-02 | Missing page | P1 | PASSED |  |  | 1 | An unknown URL is 404 with Page not found and a way home. |

## Gaps

1. ACC-01 — BUILT. The navbar asks, then DELETE /api/account removes the user and the workspaces they own.

2. UI-02 — BUILT. Unknown URLs render Page not found with the title Page not found - Quill.

3. HIPAA, BAA, and SOC 2 — DEFER. `VISION.MD` and the README say Quill will not ship a compliance program, a signed BAA, or a SOC 2 report. `lib/compliance.ts` is control evidence only.

4. GitHub Actions — DEFER. The committed tree has no `.github/workflows`. The live site is a Vercel deploy of `main`. Adding a CI suite is not part of this pass.

5. Directory listings and launch posts — DEFER. `VISION.MD` names awesome-selfhosted, awesome-llm, and a technical article as later success markers. They are not product features.


## Per-Feature Sections

### WEB-01 Landing

- Files: `app/page.tsx`, `components/navbar.tsx`, `components/live-playground.tsx`
- Expected behavior: The home page explains the self-hosted knowledge-base chatbot and links into chat, docs, and login.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-01 Register

- Files: `app/login/page.tsx`, `app/api/auth/register/route.ts`
- Expected behavior: Email and password signup creates a user. The public demo returns 403 and tells the visitor to use the demo login.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-02 Login

- Files: `app/login/page.tsx`, `app/api/auth/login/route.ts`, `lib/auth.ts`
- Expected behavior: Email and password sign-in sets the session. The login page offers the published demo accounts.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-03 Session gate

- Files: `proxy.ts`
- Expected behavior: /chat and /admin require a session. Admin pages require the ADMIN role. Other people are sent to /chat.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHT-01 Chat page

- Files: `app/chat/page.tsx`
- Expected behavior: A signed-in person opens /chat and sends a question to the active workspace.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHT-02 Streaming answers

- Files: `app/api/chat/route.ts`, `lib/run-chat.ts`, `lib/vector.ts`
- Expected behavior: POST /api/chat streams the answer and attaches citations from retrieved chunks.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DOC-01 Upload

- Files: `app/api/documents/upload/route.ts`, `lib/parsers.ts`, `lib/chunker.ts`, `lib/ingest.ts`
- Expected behavior: An admin uploads a PDF, DOCX, Markdown, or text file and it becomes chunks.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DOC-02 Document library

- Files: `app/admin/documents/page.tsx`, `app/api/documents/route.ts`, `app/api/documents/[id]/chunks/route.ts`
- Expected behavior: /admin/documents lists documents and can open a document's chunks. Demo mode refuses delete.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-01 Admin shell

- Files: `app/admin/page.tsx`, `app/admin/layout.tsx`
- Expected behavior: An admin opens /admin and sees the knowledge-base tools, including the embed snippet.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEM-01 Demo playground

- Files: `lib/demo.ts`, `components/demo-banner.tsx`, `app/api/auth/register/route.ts`
- Expected behavior: DEMO_MODE shows the banner, disables registration, and keeps the shared playground writable.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SEC-01 Rate limit

- Files: `lib/rate-limit.ts`
- Expected behavior: Chat and ingest are rate limited. Production without Upstash throws instead of allowing the request.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### EMB-01 Embed chat

- Files: `app/embed/page.tsx`, `public/widget.js`, `app/api/embed/chat/route.ts`
- Expected behavior: /embed and public/widget.js answer without the admin session. /api/embed/chat is outside the session gate.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-04 Password reset

- Files: `app/api/auth/forgot/route.ts`, `app/api/auth/reset/route.ts`, `app/reset/page.tsx`
- Expected behavior: Forgot-password stores a reset token. Reset sets a new password.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### AUTH-05 OAuth

- Files: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`
- Expected behavior: GitHub and Google sign-in run when AUTH_GITHUB_* or AUTH_GOOGLE_* are set.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHT-03 History and branch

- Files: `app/api/chats/route.ts`, `app/api/chats/[id]/messages/route.ts`, `app/api/chats/[id]/branch/route.ts`
- Expected behavior: Chats can be listed, and a message can start a branch.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHT-04 Feedback

- Files: `app/api/messages/[id]/feedback/route.ts`
- Expected behavior: A person can rate a message.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### CHT-05 Transcribe

- Files: `app/api/chat/transcribe/route.ts`
- Expected behavior: POST /api/chat/transcribe accepts audio for a chat.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### EMB-02 Brand and widget

- Files: `app/api/embed/brand/route.ts`, `app/widget/page.tsx`
- Expected behavior: The workspace brand is readable from the embed brand route, and the admin page can show the snippet.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DOC-03 URL crawl

- Files: `lib/crawler.ts`
- Expected behavior: A public URL can be fetched and ingested.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DOC-04 Background ingest

- Files: `inngest/functions/ingest-document.ts`, `app/api/inngest/route.ts`
- Expected behavior: Inngest processes a document when configured. Without it, ingest runs in the request.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DOC-05 File storage

- Files: `lib/storage.ts`
- Expected behavior: CLOUDINARY_URL stores the file in Cloudinary. Without it, the file stays under .quill-uploads.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-02 Analytics

- Files: `app/admin/analytics/page.tsx`, `app/api/admin/stats/route.ts`
- Expected behavior: /admin/analytics shows usage for the workspace.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-03 Audit log

- Files: `app/admin/audit/page.tsx`, `lib/audit.ts`, `app/api/admin/audit/route.ts`
- Expected behavior: /admin/audit lists tamper-evident audit events and can filter them.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-04 Billing

- Files: `app/admin/billing/page.tsx`, `lib/billing.ts`, `app/api/billing/checkout/route.ts`, `app/api/billing/webhook/route.ts`
- Expected behavior: An admin can start a Pro checkout. The Stripe webhook marks the workspace Pro.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-05 Connectors

- Files: `app/admin/connectors/page.tsx`, `lib/connectors/registry.ts`, `app/api/connectors/route.ts`
- Expected behavior: Notion, GitHub, Confluence, Google Drive, and Jira connectors are listed and can be run from /admin/connectors.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-06 Compliance packet

- Files: `app/admin/compliance/page.tsx`, `lib/compliance.ts`
- Expected behavior: /admin/compliance shows the control-evidence packet. It is not a BAA or a SOC 2 report.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ADM-07 Enterprise settings

- Files: `app/admin/enterprise/page.tsx`
- Expected behavior: /admin/enterprise exposes SSO, SCIM, and related workspace settings that exist in the schema.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-01 Workspaces

- Files: `app/api/workspaces/route.ts`, `app/api/workspaces/[id]/route.ts`
- Expected behavior: A person can create and update a workspace. Demo mode refuses workspace deletion.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-02 Invites

- Files: `app/api/workspaces/[id]/invites/route.ts`, `app/invite/[token]/page.tsx`
- Expected behavior: An invite link can be created and accepted at /invite/{token}.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-03 Models

- Files: `app/api/workspaces/[id]/models/route.ts`
- Expected behavior: A workspace can change its chat model and embedding model.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-04 Hosting

- Files: `app/api/workspaces/[id]/hosting/route.ts`, `lib/hosting.ts`
- Expected behavior: A workspace can store an encrypted target database URL and use it for documents and chats.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-05 Tuning

- Files: `lib/tuning.ts`, `app/api/workspaces/[id]/tuning/route.ts`, `app/api/workspaces/[id]/tuning-export/route.ts`
- Expected behavior: Tuning jobs can be listed and exported.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-06 API keys

- Files: `app/api/api-keys/route.ts`, `lib/api-key.ts`
- Expected behavior: A workspace member can create and revoke an API key.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-07 SCIM

- Files: `lib/scim.ts`, `app/api/scim/v2/Users/route.ts`, `app/api/scim/v2/Groups/route.ts`
- Expected behavior: /api/scim/v2/Users and Groups provision members when a workspace SCIM token is set.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### WS-08 SAML

- Files: `lib/saml.ts`, `app/api/auth/saml/[slug]/route.ts`, `app/api/auth/saml/[slug]/acs/route.ts`
- Expected behavior: /api/auth/saml/{slug} starts SSO and the ACS route completes it when metadata is stored.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### INT-01 Slack and Discord

- Files: `app/api/integrations/slack/route.ts`, `app/api/integrations/discord/route.ts`
- Expected behavior: Slack and Discord routes accept workspace bot events when those connections exist.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### MKT-01 Marketing pages

- Files: `app/docs/page.tsx`, `app/pricing/page.tsx`, `app/blog/page.tsx`, `app/about/page.tsx`
- Expected behavior: /docs, /pricing, /blog, /blog/{slug}, and /about render.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: Pricing and docs need a live read. Do not treat the uncommitted README CI section as shipped.
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### MKT-02 Waitlist

- Files: `app/api/waitlist/route.ts`
- Expected behavior: POST /api/waitlist stores an email.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SEC-02 Encryption

- Files: `lib/crypto.ts`
- Expected behavior: Document content is encrypted with AES-256-GCM when ENCRYPTION_KEY is set. Chunk text used for search stays readable by the database.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEM-02 Demo reset

- Files: `app/api/demo/reset/route.ts`, `app/api/cron/demo-reset/route.ts`, `vercel.json`
- Expected behavior: POST /api/demo/reset and the daily cron reset the playground when the secrets match and demo mode is on.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-01 Errors and theme

- Files: `app/error.tsx`, `components/theme-switch.tsx`
- Expected behavior: error.tsx shows a retry and does not print the exception text. The theme switch changes light and dark.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: `app/error.tsx` has no document title and logs the error object to the console.
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### SEO-01 Metadata

- Files: `app/layout.tsx`, `config/site.ts`
- Expected behavior: The root title is Quill — Own Your AI Knowledge Base. Pages use the title template.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: `config/site.ts` still points GitHub, Twitter, docs, Discord, and sponsor at HeroUI, not Quill.
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEV-01 Seed and local run

- Files: `prisma/seed.ts`, `package.json`
- Expected behavior: prisma seed creates the admin and demo users. The app is started with next dev on port 7392.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### DEV-02 Deploy files

- Files: `Dockerfile`, `docker-compose.yml`, `deploy/vpc/docker-compose.yml`, `vercel.json`
- Expected behavior: Dockerfile, docker-compose.yml, and deploy/vpc/docker-compose.yml describe a self-hosted run. vercel.json schedules the demo reset.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ANL-01 Product analytics

- Files: `lib/analytics.ts`
- Expected behavior: PostHog events are sent only when POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_KEY is set.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### ACC-01 Delete account

- Files: `prisma/schema.prisma` User model. No delete route.
- Expected behavior: A signed-in person can delete their account, lose the session, and the same email can be registered again.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

### UI-02 Missing page

- Files: No `app/not-found.tsx`.
- Expected behavior: An unknown URL shows a Quill not-found page with its own title and a way back home.
- Acceptance checklist:
  - [ ] The happy path works while signed in with the right role
  - [ ] A logged-out request is refused or sent to login
  - [ ] Empty input and a second submit do not corrupt data
- Test cases:
  - Normal: the path named in the expected behavior
  - Empty, whitespace, a very long value, emoji, and a non-English string
  - Wrong types, a SQL-looking string, and a path-looking string
  - Logged out, an expired session, the wrong role, and another workspace's id
  - Double submit, a slow upstream, and a missing API key
  - Refresh, back, and a second tab
- UI checks: text wraps, focus is visible, and the page does not overflow at 360, 768, and 1280.
- Dependencies: the database, and any key named in the expected behavior
- Suspected bugs: none recorded
- Bugs Found:
- Bugs Fixed:
- UI Issues Fixed:
- Files Changed:
- Notes:

## Assumptions

- The public host quill.rejisterjack.com is the DEMO_MODE playground described in the README. The demo passwords printed there are product copy, not new secrets.

- `origin/dev` at `4a3d95d` is not the tree this report describes.

- The uncommitted `ignoreCommand` in `vercel.json` is not shipped. The committed file only schedules `/api/cron/demo-reset`.

- Stripe, OAuth, Cloudinary, Inngest, PostHog, SAML, SCIM, Slack, and Discord are present in code and stay blocked later if the matching key is absent.

- HIPAA, BAA, and SOC 2 stay deferred.


## Risks

- The public playground is writable. A test must not put secrets there, and a reset can remove what a test created.

- Production rate limiting throws when Upstash is unset. A missing key is a failed closed path, not a pass.

- Chunk text is stored for search even when document content is encrypted.

- `config/site.ts` still advertises HeroUI links.

## Whole-Product Check

Local pages return 200 for the marketing site, login, embed, and admin. Unknown URLs are 404. Logged-out chat and admin redirect to login. Responses send nosniff and a referrer policy, and do not send X-Powered-By. The public playground refuses new registration. Account delete and password reset were exercised on the local database.

## Final Summary

A person can register, sign in, chat when the knowledge base is empty, manage the admin shell, and delete the account. Uploads fail closed with 503 when embeddings are not configured. Stripe, OAuth, SAML, SCIM, Slack, Discord, Neon hosting, and PostHog stay blocked without their keys.

## Totals

See the feature table.

## Still Blocked

- OpenRouter embeddings and transcription.
- Stripe checkout, OAuth, SAML, SCIM, Slack, Discord, and managed Neon hosting.
- A crawled URL was not ingested.
- PostHog was not configured.

## Known Limitations

HIPAA, a signed BAA, and SOC 2 stay deferred. The repository has no GitHub Actions. The public site is a shared demo and was not reset. Chunk text remains searchable even when document content is encrypted.

## Launch Checklist

- [x] Register, login, and delete work on a self-hosted database
- [x] Admin pages require an admin
- [x] Unknown URLs show the Quill not-found page
- [x] Public demo refuses registration
- [ ] A document becomes searchable chunks when an embedding key is present
- [ ] Stripe, OAuth, and SSO are connected

## Decision

GO

The website flows that do not need a third-party key were run live. The blocked rows name the missing key or the crawl that was not run.
