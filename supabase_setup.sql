-- ==============================================================================
-- PaperSpace — Supabase One-Click Database Setup & Seed Script
-- Run this directly in your Supabase Project -> SQL Editor -> Click "Run"
-- ==============================================================================

-- 1. Create Enums and Types
DO $$ BEGIN
  CREATE TYPE "ShareRole" AS ENUM ('EDITOR', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Document',
    "content" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "document_shares" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ShareRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- 3. Create Indexes & Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "documents_ownerId_idx" ON "documents"("ownerId");
CREATE INDEX IF NOT EXISTS "document_shares_documentId_idx" ON "document_shares"("documentId");
CREATE INDEX IF NOT EXISTS "document_shares_userId_idx" ON "document_shares"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "document_shares_documentId_userId_key" ON "document_shares"("documentId", "userId");

-- 4. Foreign Key Constraints with Cascade Deletes
DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Seed 3 Demo Users (Alice, Bob, Charlie)
INSERT INTO "users" ("id", "name", "email", "avatarUrl", "createdAt")
VALUES
('usr_alice_owner_001', 'Alice Johnson', 'alice@paperspace.internal', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOA3suRUvT7ltpPcCOkTxKWuphnUaH24ATedS_j6Wb-MN1q8_GwAxMIvfaJyz1PGY5aPOOndE4HM-ffZRRLcsP6FSHPdyH5GQWjg75UXPQ5T-F0j4hizTUeSx97SmyWueZeR6cpXW3KJwwo4QeNL-FaucB_-xZxcvlZ5jbk1Z4vpvm_nyCXL6wzHnTRIGd-oBMaqWT_z69ALbgdm-71YxnGQdqS0-MvQfjdSMBThI', NOW()),
('usr_bob_editor_002', 'Bob Smith', 'bob@paperspace.internal', NULL, NOW()),
('usr_charlie_viewer_003', 'Charlie Davis', 'charlie@paperspace.internal', NULL, NOW())
ON CONFLICT ("id") DO NOTHING;

-- 6. Seed 4 Sample Documents
INSERT INTO "documents" ("id", "title", "content", "ownerId", "createdAt", "updatedAt")
VALUES
('doc_prd_paperspace_001', 'Product Requirements — PaperSpace 2.0', '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Product Requirements — PaperSpace 2.0", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "Core features, permissions model, and offline sync notes for immediate engineering handoff.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"text": "Key Objectives", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Fast Rich-Text Editing", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Full formatting support including bold, italic, underline, headings, and lists.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Granular RBAC", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Strict server-side permission checks for Owners, Editors, and Viewers.", "type": "text"}]}]}]}]}'::jsonb, 'usr_alice_owner_001', NOW(), NOW()),
('doc_arch_notes_002', 'Engineering Architecture Notes', '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "System Architecture Notes", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "PostgreSQL relational persistence via Prisma ORM with atomic transaction support and serverless connection pooling.", "type": "text"}]}]}'::jsonb, 'usr_alice_owner_001', NOW(), NOW()),
('doc_marketing_launch_003', 'Marketing Campaign Launch Brief', '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Marketing Campaign Launch Brief", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "GTM strategy, newsletter cadence, and Product Hunt launch checklist for release day coordination.", "type": "text"}]}]}'::jsonb, 'usr_bob_editor_002', NOW(), NOW()),
('doc_security_audit_004', 'Security & Compliance Review', '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Security & Compliance Review", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "SOC2 readiness checklist and internal audit report spanning access policies and database backups.", "type": "text"}]}]}'::jsonb, 'usr_charlie_viewer_003', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 7. Seed Document Sharing Relationships
INSERT INTO "document_shares" ("id", "documentId", "userId", "role", "createdAt")
VALUES
('share_prd_bob', 'doc_prd_paperspace_001', 'usr_bob_editor_002', 'EDITOR', NOW()),
('share_prd_charlie', 'doc_prd_paperspace_001', 'usr_charlie_viewer_003', 'VIEWER', NOW()),
('share_marketing_alice', 'doc_marketing_launch_003', 'usr_alice_owner_001', 'EDITOR', NOW()),
('share_security_alice', 'doc_security_audit_004', 'usr_alice_owner_001', 'VIEWER', NOW())
ON CONFLICT ("id") DO NOTHING;
