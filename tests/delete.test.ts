import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { evaluateDocumentPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ShareRole } from "@prisma/client";

describe("Delete Document Feature & Security Matrix", () => {
  const ownerId = "usr_alice_owner_001";
  const editorId = "usr_bob_editor_002";
  const viewerId = "usr_charlie_viewer_003";

  // Test 1: Owner permissions allow deletion
  it("grants canDelete=true to the document owner", () => {
    const mockDoc = {
      ownerId,
      shares: [
        { userId: editorId, role: ShareRole.EDITOR },
        { userId: viewerId, role: ShareRole.VIEWER },
      ],
    };

    const perms = evaluateDocumentPermissions(ownerId, mockDoc);
    expect(perms.hasAccess).toBe(true);
    expect(perms.role).toBe("OWNER");
    expect(perms.canDelete).toBe(true);
  });

  // Test 2: Editor cannot delete a shared document
  it("strictly denies canDelete=false for an EDITOR (HTTP 403 condition)", () => {
    const mockDoc = {
      ownerId,
      shares: [{ userId: editorId, role: ShareRole.EDITOR }],
    };

    const perms = evaluateDocumentPermissions(editorId, mockDoc);
    expect(perms.hasAccess).toBe(true);
    expect(perms.role).toBe("EDITOR");
    expect(perms.canDelete).toBe(false);
  });

  // Test 3: Viewer cannot delete a shared document
  it("strictly denies canDelete=false for a VIEWER (HTTP 403 condition)", () => {
    const mockDoc = {
      ownerId,
      shares: [{ userId: viewerId, role: ShareRole.VIEWER }],
    };

    const perms = evaluateDocumentPermissions(viewerId, mockDoc);
    expect(perms.hasAccess).toBe(true);
    expect(perms.role).toBe("VIEWER");
    expect(perms.canDelete).toBe(false);
  });

  // Test 4: Unauthenticated / null user is rejected
  it("rejects unauthenticated or null user sessions securely (HTTP 401/404 condition)", () => {
    const mockDoc = {
      ownerId,
      shares: [{ userId: editorId, role: ShareRole.EDITOR }],
    };

    const permsNull = evaluateDocumentPermissions(null, mockDoc);
    expect(permsNull.hasAccess).toBe(false);
    expect(permsNull.canDelete).toBe(false);

    const permsUndefined = evaluateDocumentPermissions(undefined, mockDoc);
    expect(permsUndefined.hasAccess).toBe(false);
    expect(permsUndefined.canDelete).toBe(false);
  });

  // Test 5: Nonexistent document returns 404 condition
  it("returns hasAccess=false for a nonexistent or null document (HTTP 404 condition)", () => {
    const perms = evaluateDocumentPermissions(ownerId, null);
    expect(perms.hasAccess).toBe(false);
    expect(perms.canDelete).toBe(false);
    expect(perms.role).toBe("NONE");
  });

  // Test 6: Database integration: deleting document removes document and cascades to shares
  it("deleting a document from PostgreSQL cascades and deletes all associated document shares", async () => {
    // 1. Create a test document owned by Alice
    const testDoc = await prisma.document.create({
      data: {
        title: "Temporary Test Document For Deletion",
        ownerId,
        content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Delete me" }] }] },
      },
    });

    // 2. Create a test share with Bob
    const testShare = await prisma.documentShare.create({
      data: {
        documentId: testDoc.id,
        userId: editorId,
        role: ShareRole.EDITOR,
      },
    });

    expect(testDoc.id).toBeDefined();
    expect(testShare.id).toBeDefined();

    // 3. Verify they exist in PostgreSQL
    const docBefore = await prisma.document.findUnique({ where: { id: testDoc.id } });
    const shareBefore = await prisma.documentShare.findUnique({ where: { id: testShare.id } });
    expect(docBefore).not.toBeNull();
    expect(shareBefore).not.toBeNull();

    // 4. Perform Owner deletion
    await prisma.document.delete({ where: { id: testDoc.id } });

    // 5. Verify document is completely removed
    const docAfter = await prisma.document.findUnique({ where: { id: testDoc.id } });
    expect(docAfter).toBeNull();

    // 6. Verify associated share record was automatically pruned by PostgreSQL cascade
    const shareAfter = await prisma.documentShare.findUnique({ where: { id: testShare.id } });
    expect(shareAfter).toBeNull();
  });
});
