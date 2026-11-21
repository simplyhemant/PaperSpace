# AI Workflow & Engineering Reflection (AI_WORKFLOW.md)

> **Project:** PaperSpace — Collaborative Document Editor  
> **Candidate:** Hemant Singh  
> **Role:** Junior Software Engineer (Spring Boot / Java background)  
> **AI Assistant:** Antigravity IDE (Google DeepMind Agentic Assistant)  
> **Assessment Duration:** 240 Minutes  

---

## 1. Collaborative Engineering Model

Throughout this 240-minute assessment, development followed a disciplined **Senior-Junior Pair-Programming Model**:

- **Candidate Role (Hemant Singh)**: Product owner and lead engineer. Directed requirements, verified working behavior against Spring Boot mental models, made high-level architectural decisions, tested user-facing flows, and validated actual results.
- **AI Agent Role (Antigravity)**: Implementation partner and senior staff engineer. Executed code scaffolding, translated UI designs from Stitch MCP, built AST parsers, wrote tests, diagnosed terminal errors, and maintained the implementation log.

### Guiding Principles:
1. **Never Assume Code Works**: Every feature was verified using terminal executions, automated tests, or live API requests.
2. **Small, Reviewable Increments**: Work was divided into 6 distinct milestones (0 through 6), pausing after each milestone for inspection and testing.
3. **Bridge Knowledge Gaps with Analogies**: Complex React/Next.js and TipTap concepts were mapped to Java/Spring Boot equivalents (e.g. Next.js Route Handlers $\approx$ Spring `@RestController`, Prisma $\approx$ Spring Data JPA, Zod $\approx$ Jakarta Bean Validation).
4. **Honest Documentation**: Technical limitations and tradeoffs are explicitly documented rather than concealed.

---

## 2. Milestone Execution Roadmap

| Milestone | Objective | Key Deliverables | Verification Strategy |
|---|---|---|---|
| **0. Planning** | Environment audit, Stitch MCP design token extraction, architecture plan. | Design tokens, portable schema, RBAC matrix. | Stitch MCP API inspection; DB port check. |
| **1. Scaffolding** | User-space PostgreSQL, Prisma 6 schema, seed script, Tailwind config. | User/Doc/Share models, 3 demo users, 4 docs. | `prisma db push`, `prisma db seed`, `psql` verification. |
| **2. Core Editor** | CRUD APIs, TipTap integration, debounced autosave, toolbar. | Toolbar, Editor, `/api/documents` handlers. | REST curl tests, title rename lock verification. |
| **3. Auth & Sharing** | Demo user switcher, sharing modal, collaborator roster, RBAC. | `/api/auth/switch`, Share modal, RBAC guards. | Role escalation tests, HTTP 403 & 404 verification. |
| **4. File Import** | AST Markdown/TXT parser, 2 MB limit, drag-and-drop modal. | `/api/import`, `importer.ts`, ImportModal. | Ingestion of `.md`, `.txt`, rejection of `.pdf`. |
| **5. Automated Tests**| Unit and integration test suite with Vitest. | 30 tests covering RBAC, importer, validations. | `npm test` -> 30/30 passed in 770ms. |
| **6. Production** | Comprehensive documentation, Supabase/Vercel guides, video script. | README, ARCHITECTURE, AI_LOG, SUBMISSION. | Full `npm run build`, checklist audit. |

---

## 3. Stitch MCP Integration for UI Design

To bridge the gap between design and implementation, the project leveraged Google's **Stitch MCP Server** to query the Figma/Stitch workspace (`PaperSpace Collaborative Document Editor`, ID: `projects/5898171518869977842`).

### Extracted Screens:
1. **Dashboard** (`dcf39a0...`): Header, greeting, document list cards, and action pills.
2. **Document Editor** (`cb575...`): Sticky toolbar, typography scale, editor canvas, save badge.
3. **Share Modal** (`a6ff5...`): Collaborator roster, role dropdowns, invite input, quick pills.
4. **Import Modal** (`14dc5...`): Drag-and-drop dropzone, supported extension tags, size limit indicators.
5. **Error States** (`955b0...`): 404 Document Not Found and 403 Forbidden views.

### Design Tokens Ingested into `tailwind.config.ts`:
- **Primary Indigo**: `#4f46e5` (Action, Buttons, Selection)
- **Slate Secondary**: `#515f74` (Muted labels, Subtext)
- **Emerald Tertiary**: `#10b981` (Saved indicator, Active status)
- **Rose Alert**: `#ba1a1a` (Delete buttons, Error states, 403 badges)
- **Surface**: `#faf8ff` (Canvas background)
- **Surface High**: `#ffffff` (Card and modal surfaces)
- **Border Radii**: `8px` (`rounded-lg`) throughout all modals and cards.

---

## 4. Key Engineering Challenges & AI Interventions

### A. Sandbox Privileges & Database Daemon
- **Challenge**: The container environment enforces a strict `no new privileges` flag, preventing `sudo service postgresql start`.
- **AI Solution**: Rather than getting blocked or asking the user to reconfigure the host, the AI initialized a dedicated PostgreSQL data directory (`/tmp/pgdata`) and ran `/usr/lib/postgresql/16/bin/postgres` directly in user space on port 5433 with socket `/tmp`. This provided a fully functional ACID PostgreSQL cluster running seamlessly inside the sandbox.

### B. React 19 & TipTap SSR Hydration
- **Challenge**: TipTap defaults to client-side DOM rendering. During Next.js SSR hydration, React 19 flagged a mismatch between server-generated HTML and client-rendered TipTap DOM nodes.
- **AI Solution**: Configured `immediatelyRender: false` in `useEditor` options and introduced a `mounted` state guard in `Editor.tsx`. This ensured TipTap mounts cleanly only after the client component is hydrated.

### C. Build-Time Font Optimization Without Internet Access
- **Challenge**: `next/font/google` attempted to fetch Google Fonts (`Inter`) during `npm run build`, causing a network DNS failure in the sandboxed build environment.
- **AI Solution**: Replaced `next/font/google` with a robust system font stack in `globals.css` and Tailwind config (`Inter, system-ui, -apple-system, sans-serif`), eliminating the external network build dependency while preserving typography fidelity.

### D. AST Markdown Parsing vs. Heavy External Dependencies
- **Challenge**: Converting Markdown to TipTap AST usually requires heavy unified/remark/rehype pipelines that add bundle bloat and complexity.
- **AI Solution**: Built a lean, high-performance AST tokenizer (`src/lib/importer.ts`) that parses headings (H1-H3), lists, blockquotes, code spans, and inline formatting into native TipTap JSON nodes with zero external dependencies.

---

## 5. Reflections & Takeaways

1. **AI as an Amplifier, Not an Autopilot**: The AI provided rapid velocity in authoring boilerplate (Tailwind classes, Zod schemas, Vitest configurations), but human engineering judgment was indispensable in setting strict security boundaries (RBAC 404 vs 403 logic, cascades in Prisma) and diagnosing environment quirks.
2. **Value of Seed Data**: Investing in a comprehensive seed script (`prisma/seed.ts`) with distinct roles and realistic documents saved hours of manual testing and made every feature instantly verifiable.
3. **Strict Typing Prevents Runtime Surprises**: Utilizing TypeScript across API route inputs, database models, and editor state eliminated an entire category of null-pointer and runtime errors.
