import { prisma } from "@/lib/prisma";

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createReportSlug(title: string, clientName?: string | null) {
  const base = [clientName, title]
    .filter(Boolean)
    .map((part) => slugifySegment(part as string))
    .filter(Boolean)
    .join("-")
    .slice(0, 72);

  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  return `${base || "report"}-${uniqueSuffix}`;
}

export async function ensureReportWebSlug(report: { id: string; webSlug: string | null; title: string; client?: { name: string | null } | null }) {
  if (report.webSlug) {
    return report.webSlug;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = createReportSlug(report.title, report.client?.name);

    try {
      const updated = await prisma.report.update({
        where: { id: report.id },
        data: { webSlug: candidate },
        select: { webSlug: true },
      });

      return updated.webSlug!;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("unique")) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate a unique report slug.");
}
