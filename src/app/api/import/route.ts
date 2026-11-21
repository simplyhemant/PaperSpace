import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
} from "@/lib/validations";
import { convertTextToTipTap, deriveTitleFromFilename } from "@/lib/importer";

/**
 * POST /api/import
 * Imports a .txt or .md file and converts it into a new editable PaperSpace document.
 */
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please select a .txt or .md file to upload." },
        { status: 400 }
      );
    }

    // 1. File Size Validation (Max 2 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          error: `File size exceeds the 2 MB limit (uploaded file is ${sizeMB} MB). Please choose a smaller file.`,
        },
        { status: 400 }
      );
    }

    // 2. File Extension Validation
    const filename = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext));

    if (!hasValidExtension) {
      const extension = filename.includes(".") ? `.${filename.split(".").pop()}` : "unknown";
      return NextResponse.json(
        {
          error: `File format "${extension}" is not supported. Supported formats: .txt and .md under 2 MB.`,
        },
        { status: 400 }
      );
    }

    // 3. Read content
    const rawContent = await file.text();
    if (!rawContent || !rawContent.trim()) {
      return NextResponse.json(
        { error: "The uploaded file is empty. Please upload a file with content." },
        { status: 400 }
      );
    }

    // 4. Parse content into TipTap JSON AST
    const isMarkdown = filename.endsWith(".md") || filename.endsWith(".markdown");
    const tipTapDoc = convertTextToTipTap(rawContent, isMarkdown);
    const documentTitle = deriveTitleFromFilename(file.name);

    // 5. Persist document in PostgreSQL
    const newDoc = await prisma.document.create({
      data: {
        title: documentTitle,
        content: tipTapDoc as any,
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
        message: "Document imported successfully",
        document: {
          id: newDoc.id,
          title: newDoc.title,
          content: newDoc.content,
          ownerId: newDoc.ownerId,
          owner: (newDoc as any).owner,
          role: "OWNER",
          createdAt: newDoc.createdAt.toISOString(),
          updatedAt: newDoc.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to import file:", error);
    return NextResponse.json(
      { error: "Internal Server Error while importing document" },
      { status: 500 }
    );
  }
}
