import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

import { ensureReportWebSlug } from "@/lib/report-slug";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

function toFileName(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "report"}.pdf`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const { id } = await params;
  const report = await prisma.report.findFirst({
    where: {
      id,
      workspaceId: workspace.workspaceId,
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
      deliveries: {
        where: {
          status: {
            in: ["SENT", "OPENED"],
          },
        },
        orderBy: { updatedAt: "desc" },
        select: {
          deliveryTokenHash: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (report.deliveries.length === 0) {
    return NextResponse.json({ error: "Report must be delivered before a hosted PDF can be generated." }, { status: 409 });
  }

  try {
    const webSlug = await ensureReportWebSlug(report);
    const hostedReportUrl = new URL(`/r/${webSlug}`, getBaseUrl(request)).toString();

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.goto(hostedReportUrl, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "24px",
          right: "24px",
          bottom: "24px",
          left: "24px",
        },
      });

      return new NextResponse(Buffer.from(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${toFileName(report.title)}"`,
          "Cache-Control": "private, no-store",
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Failed to generate report PDF", error);
    return NextResponse.json({ error: "Failed to generate PDF." }, { status: 500 });
  }
}
