import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me
 * Returns current authenticated demo user and all available demo users.
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      currentUser,
      demoUsers: allUsers,
    });
  } catch (error) {
    console.error("Failed to get current user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
