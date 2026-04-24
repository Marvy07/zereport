import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { buildReportEmailHtml, buildReportEmailSubject, buildReportEmailText } from "@/emails/report-email";
import { prisma } from "@/lib/prisma";
import { ensureReportWebSlug } from "@/lib/report-slug";
import { getReportEmailFromAddress, getResendClient } from "@/lib/resend";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

function uniqueRecipients(report: {
  client: { primaryEmail: string; name: string; contacts: Array<{ email: string; name: string; isPrimary: boolean }> };
}) {
  const seen = new Set<string>();
  const recipients: Array<{ email: string; name?: string | null }> = [];

  const pushRecipient = (email?: string | null, name?: string | null) => {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    recipients.push({ email: normalized, name: name?.trim() || undefined });
  };

  pushRecipient(report.client.primaryEmail, report.client.name);

  for (const contact of report.client.contacts.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))) {
    pushRecipient(contact.email, contact.name);
  }

  return recipients;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
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
            primaryEmail: true,
            contacts: {
              select: {
                email: true,
                name: true,
                isPrimary: true,
              },
              orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const recipients = uniqueRecipients(report);

    if (recipients.length === 0) {
      return NextResponse.json({ error: "This client does not have any recipient email addresses yet." }, { status: 400 });
    }

    const resend = getResendClient();
    const webSlug = await ensureReportWebSlug({
      id: report.id,
      webSlug: report.webSlug,
      title: report.title,
      client: { name: report.client.name },
    });
    const baseUrl = getBaseUrl(request);
    const hostedReportUrl = new URL(`/r/${webSlug}`, baseUrl).toString();
    const pdfDownloadUrl = new URL(`/api/reports/${report.id}/pdf`, baseUrl).toString();
    const subject = buildReportEmailSubject({ reportTitle: report.title, clientName: report.client.name });
    const html = buildReportEmailHtml({
      reportTitle: report.title,
      clientName: report.client.name,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      hostedReportUrl,
      pdfDownloadUrl,
    });
    const text = buildReportEmailText({
      reportTitle: report.title,
      clientName: report.client.name,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      hostedReportUrl,
      pdfDownloadUrl,
    });

    const sendResults = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const emailResult = await resend.emails.send({
          from: getReportEmailFromAddress(),
          to: [recipient.email],
          subject,
          html,
          text,
        });

        if (emailResult.error) {
          throw new Error(emailResult.error.message || "Failed to send report email.");
        }

        return recipient;
      }),
    );

    const sentAt = new Date();
    const successfulRecipients = sendResults.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    const failedRecipients = sendResults.flatMap((result, index) =>
      result.status === "rejected"
        ? [{ recipient: recipients[index], error: result.reason instanceof Error ? result.reason.message : String(result.reason) }]
        : [],
    );

    await prisma.$transaction(async (tx) => {
      if (successfulRecipients.length > 0) {
        await tx.reportDelivery.createMany({
          data: successfulRecipients.map((recipient) => ({
            reportId: report.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name ?? null,
            status: "SENT",
            sentAt,
          })),
        });

        await tx.report.update({
          where: { id: report.id },
          data: {
            sentAt,
            status: report.status === "ARCHIVED" ? report.status : "SENT",
          },
        });
      }

      if (failedRecipients.length > 0) {
        await tx.reportDelivery.createMany({
          data: failedRecipients.map(({ recipient, error }) => ({
            reportId: report.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name ?? null,
            status: "FAILED",
            errorMsg: error,
          })),
        });
      }
    });

    if (successfulRecipients.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to send the report email to all recipients.",
          recipients: failedRecipients,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      reportId: report.id,
      hostedReportUrl,
      sentAt: sentAt.toISOString(),
      recipients: {
        sent: successfulRecipients.map((recipient) => recipient.email),
        failed: failedRecipients,
      },
      message:
        failedRecipients.length > 0
          ? `Report sent to ${successfulRecipients.length} recipient(s). ${failedRecipients.length} delivery attempt(s) failed.`
          : `Report sent to ${successfulRecipients.length} recipient(s).`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send report email.";

    if (message.includes("RESEND_API_KEY")) {
      return NextResponse.json({ error: "Report email delivery is not configured. Add RESEND_API_KEY to enable sending." }, { status: 503 });
    }

    console.error("Failed to send report email", error);
    return NextResponse.json({ error: message || "Failed to send report email." }, { status: 500 });
  }
}
