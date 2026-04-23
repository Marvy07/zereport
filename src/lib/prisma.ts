import { PrismaClient, Prisma } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const log: Prisma.PrismaClientOptions["log"] =
  process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

const prismaClientOptions: Prisma.PrismaClientOptions = process.env.DATABASE_URL?.startsWith("prisma://")
  ? {
      accelerateUrl: process.env.PRISMA_ACCELERATE_URL ?? process.env.DATABASE_URL,
      log,
    }
  : {
      log,
    };

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
