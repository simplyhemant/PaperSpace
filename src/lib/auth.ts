import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const DEMO_USER_COOKIE_NAME = "demo_user_id";

// Default demo user ID (Alice Johnson - Owner)
export const DEFAULT_DEMO_USER_ID = "usr_alice_owner_001";

export interface DemoUserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

/**
 * Resolves the currently authenticated user based on the secure demo session cookie.
 * Strictly verifies the user exists in PostgreSQL to avoid trusting arbitrary client IDs.
 */
export async function getCurrentUser(): Promise<DemoUserSession | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(DEMO_USER_COOKIE_NAME)?.value || DEFAULT_DEMO_USER_ID;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to resolve current user session:", error);
    return null;
  }
}
