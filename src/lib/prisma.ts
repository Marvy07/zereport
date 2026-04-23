import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const accelerateUrl = process.env.PRISMA_ACCELERATE_URL ?? process.env.DATABASE_URL ?? "prisma://placeholder";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
