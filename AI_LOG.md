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
