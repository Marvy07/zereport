import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
    // directUrl for Supabase: pgbouncer uses DATABASE_URL (pooled), migrations use DIRECT_URL
    // Note: @prisma/config type omits directUrl in v7; runtime still passes it through
    ...(process.env.DIRECT_URL ? { directUrl: process.env.DIRECT_URL } : {}),
  } as { url: string },
});
