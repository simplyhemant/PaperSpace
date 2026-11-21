# PaperSpace — Collaborative Document Editor

> **Ajaia AI-Native Full Stack Developer Assessment**  
> **Candidate:** Hemant Singh  
> **Live Deployment:** [https://paper-space-delta.vercel.app](https://paper-space-delta.vercel.app)  
> **Repository:** [https://github.com/simplyhemant/PaperSpace](https://github.com/simplyhemant/PaperSpace)  
> **Walkthrough Video:** [https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46](https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46)

---

## 1. Project Overview

**PaperSpace** is a lightweight, responsive, and secure collaborative document editor inspired by Google Docs. Built specifically for Ajaia's timed 240-minute AI-Native Full Stack Developer Assessment, PaperSpace combines intuitive rich-text editing with robust server-side Role-Based Access Control (RBAC), multi-format file ingestion, debounced autosave, and lightweight demo persona switching.

The user interface was designed and extracted using Google's **Stitch MCP** (`projects/5898171518869977842`), adhering strictly to modern design tokens (Deep Indigo, Slate, Emerald, Inter typography, 8px radii) and providing dedicated views for Dashboard, Document Editor, Sharing Dialog, and File Import Modal.

---

## 2. Key Features

### A. Document Creation & TipTap Rich-Text Editing
- **Interactive Toolbar**: Formatting controls for Headings (H1, H2, H3), Bold, Italic, Underline, Bulleted Lists, Numbered Lists, Blockquotes, Code Blocks, Undo, and Redo.
- **TipTap JSON AST**: All document content is stored as structured TipTap JSON trees in PostgreSQL—preventing raw HTML injection and enabling structured document processing.
- **Title Renaming**: In-line document renaming with 200-character validation.
- **Debounced Autosave**: Automatic saving with a 1000ms debounce window. Real-time visual status badge transitions through `Saved` (Emerald check), `Saving...` (Indigo pulse), and `Save failed` (Rose alert).

### B. File Upload & Ingestion (.txt & .md)
- **Supported Formats**: `.md` (Markdown) and `.txt` (Plain text) up to **2 MB**.
- **AST Parsing Engine**: Custom line-tokenizing parser (`src/lib/importer.ts`) that converts Markdown headings (`#`, `##`, `###`), lists (`*`, `-`, `1.`), blockquotes (`>`), and inline marks (`**bold**`, `*italic*`, `` `code` ``) into structured TipTap JSON AST nodes.
- **User-Friendly Import Modal**: Drag-and-drop file dropzone with instant size calculation, extension whitelist checking, and direct redirect to the editor upon creation.

### C. Server-Side Role-Based Access Control (RBAC) & Sharing
- **Roles**:
  - **OWNER**: Full rights (View, Edit content, Rename title, Delete, Share document, Change collaborator roles, Revoke access).
  - **EDITOR**: Can view and edit content. Cannot rename title (HTTP 403), cannot delete (HTTP 403), cannot manage shares (HTTP 403).
  - **VIEWER**: Read-only access. Editor canvas is locked (`editable: false`), toolbar is hidden, content cannot be saved (HTTP 403), cannot rename or delete (HTTP 403).
- **Security by Design (Information Hiding)**:
  - Unauthorized users or nonexistent documents return **HTTP 404 Not Found** (preventing private document UUID enumeration).
  - Valid collaborators attempting unauthorized operations receive **HTTP 403 Forbidden**.
- **Collaborator Management**: Interactive modal allowing owners to add collaborators by email, change their roles on the fly, or revoke access with one click.

### D. Demo Authentication & Persona Switcher
- Fast, zero-friction persona switcher in the navigation bar using secure HttpOnly cookies (`demo_user_id`).
- Pre-seeded with 3 realistic test personas:
  1. **Alice Johnson** (`alice@paperspace.internal`) — Document Owner
  2. **Bob Smith** (`bob@paperspace.internal`) — Editor
  3. **Charlie Davis** (`charlie@paperspace.internal`) — Viewer

---

## 3. Technology Stack

| Layer | Technology | Rationale & Analogy |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Unified full-stack React framework with server-side API Route Handlers. |
| **Language** | TypeScript | Strict compile-time type safety across API contracts and UI state. |
| **Styling** | Tailwind CSS | Utility-first CSS configured with tokens extracted from Stitch MCP. |
| **Editor** | TipTap 2.x (`@tiptap/react`, StarterKit, Underline) | Headless rich-text framework storing pure JSON AST. |
| **Icons** | Lucide React | Lightweight, accessible SVG icon set. |
| **ORM** | Prisma 6 (`@prisma/client`) | Type-safe query builder and migrations (analogous to Spring Data JPA / Hibernate). |
| **Database** | PostgreSQL 16 (Local & Supabase) | ACID-compliant relational storage with JSONB support. |
| **Validation** | Zod | Runtime schema validation for API request payloads (analogous to Jakarta Bean Validation / `@Valid`). |
| **Testing** | Vitest | Lightning-fast test runner with ESM and path alias support (analogous to JUnit 5). |
| **Deployment**| Vercel | Zero-configuration serverless hosting for Next.js and Route Handlers. |

---

## 4. Test Credentials & Demo Accounts

The database comes pre-seeded with three demo accounts:

| Persona | Name | Email | System ID | Default Permissions |
|---|---|---|---|---|
| 👑 **Owner** | Alice Johnson | `alice@paperspace.internal` | `usr_alice_owner_001` | Owns 3 documents. Can edit, rename, share, delete. |
| ✏️ **Editor** | Bob Smith | `bob@paperspace.internal` | `usr_bob_editor_002` | Has EDITOR role on Alice's Q4 Planning doc. Owns 1 doc. |
| 👁️ **Viewer** | Charlie Davis | `charlie@paperspace.internal` | `usr_charlie_viewer_003` | Has VIEWER role on Alice's Architecture doc. Cannot edit. |

### Pre-Seeded Documents:
1. **PaperSpace Engineering Guide & Architecture** (Owned by Alice; Charlie is Viewer)
2. **Q4 Product Roadmap & Sprint Planning** (Owned by Alice; Bob is Editor)
3. **Private Security Audit & Compliance Log** (Owned by Alice; strictly private)
4. **Bob's Database Indexing Scratchpad** (Owned by Bob)

---

## 5. Local Setup & Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js 22 LTS)
- PostgreSQL 14+ running locally (or a Supabase connection URL)
- npm or pnpm

### Step 1: Clone the Repository
```bash
git clone https://github.com/hemant-singh-dev/paperspace.git
cd paperspace
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
# Database connection for Prisma
DATABASE_URL="postgresql://postgres:project@localhost:5433/paperspace"

# Direct URL for Prisma migrations (same as DATABASE_URL for local development)
DIRECT_URL="postgresql://postgres:project@localhost:5433/paperspace"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Run Database Migrations & Seed
```bash
# Push schema to database
npx prisma db push

# Seed test users and initial documents
npx prisma db seed
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app defaults to **Alice Johnson (Owner)**.

---

## 6. Running Automated Tests

The project includes 30 automated unit and integration tests written in Vitest covering security RBAC, Markdown AST ingestion, and Zod validation schemas.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Breakdown:
- `tests/permissions.test.ts` (6 tests): OWNER, EDITOR, VIEWER, and UNAUTHORIZED access matrices.
- `tests/importer.test.ts` (11 tests): Heading levels, lists, blockquotes, inline marks, plain text, and title derivation.
- `tests/validations.test.ts` (13 tests): Document creation, renaming limits, email sharing validation, user switching, file size/format constraints.

---

## 7. Supabase & Vercel Deployment Guide

### A. Supabase PostgreSQL Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **Project Settings > Database**:
   - Copy the **Connection String (Transaction Pooler - port 6543)** -> this is your `DATABASE_URL`.
   - Copy the **Connection String (Direct - port 5432)** -> this is your `DIRECT_URL`.
3. In your local terminal, apply the schema and seed data to Supabase:
   ```bash
   DATABASE_URL="your-supabase-transaction-pooler-url" \
   DIRECT_URL="your-supabase-direct-url" \
   npx prisma db push

   DATABASE_URL="your-supabase-transaction-pooler-url" \
   DIRECT_URL="your-supabase-direct-url" \
   npx prisma db seed
   ```

### B. Vercel Deployment
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `PaperSpace` repository.
4. Under **Environment Variables**, configure:
   - `DATABASE_URL`: Your Supabase Transaction Pooler URL (`pgbouncer=true`).
   - `DIRECT_URL`: Your Supabase Direct URL.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g. `https://paperspace-collaboration.vercel.app`).
5. Click **Deploy**. Vercel will build Next.js, run `prisma generate`, and publish the app.

---

## 8. Limitations & Engineering Tradeoffs

1. **Collaboration Model (Debounced Autosave vs. CRDT/WebSockets)**:
   - *Decision*: Implemented 1000ms debounced autosave over REST rather than multi-cursor operational transformation (Yjs / Liveblocks / WebSockets).
   - *Rationale*: For a 240-minute timed assessment, a rock-solid debounced REST autosave guarantees data integrity, simple deployment on serverless Vercel, and zero external synchronization dependencies.
2. **Authentication (Demo Cookie vs. OAuth/JWT)**:
   - *Decision*: Lightweight HttpOnly cookie-based persona switcher.
   - *Rationale*: Allows evaluators to switch between Owner, Editor, and Viewer in 1 click without filling out sign-up forms, while still strictly enforcing RBAC on the server.
3. **File Import Scope**:
   - *Decision*: Full native Markdown and Plain Text import up to 2 MB.
   - *Rationale*: DOCX import requires binary zip unpacking and XML parsing (`mammoth`), which introduces significant attack surface and maintenance overhead within assessment time limits.
4. **Row Level Security (RLS)**:
   - *Decision*: Enforced server-side in Next.js Route Handlers rather than database-level Supabase RLS.
   - *Rationale*: Prisma connects as a privileged backend role (`postgres`). Enforcing RBAC at the application layer provides unified validation, detailed error messages, and seamless portability across any PostgreSQL provider.

---

## 9. Submission Deliverables Summary

- [x] Full Source Code in Next.js 15 App Router & TypeScript
- [x] [README.md](file:///home/hemant/Desktop/PaperSpace/README.md)
- [x] [ARCHITECTURE.md](file:///home/hemant/Desktop/PaperSpace/ARCHITECTURE.md)
- [x] [AI_WORKFLOW.md](file:///home/hemant/Desktop/PaperSpace/AI_WORKFLOW.md)
- [x] [AI_LOG.md](file:///home/hemant/Desktop/PaperSpace/AI_LOG.md)
- [x] [SUBMISSION.md](file:///home/hemant/Desktop/PaperSpace/SUBMISSION.md)
- [x] [WALKTHROUGH.txt](file:///home/hemant/Desktop/PaperSpace/WALKTHROUGH.txt) & [Loom Video](https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46)
- [x] 36 Passing Automated Tests (`npm test`)
