import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { computeNextRunAfter } from "@/lib/schedule-utils";

/**
 * Vercel Cron handler — runs every hour.
 * Protected by CRON_SECRET env var.
 *
 * For each active ReportSchedule where nextRunAt <= now:
 *  1. Find workspace, project, template, active clients
 *  2. Create a report record and trigger the send flow
 *  3. Update lastRunAt and nextRunAt
 *
 * TODO: Add retry logic and dead-letter queue for failed deliveries.
 * TODO: Add error alerting (e.g. send Slack/email on persistent failure).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();

  // Query all active schedules that are due
  const dueSchedules = await prisma.reportSchedule.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          emailSenderName: true,
        },
      },
      project: {
        select: { id: true, name: true, clientId: true },
      },
      reportTemplate: {
        select: { id: true, name: true, emailSubjectTemplate: true, emailBodyTemplate: true },
      },
    },
  });

  if (dueSchedules.length === 0) {
    return NextResponse.json({ processed: 0, message: "No schedules due." });
  }

  const results: Array<{ scheduleId: string; status: "ok" | "error"; message?: string }> = [];

  for (const schedule of dueSchedules) {
    try {
      // Find active clients in the workspace
      const clients = await prisma.client.findMany({
        where: {
          workspaceId: schedule.workspaceId,
          status: "ACTIVE",
          // If schedule is linked to a project, scope to that project's client
          ...(schedule.project ? { id: schedule.project.clientId } : {}),
        },
        select: { id: true, name: true, primaryEmail: true },
      });

      if (clients.length === 0) {
        // TODO: Log warning — no active clients found for this schedule.
        results.push({ scheduleId: schedule.id, status: "ok", message: "No active clients; skipped." });
      } else {
        // Create one report per client (or one shared report if project-scoped)
        for (const client of clients) {
          const reportTitle = schedule.reportTemplate
            ? `${schedule.reportTemplate.name} — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
            : `Scheduled Report — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

          // TODO: Populate sections from template and trigger email delivery via Resend.
          await prisma.report.create({
            data: {
              workspaceId: schedule.workspaceId,
              clientId: client.id,
              projectId: schedule.projectId ?? undefined,
              reportTemplateId: schedule.reportTemplateId ?? undefined,
              title: reportTitle,
              status: "DRAFT",
            },
          });
        }

        results.push({ scheduleId: schedule.id, status: "ok", message: `Created ${clients.length} report(s).` });
      }

      // Update lastRunAt and compute next run
      const nextRunAt = computeNextRunAfter(
        {
          frequency: schedule.frequency,
          dayOfWeek: schedule.dayOfWeek ?? undefined,
          dayOfMonth: schedule.dayOfMonth ?? undefined,
          hour: schedule.hour,
          timezone: schedule.timezone,
        },
        now
      );

      await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt,
        },
      });
    } catch (error) {
      // TODO: Implement retry logic — currently errors are logged and skipped.
      console.error(`Failed to process schedule ${schedule.id}:`, error);
      results.push({
        scheduleId: schedule.id,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ processed: dueSchedules.length, results });
}
