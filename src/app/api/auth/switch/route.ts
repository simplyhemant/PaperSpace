import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_COOKIE_NAME } from "@/lib/auth";
import { SwitchUserSchema } from "@/lib/validations";

/**
 * POST /api/auth/switch
 * Switches the active demo user by setting an HttpOnly cookie.
 * Strictly validates that the requested userId exists in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = SwitchUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { userId } = validation.data;

    // Verify user exists in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      message: `Switched demo user to ${user.name}`,
      user,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: DEMO_USER_COOKIE_NAME,
      value: user.id,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Failed to switch demo user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
