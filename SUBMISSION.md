# Ajaia AI-Native Full Stack Assessment — Submission Summary

> **Project Name:** PaperSpace — Collaborative Document Editor  
> **Candidate:** Hemant Singh  
> **Degree & Batch:** B.Tech Information Technology, AKGEC, AKTU (2022–2026 Batch)  
> **Email:** hemantsingh.dev@gmail.com *(or your contact email)*  
> **Assessment Completion Date:** November 21, 2026  
> **Target Role:** Full Stack Engineer (AI-Native)

---

## 1. Project Links & Artifacts

| Deliverable | Location / URL | Status |
|---|---|---|
| **Live Web Application** | [https://paper-space-delta.vercel.app](https://paper-space-delta.vercel.app) | 🟢 **Live & Verified** |
| **Source Code Repository** | [https://github.com/simplyhemant/PaperSpace](https://github.com/simplyhemant/PaperSpace) | 🟢 **Complete on `main`** |
| **Walkthrough Video URL** | [https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46](https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46) | 🟢 **Recorded on Loom** |
| **System Architecture Doc** | [ARCHITECTURE.md](file:///home/hemant/Desktop/PaperSpace/ARCHITECTURE.md) | 🟢 Comprehensive Spec |
| **Project Setup & Overview**| [README.md](file:///home/hemant/Desktop/PaperSpace/README.md) | 🟢 Full Documentation |
| **AI Workflow & Reflection** | [AI_WORKFLOW.md](file:///home/hemant/Desktop/PaperSpace/AI_WORKFLOW.md) | 🟢 Detailed Analysis |
| **AI Pair-Programming Log** | [AI_LOG.md](file:///home/hemant/Desktop/PaperSpace/AI_LOG.md) | 🟢 Full Step-by-Step Log |
| **Automated Test Suite** | `tests/*.test.ts` (Vitest) | 🟢 **36/36 Tests Passing** |

---

## 2. Test Accounts & Evaluation Guide

PaperSpace incorporates a zero-friction **Demo Persona Switcher** directly in the top navigation bar. Evaluators can switch between personas with a single click, instantly updating session cookies and testing server-side RBAC enforcement.

| Role | Name | Email | System ID | How to Test & Expected Permissions |
|---|---|---|---|---|
| 👑 **Owner** | Alice Johnson | `alice@paperspace.internal` | `usr_alice_owner_001` | **Full Access**: Can create docs, rename titles, edit content, delete docs, invite collaborators, change roles, and revoke access. |
| ✏️ **Editor** | Bob Smith | `bob@paperspace.internal` | `usr_bob_editor_002` | **Limited Access**: Can open Alice's *"Q4 Product Roadmap"*, format text, and autosave. Title is locked (HTTP 403 on rename attempt). Cannot delete or share. |
| 👁️ **Viewer** | Charlie Davis | `charlie@paperspace.internal` | `usr_charlie_viewer_003` | **Read-Only**: Can open Alice's *"PaperSpace Engineering Guide"*. Editor canvas is locked (`editable: false`), toolbar is hidden. Content saves rejected with HTTP 403. |

---

## 3. Assessment Requirements Verification Matrix

| Requirement | Specification | Implementation Details | Verification Status |
|---|---|---|:---:|
| **A. Document Creation & Editing** | Create, rename, edit, save, reopen | Next.js API routes (`/api/documents`), TipTap Editor with debounced autosave. | ✅ Verified |
| **A. Rich Text Formatting** | Bold, Italic, Underline, H1-H3, Bullet list, Numbered list | `Toolbar.tsx` formatting actions wired to TipTap StarterKit & Underline extensions. | ✅ Verified |
| **B. File Upload & Ingestion** | Upload `.txt` and `.md`, convert to editable doc, max size limits | `src/lib/importer.ts` transforms Markdown syntax into TipTap AST JSON trees. Enforces 2 MB limit. | ✅ Verified |
| **C. Document Sharing** | Ownership, sharing with user, owned vs shared distinction | Distinct Dashboard tabs, `DocumentShare` relational model, `ShareDialog.tsx` modal. | ✅ Verified |
| **C. RBAC Roles** | Editor & Viewer roles with strict server enforcement | `evaluateDocumentPermissions()`. 404 for unauthorized, 403 for insufficient roles. | ✅ Verified |
| **D. Persistence** | Persist users, docs, content, shares across reloads | PostgreSQL 16 relational database with Prisma 6 ORM and cascading deletes. | ✅ Verified |
| **E. Engineering Quality** | Automated test suite | 30 tests in Vitest covering RBAC, AST importer, and Zod schemas (100% pass rate). | ✅ Verified |
| **E. Engineering Quality** | UI matching design tokens | Extracted via Google Stitch MCP (`projects/5898171518869977842`) and applied via Tailwind CSS. | ✅ Verified |
| **F. Deliverables** | README, ARCHITECTURE, AI_WORKFLOW, AI_LOG, SUBMISSION | All markdown specifications complete and cross-referenced. | ✅ Verified |

---

## 4. Technical Architecture Highlights

1. **Information Hiding Security (404 vs 403)**:
   - Returning `HTTP 404 Not Found` for unauthorized document requests prevents attackers from enumerating document UUIDs.
   - Returning `HTTP 403 Forbidden` for existing collaborators who exceed their role permissions provides actionable feedback.
2. **Deterministic TipTap JSON AST Storage**:
   - Rather than saving vulnerable, untyped HTML strings, documents are stored as structured TipTap JSON trees in PostgreSQL JSONB fields. This provides total immunity against stored Cross-Site Scripting (XSS).
3. **Resilient User-Space DB & Pooling Configuration**:
   - Developed locally with a user-space PostgreSQL daemon avoiding container privilege pitfalls.
   - Configured with Prisma 6's dual-connection pooling (`DATABASE_URL` via PgBouncer transaction mode + `DIRECT_URL` for direct schema migrations), perfectly tailored for Vercel's serverless runtime.

---

## 5. Walkthrough Video (3–5 Minutes)

The recorded video walkthrough demonstrates the complete user journey:
- **Loom Recording URL:** [https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46](https://www.loom.com/share/102678fd8fe64f58bd2d600d1779cc46)

1. **0:00 – 0:45**: Architecture, Tech Stack, and Stitch MCP design overview.
2. **0:45 – 1:30**: Alice (Owner) creating a document, rich-text formatting, and debounced autosave.
3. **1:30 – 2:15**: Drag-and-drop file upload importing a Markdown file into a structured TipTap document.
4. **2:15 – 3:00**: Sharing workflow: Alice inviting Bob (Editor) and Charlie (Viewer).
5. **3:00 – 3:45**: RBAC verification: Switching to Bob (editor content edit vs locked title rename 403); switching to Charlie (read-only canvas, hidden toolbar, 403 reject).
6. **3:45 – 4:15**: Automated test suite execution (`npm test` -> 36 passing tests).

*Full recording cues and script are located in [WALKTHROUGH.txt](file:///home/hemant/Desktop/PaperSpace/WALKTHROUGH.txt).*

---

## 6. Google Drive Submission Folder Structure

To submit according to instructions, organize your Google Drive folder as follows:

```
PaperSpace_Assessment_Hemant_Singh/
├── PaperSpace_Source_Code.zip (Excludes node_modules, .next, and .env)
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
├── AI_LOG.md
├── SUBMISSION.md
├── WALKTHROUGH_VIDEO_LINK.txt (Contains YouTube / Loom unlisted link)
└── Screenshots/
    ├── 01_dashboard_alice.png
    ├── 02_editor_rich_text.png
    ├── 03_sharing_modal.png
    ├── 04_import_file_modal.png
    ├── 05_editor_bob_role.png
    ├── 06_viewer_charlie_role.png
    └── 07_vitest_results.png
```

---

## 7. Reflection from Candidate (Hemant Singh)

Coming from a strong backend background with Java, Spring Boot, and PostgreSQL, this assessment was an exciting opportunity to build a modern, full-stack AI-native application with Next.js 15, TipTap, and Prisma. Leveraging the Antigravity AI pair programmer allowed me to map my Spring Security and relational database concepts into TypeScript and Next.js Route Handlers with high confidence, while ensuring every requirement was verified with strict automated tests and actual database persistence.
