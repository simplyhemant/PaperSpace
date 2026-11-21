import { describe, it, expect } from "vitest";
import { evaluateDocumentPermissions } from "@/lib/permissions";
import { ShareRole } from "@prisma/client";

describe("Document RBAC Permissions Matrix", () => {
  const ownerId = "usr_alice_owner_001";
  const editorId = "usr_bob_editor_002";
  const viewerId = "usr_charlie_viewer_003";
  const strangerId = "usr_stranger_999";

  const sampleDocument = {
    ownerId,
    shares: [
      { userId: editorId, role: ShareRole.EDITOR },
      { userId: viewerId, role: ShareRole.VIEWER },
    ],
  };

  describe("OWNER role", () => {
    it("grants full administrative, editing, and sharing rights to document owner", () => {
      const perms = evaluateDocumentPermissions(ownerId, sampleDocument);

      expect(perms.hasAccess).toBe(true);
      expect(perms.role).toBe("OWNER");
      expect(perms.canView).toBe(true);
      expect(perms.canEditContent).toBe(true);
      expect(perms.canRename).toBe(true);
      expect(perms.canDelete).toBe(true);
      expect(perms.canManageShares).toBe(true);
    });
  });

  describe("EDITOR role", () => {
    it("allows reading and content editing, but forbids renaming, deleting, and managing shares", () => {
      const perms = evaluateDocumentPermissions(editorId, sampleDocument);

      expect(perms.hasAccess).toBe(true);
      expect(perms.role).toBe("EDITOR");
      expect(perms.canView).toBe(true);
      expect(perms.canEditContent).toBe(true);
      expect(perms.canRename).toBe(false);
      expect(perms.canDelete).toBe(false);
      expect(perms.canManageShares).toBe(false);
    });
  });

  describe("VIEWER role", () => {
    it("grants read-only access and strictly forbids all mutating actions", () => {
      const perms = evaluateDocumentPermissions(viewerId, sampleDocument);

      expect(perms.hasAccess).toBe(true);
      expect(perms.role).toBe("VIEWER");
      expect(perms.canView).toBe(true);
      expect(perms.canEditContent).toBe(false);
      expect(perms.canRename).toBe(false);
      expect(perms.canDelete).toBe(false);
      expect(perms.canManageShares).toBe(false);
    });
  });

  describe("UNAUTHORIZED / NO ACCESS (404 condition)", () => {
    it("returns hasAccess=false for users not on the document or shares list", () => {
      const perms = evaluateDocumentPermissions(strangerId, sampleDocument);

      expect(perms.hasAccess).toBe(false);
      expect(perms.role).toBe("NONE");
      expect(perms.canView).toBe(false);
      expect(perms.canEditContent).toBe(false);
      expect(perms.canRename).toBe(false);
      expect(perms.canDelete).toBe(false);
      expect(perms.canManageShares).toBe(false);
    });

    it("handles null or undefined userId securely", () => {
      const permsNull = evaluateDocumentPermissions(null, sampleDocument);
      expect(permsNull.hasAccess).toBe(false);
      expect(permsNull.role).toBe("NONE");

      const permsUndefined = evaluateDocumentPermissions(undefined, sampleDocument);
      expect(permsUndefined.hasAccess).toBe(false);
      expect(permsUndefined.role).toBe("NONE");
    });

    it("handles null or missing document securely", () => {
      const perms = evaluateDocumentPermissions(ownerId, null);
      expect(perms.hasAccess).toBe(false);
      expect(perms.role).toBe("NONE");
    });
  });
});
