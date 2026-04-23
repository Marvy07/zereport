// TODO: Add Clerk auth helpers in Section 2
// import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user's ID from Clerk session.
 * Use in Server Components and API Routes.
 */
export async function getCurrentUserId(): Promise<string | null> {
  // TODO: const { userId } = await auth();
  // return userId;
  return null;
}

/**
 * Get the current user object from Clerk.
 */
export async function getCurrentUser() {
  // TODO: return await currentUser();
  return null;
}
