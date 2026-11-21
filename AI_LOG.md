# AI Development & Pair-Programming Log (AI_LOG.md)

This log is maintained continuously throughout the 240-minute Ajaia AI-Native Assessment for **PaperSpace**, documenting prompts, decisions, AI contributions, issues encountered, fixes, and actual verification outcomes.

---

### Milestone 0 — Planning, Architecture & Design Tokens Extraction

**Prompt used:**
- Initial master instructions: Plan a lightweight collaborative document editor (Google Docs inspired) with Next.js 15 App Router, TypeScript, Tailwind CSS, TipTap, Prisma 6, PostgreSQL (local first, then Supabase), Zod, Vitest, Vercel deployment, server-side RBAC, and file import.
- UI task instruction: Connect to Stitch MCP, extract all PaperSpace screens and design tokens (colors, fonts, spacing, radii, shadows) in 10 lines or fewer.

**Implementation:**
- Verified workspace environment (Node `v22.23.3`, npm `10.9.9`, PostgreSQL 16.15 installed).
- Queried Stitch MCP server for project `PaperSpace Collaborative Document Editor` (`projects/5898171518869977842`).
- Extracted all 6 screens and design states: Dashboard (`dcf39a0...`), Document Editor (`cb575...`), Share Modal (`a6ff5...`), Import Modal (`14dc5...`), Error States (`955b0...`), and Prototype (`54e75...`).
- Generated a concise 9-point Design Token specification: Primary Indigo (`#4f46e5`, `#3525cd`), Slate Secondary (`#515f74`, `#d5e3fc`), Emerald Tertiary (`#10b981`, `#006e4b`), Canvas Surface (`#faf8ff`, `#ffffff`, `#131b2e`), Inter typography scale, and 8px border radii.
- Designed portable Prisma schema and RBAC permission matrix (404 for unknown/unauthorized, 403 for insufficient role).

**AI contribution:**
- Utilized Stitch MCP tool suite (`list_projects`, `list_screens`, `download_file`) to inspect the designer's HTML/CSS and exact tokens.
- Formulated Spring Boot analogies to clarify Next.js App Router and Prisma concepts for the candidate.
- Outlined a strict 240-minute milestone roadmap to guarantee timely delivery.

**Mistakes or issues:**
- Initial `service postgresql status` indicated default cluster down.
- Attempting `sudo service postgresql start` failed because container environment runs with unprivileged user without sudo rights (`no new privileges` flag).
- `create-next-app` failed due to npm restriction on uppercase letters in directory name `PaperSpace`.

**Fixes:**
- Successfully initialized user-space PostgreSQL instance using `/usr/lib/postgresql/16/bin/postgres` bound to Unix domain socket `/tmp` and port 5433, running seamlessly inside the sandbox without sudo.
- Authored custom `package.json` with lowercase package name `paperspace` and pinned dependencies (`next@15.1.7`, `@prisma/client@6.4.1`, `@tiptap/react`, `lucide-react`, `zod`, `vitest`).

**Verification:**
- Executed `createdb -h /tmp -p 5433 paperspace` and connected via `psql "postgresql://hemant@localhost:5433/paperspace?host=/tmp"` successfully returning `current_database = paperspace`, `current_user = hemant`.
- Downloaded and inspected HTML code for all Stitch design screens.

**Untested:**
- Supabase production connection (scheduled for deployment phase).

---

### Milestone 1 — Scaffold + PostgreSQL + Tailwind Tokens + Seed Data

**Prompt used:**
- "ok" to approve Milestone 1: scaffold Next.js 15, configure Tailwind with Stitch design tokens, configure Prisma 6 with local PostgreSQL, author seed script with 3 demo users, test build and verification.

**Implementation:**
- Initialized Git repository with proper `.gitignore` excluding `.env`, `.next`, and `node_modules`.
- Configured `tailwind.config.ts` mapping all Stitch MCP tokens: `primary.container` (`#4f46e5`), `surface` (`#faf8ff`), `surface.container-lowest` (`#ffffff`), `error` (`#ba1a1a`), and `Inter` sans font family.
- Defined portable Prisma schema in `prisma/schema.prisma` with `User`, `Document`, and `DocumentShare` models, compound unique keys, and cascading delete rules.
- Wrote `prisma/seed.ts` seeding 3 demo users: Alice Johnson (Owner), Bob Smith (Editor), Charlie Davis (Viewer) alongside 4 sample documents representing various ownership and share permissions.
- Implemented core libraries: `src/lib/prisma.ts` (singleton), `src/lib/auth.ts` (cookie-based demo session resolver), `src/lib/permissions.ts` (RBAC matrix helper), `src/lib/validations.ts` (Zod schemas), and `src/types/index.ts`.
- Created `.env.example` and local `.env` pointing to `postgresql://hemant@localhost:5433/paperspace?host=/tmp`.
- Built homepage (`src/app/page.tsx`) and custom 404 page (`src/app/not-found.tsx`).

**AI contribution:**
- Applied the design system tokens retrieved from Stitch MCP directly into Tailwind's theme configuration.
- Crafted robust singleton Prisma instance and type-safe server RBAC permission evaluator.
- Fixed database connection and seeding scripts to work in a sandbox-friendly environment.

**Mistakes or issues:**
- Next.js build failed during font optimization due to `next/font/google` attempting to fetch Inter from `fonts.googleapis.com` without network access in the sandboxed build step.
- `ts-node` failed on initial seed invocation due to JSON escaping inside `package.json` seed command string.

**Fixes:**
- Replaced `next/font/google` with local CSS font-family stack in `globals.css` and Tailwind config (`font-sans`), eliminating external network dependency at build time.
- Configured `"ts-node"` options directly inside `tsconfig.json` and simplified the seed script to `ts-node prisma/seed.ts`.

**Verification:**
- Executed `npx prisma generate`: Generated Prisma Client v6.19.3.
- Executed `npx prisma db push`: Synchronized schema with PostgreSQL database `paperspace` on port 5433.
- Executed `npx prisma db seed`: Successfully seeded Alice Johnson, Bob Smith, Charlie Davis, and 4 documents with shares.
- Executed `psql` queries verifying all 3 users and 4 documents in the database.
- Executed `npx tsc --noEmit`: 0 TypeScript errors.
- Executed `npm run build`: Production build succeeded (`Compiled successfully`, static page generation 4/4).

**Untested:**
- Supabase production connection (Supabase credentials will be configured before live deploy).

---

### Milestone 2 — Documents CRUD + TipTap Editor + Debounced Autosave

**Prompt used:**
- "DB name: paperspace, username=postgres, password=project, connect this then start with Milestone 2"

**Implementation:**
- Configured role `postgres` with password `project` on PostgreSQL cluster and updated `.env` to `postgresql://postgres:project@localhost:5433/paperspace?host=/tmp`. Verified connection and re-seeded.
- Implemented `/api/documents` Route Handler:
  - `GET`: Returns owned documents and shared documents separated for the active demo user.
  - `POST`: Validates title with Zod, creates initial structured TipTap document JSON tree in PostgreSQL, assigns ownership to active user.
- Implemented `/api/documents/[id]` Route Handler:
  - `GET`: Evaluates permissions via `evaluateDocumentPermissions()`. Returns HTTP 404 if user has no access (prevents document enumeration). Returns document, permissions, and collaborator list.
  - `PATCH`: Validates payload. Enforces `canRename` (Owner only) and `canEditContent` (Owner & Editor). Returns HTTP 403 Forbidden if a Viewer attempts to edit content or if an Editor attempts to rename.
  - `DELETE`: Enforces `canDelete` (Owner only). Returns HTTP 403 Forbidden for non-owners.
- Implemented `src/components/Toolbar.tsx`:
  - Formatting controls: Headings (H1, H2, H3), Bold, Italic, Underline, Bulleted list, Numbered list, Blockquote, Code block, Undo, Redo.
  - Automatically hidden/disabled when the editor is in read-only mode (`editable: false`).
- Implemented `src/components/Editor.tsx`:
  - TipTap React wrapper with `StarterKit` and `Underline` extensions.
  - `immediatelyRender: false` for clean React 19 / SSR compatibility.
  - Debounced autosave (1000ms delay) with queuing to prevent overlapping HTTP requests.
  - Emits real-time save states: `saving`, `saved`, `error`, and `unsaved`.
- Implemented `src/app/documents/[id]/page.tsx`:
  - Document sub-header with Back button, editable title input for Owners (locked with lock icon for non-owners), live save status pill (`Saved`, `Saving...`, `Save failed`), and role pill badge.
  - View-only alert banner for Viewers notifying that edit access is restricted.
- Implemented `src/app/dashboard/page.tsx`:
  - Segmented sections: "My Documents" and "Shared With Me".
  - "New Document" button that persists a new document and navigates directly to the editor.

**AI contribution:**
- Built UI components matching the design specifications downloaded from Stitch MCP (`Document Editor — PaperSpace` and `Dashboard — Documents`).
- Implemented race-condition-free debounced autosave queue in `Editor.tsx`.
- Strictly enforced server-side RBAC (404 for unknown/unauthorized, 403 for insufficient role) on every route handler.

**Mistakes or issues:**
- TypeScript error on Lucide React `<Lock ... />` icon receiving `title` attribute directly (Lucide SVG props disallow direct HTML `title` prop).

**Fixes:**
- Wrapped the `<Lock />` icon in a `<span title="Title locked">` tag, satisfying TypeScript and maintaining tooltip behavior.

**Verification:**
- Executed `npx tsc --noEmit`: 0 TypeScript errors.
- Executed `npm run build`: Production build succeeded with all 6 routes generated.
- Executed `curl` tests against live dev server:
  - `GET /api/documents`: 200 OK returning owned and shared documents.
  - `POST /api/documents`: 201 Created creating new document.
  - `PATCH /api/documents/[id]` (rename): 200 OK updating title.
  - `PATCH /api/documents/[id]` (content): 200 OK saving TipTap JSON structure.
  - `PATCH /api/documents/[id]` as Viewer: 403 Forbidden ("You have view-only access to this document").
  - `GET /api/documents/unknown-id`: 404 Not Found ("Document not found").

**Untested:**
- Multi-user concurrent autosave conflict resolution (single-user debounced autosave with RBAC is active as designed).
