import { PrismaClient, ShareRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PaperSpace database seeding...");

  // Clean existing data
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed 3 Demo Users
  const alice = await prisma.user.create({
    data: {
      id: "usr_alice_owner_001",
      name: "Alice Johnson",
      email: "alice@paperspace.internal",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOA3suRUvT7ltpPcCOkTxKWuphnUaH24ATedS_j6Wb-MN1q8_GwAxMIvfaJyz1PGY5aPOOndE4HM-ffZRRLcsP6FSHPdyH5GQWjg75UXPQ5T-F0j4hizTUeSx97SmyWueZeR6cpXW3KJwwo4QeNL-FaucB_-xZxcvlZ5jbk1Z4vpvm_nyCXL6wzHnTRIGd-oBMaqWT_z69ALbgdm-71YxnGQdqS0-MvQfjdSMBThI",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "usr_bob_editor_002",
      name: "Bob Smith",
      email: "bob@paperspace.internal",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: "usr_charlie_viewer_003",
      name: "Charlie Davis",
      email: "charlie@paperspace.internal",
    },
  });

  console.log(`Created demo users: Alice (${alice.email}), Bob (${bob.email}), Charlie (${charlie.email})`);

  // Document 1: Owned by Alice, shared with Bob (EDITOR) and Charlie (VIEWER)
  const doc1 = await prisma.document.create({
    data: {
      id: "doc_prd_paperspace_001",
      title: "Product Requirements — PaperSpace 2.0",
      ownerId: alice.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Product Requirements — PaperSpace 2.0" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Core features, permissions model, and offline sync notes for immediate engineering handoff.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Key Objectives" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Fast Rich-Text Editing" },
                      { type: "text", text: ": Full formatting support including bold, italic, underline, headings, and lists." },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Granular RBAC" },
                      { type: "text", text: ": Strict server-side permission checks for Owners, Editors, and Viewers." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: bob.id,
      role: ShareRole.EDITOR,
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: charlie.id,
      role: ShareRole.VIEWER,
    },
  });

  // Document 2: Owned by Alice, private
  await prisma.document.create({
    data: {
      id: "doc_arch_notes_002",
      title: "Engineering Architecture Notes",
      ownerId: alice.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "System Architecture Notes" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "PostgreSQL relational persistence via Prisma ORM with atomic transaction support and serverless connection pooling.",
              },
            ],
          },
        ],
      },
    },
  });

  // Document 3: Owned by Bob, shared with Alice (EDITOR)
  const doc3 = await prisma.document.create({
    data: {
      id: "doc_marketing_launch_003",
      title: "Marketing Campaign Launch Brief",
      ownerId: bob.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Marketing Campaign Launch Brief" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "GTM strategy, newsletter cadence, and Product Hunt launch checklist for release day coordination.",
              },
            ],
          },
        ],
      },
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc3.id,
      userId: alice.id,
      role: ShareRole.EDITOR,
    },
  });

  // Document 4: Owned by Charlie, shared with Alice (VIEWER)
  const doc4 = await prisma.document.create({
    data: {
      id: "doc_security_audit_004",
      title: "Security & Compliance Review",
      ownerId: charlie.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Security & Compliance Review" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "SOC2 readiness checklist and internal audit report spanning access policies and database backups.",
              },
            ],
          },
        ],
      },
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc4.id,
      userId: alice.id,
      role: ShareRole.VIEWER,
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
