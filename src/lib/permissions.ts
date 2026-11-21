import { ShareRole } from "@prisma/client";

export type EffectiveRole = "OWNER" | "EDITOR" | "VIEWER" | "NONE";

export interface DocumentPermissionResult {
  hasAccess: boolean;
  role: EffectiveRole;
  canView: boolean;
  canEditContent: boolean;
  canRename: boolean;
  canDelete: boolean;
  canManageShares: boolean;
}

/**
 * Calculates effective permissions for a user on a given document.
 * 
 * Rules:
 * - OWNER: Full control (View, Edit, Rename, Delete, Share, Revoke)
 * - EDITOR: View, Edit content. Cannot rename, delete, or manage shares.
 * - VIEWER: Read-only access.
 * - NONE: No access -> Triggers HTTP 404 (prevent document enumeration).
 */
export function evaluateDocumentPermissions(
  userId: string | null | undefined,
  document: {
    ownerId: string;
    shares?: Array<{ userId: string; role: ShareRole }>;
  } | null
): DocumentPermissionResult {
  if (!document || !userId) {
    return {
      hasAccess: false,
      role: "NONE",
      canView: false,
      canEditContent: false,
      canRename: false,
      canDelete: false,
      canManageShares: false,
    };
  }

  // Check Ownership
  if (document.ownerId === userId) {
    return {
      hasAccess: true,
      role: "OWNER",
      canView: true,
      canEditContent: true,
      canRename: true,
      canDelete: true,
      canManageShares: true,
    };
  }

  // Check Shared Access
  const share = document.shares?.find((s) => s.userId === userId);
  if (share) {
    if (share.role === ShareRole.EDITOR) {
      return {
        hasAccess: true,
        role: "EDITOR",
        canView: true,
        canEditContent: true,
        canRename: false,
        canDelete: false,
        canManageShares: false,
      };
    }

    if (share.role === ShareRole.VIEWER) {
      return {
        hasAccess: true,
        role: "VIEWER",
        canView: true,
        canEditContent: false,
        canRename: false,
        canDelete: false,
        canManageShares: false,
      };
    }
  }

  return {
    hasAccess: false,
    role: "NONE",
    canView: false,
    canEditContent: false,
    canRename: false,
    canDelete: false,
    canManageShares: false,
  };
}
