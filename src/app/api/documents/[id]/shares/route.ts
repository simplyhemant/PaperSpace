import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateDocumentPermissions } from "@/lib/permissions";
import { ShareDocumentSchema } from "@/lib/validations";
import { ShareRole } from "@prisma/client";

/**
 * GET /api/documents/[id]/shares
 * Lists all active collaborators for a document.
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
    if (!permissions.hasAccess || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      shares: document.shares.map((s) => ({
        id: s.id,
        documentId: s.documentId,
        userId: s.userId,
        role: s.role,
        createdAt: s.createdAt.toISOString(),
        user: s.user,
      })),
    });
  } catch (error) {
    console.error("Failed to list shares:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/documents/[id]/shares
 * Adds or updates a collaborator on a document.
 * Enforces: Only document OWNER can share (403 Forbidden for others).
 */
export async function POST(
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

    // Strict RBAC: Only OWNER can manage shares
    if (!permissions.canManageShares) {
      return NextResponse.json(
        { error: "Forbidden: Only document owners can manage sharing permissions" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = ShareDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Find recipient user in DB
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `User with email "${email}" not found in system` },
        { status: 404 }
      );
    }

    // Prevent sharing with self (document owner)
    if (targetUser.id === document.ownerId) {
      return NextResponse.json(
        { error: "Cannot share document with its owner" },
        { status: 400 }
      );
    }

    // Upsert share record (create or update role)
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: document.id,
          userId: targetUser.id,
        },
      },
      update: {
        role: role as ShareRole,
      },
      create: {
        documentId: document.id,
        userId: targetUser.id,
        role: role as ShareRole,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(
      {
        share: {
          id: share.id,
          documentId: share.documentId,
          userId: share.userId,
          role: share.role,
          createdAt: share.createdAt.toISOString(),
          user: share.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add share:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
