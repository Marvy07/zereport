import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function normalizeString(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function syncPlatformUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user is missing an email address.");
  }

  const firstName = normalizeString(user.firstName);
  const lastName = normalizeString(user.lastName);
  const imageUrl = normalizeString(user.imageUrl);

  return prisma.platformUser.upsert({
    where: { clerkUserId: user.id },
    create: {
      clerkUserId: user.id,
      email,
      firstName,
      lastName,
      imageUrl,
      lastSeenAt: new Date(),
    },
    update: {
      email,
      firstName,
      lastName,
      imageUrl,
      lastSeenAt: new Date(),
    },
  });
}
