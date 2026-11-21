import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateDocumentPermissions } from "@/lib/permissions";
import { UpdateShareRoleSchema } from "@/lib/validations";
import { ShareRole } from "@prisma/client";

/**
 * PATCH /api/documents/[id]/shares/[shareId]
 * Updates a collaborator's role (EDITOR <-> VIEWER).
 * Enforces: OWNER only (403 Forbidden for others).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  const { id, shareId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    const permissions = evaluateDocumentPermissions(currentUser.id, document);

    if (!permissions.hasAccess || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!permissions.canManageShares) {
      return NextResponse.json(
        { error: "Forbidden: Only document owners can update collaborator roles" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = UpdateShareRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { role } = validation.data;

    const updatedShare = await prisma.documentShare.update({
      where: { id: shareId },
      data: { role: role as ShareRole },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      share: {
        id: updatedShare.id,
        documentId: updatedShare.documentId,
        userId: updatedShare.userId,
        role: updatedShare.role,
        createdAt: updatedShare.createdAt.toISOString(),
        user: updatedShare.user,
      },
    });
  } catch (error) {
    console.error("Failed to update share role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]/shares/[shareId]
 * Revokes a collaborator's access.
 * Enforces: OWNER only (403 Forbidden for others).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  const { id, shareId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    const permissions = evaluateDocumentPermissions(currentUser.id, document);

    if (!permissions.hasAccess || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!permissions.canManageShares) {
      return NextResponse.json(
        { error: "Forbidden: Only document owners can revoke collaborator access" },
        { status: 403 }
      );
    }

    await prisma.documentShare.delete({
      where: { id: shareId },
    });

    return NextResponse.json({ message: "Share revoked successfully" });
  } catch (error) {
    console.error("Failed to revoke share:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
