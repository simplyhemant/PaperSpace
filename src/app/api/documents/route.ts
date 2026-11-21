import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateDocumentSchema } from "@/lib/validations";

/**
 * GET /api/documents
 * Returns owned and shared documents for the currently authenticated demo user.
 */
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch owned documents
    const ownedDocs = await prisma.document.findMany({
      where: { ownerId: currentUser.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        shares: {
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Fetch shared documents
    const shares = await prisma.documentShare.findMany({
      where: { userId: currentUser.id },
      include: {
        document: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOwned = ownedDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      ownerId: doc.ownerId,
      owner: doc.owner,
      role: "OWNER" as const,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      sharesCount: doc.shares.length,
    }));

    const formattedShared = shares.map((share) => ({
      id: share.document.id,
      title: share.document.title,
      ownerId: share.document.ownerId,
      owner: share.document.owner,
      role: share.role as "EDITOR" | "VIEWER",
      createdAt: share.document.createdAt.toISOString(),
      updatedAt: share.document.updatedAt.toISOString(),
      sharedAt: share.createdAt.toISOString(),
    }));

    return NextResponse.json({
      owned: formattedOwned,
      shared: formattedShared,
    });
  } catch (error) {
    console.error("Failed to list documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Creates a new document owned by the active demo user.
 */
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validation = CreateDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { title, content } = validation.data;

    // Default empty TipTap document if not provided
    const initialContent = content || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: title }],
        },
        {
          type: "paragraph",
          content: [],
        },
      ],
    };

    const newDoc = await prisma.document.create({
      data: {
        title,
        content: initialContent,
        ownerId: currentUser.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(
      {
        document: {
          id: newDoc.id,
          title: newDoc.title,
          content: newDoc.content,
          ownerId: newDoc.ownerId,
          owner: newDoc.owner,
          role: "OWNER",
          createdAt: newDoc.createdAt.toISOString(),
          updatedAt: newDoc.updatedAt.toISOString(),
          shares: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
