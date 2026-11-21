import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateDocumentPermissions } from "@/lib/permissions";
import { RenameDocumentSchema, UpdateDocumentContentSchema } from "@/lib/validations";

/**
 * GET /api/documents/[id]
 * Retrieves a single document with permission checks.
 * Returns 404 if user has no access (prevents enumeration).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const permissions = evaluateDocumentPermissions(currentUser.id, document);

    // Rule: Return 404 for no access to prevent document existence discovery
    if (!permissions.hasAccess || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        ownerId: document.ownerId,
        owner: document.owner,
        role: permissions.role,
        permissions,
        shares: document.shares.map((s) => ({
          id: s.id,
          documentId: s.documentId,
          userId: s.userId,
          role: s.role,
          createdAt: s.createdAt.toISOString(),
          user: s.user,
        })),
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to retrieve document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/documents/[id]
 * Updates document title (Owner only) or content (Owner & Editor).
 * Strictly returns 403 Forbidden if user lacks required permission.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const body = await req.json().catch(() => ({}));
    const updateData: { title?: string; content?: any } = {};

    // 1. Check title update (Rename)
    if ("title" in body) {
      if (!permissions.canRename) {
        return NextResponse.json(
          { error: "Forbidden: Only document owners can rename documents" },
          { status: 403 }
        );
      }
      const titleValidation = RenameDocumentSchema.safeParse({ title: body.title });
      if (!titleValidation.success) {
        return NextResponse.json(
          { error: "Invalid title", details: titleValidation.error.format() },
          { status: 400 }
        );
      }
      updateData.title = titleValidation.data.title;
    }

    // 2. Check content update
    if ("content" in body) {
      if (!permissions.canEditContent) {
        return NextResponse.json(
          { error: "Forbidden: You have view-only access to this document" },
          { status: 403 }
        );
      }
      const contentValidation = UpdateDocumentContentSchema.safeParse({ content: body.content });
      if (!contentValidation.success) {
        return NextResponse.json(
          { error: "Invalid content format", details: contentValidation.error.format() },
          { status: 400 }
        );
      }
      updateData.content = contentValidation.data.content;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      document: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Deletes a document (Owner only).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    if (!permissions.canDelete) {
      return NextResponse.json(
        { error: "Forbidden: Only document owners can delete documents" },
        { status: 403 }
      );
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
