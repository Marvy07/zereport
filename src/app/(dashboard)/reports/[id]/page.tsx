import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { ReportForm } from "@/components/reports/ReportForm";
import { SendReportButton } from "@/components/reports/SendReportButton";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const { id } = await params;
  const [report, clients, templates] = await Promise.all([
    prisma.report.findFirst({
      where: {
        id,
        workspaceId: workspace.workspaceId,
      },
      include: {
        client: {
          select: {
            primaryEmail: true,
            contacts: {
              select: { email: true },
            },
          },
        },
      },
    }),
    prisma.client.findMany({
      where: {
        workspaceId: workspace.workspaceId,
        status: { not: "ARCHIVED" },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.reportTemplate.findMany({
      where: { workspaceId: workspace.workspaceId },
      select: { id: true, name: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!report) {
    notFound();
  }

  const hasRecipients = Boolean(report.client.primaryEmail || report.client.contacts.length);

  return (
    <>
      <Header title={`Edit ${report.title}`} description="Update report metadata, assign a template, or change delivery readiness." />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-start gap-3">
          {report.webSlug ? (
            <Link href={`/r/${report.webSlug}?token=requires-email-link`} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ExternalLink className="h-4 w-4" />
              View hosted report
            </Link>
          ) : null}
          <SendReportButton reportId={report.id} hasRecipients={hasRecipients} />
          <Link href={`/api/reports/${report.id}/pdf`} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Download PDF
          </Link>
        </div>
        {!hasRecipients ? <p className="text-sm text-amber-600">This client needs a primary email or contact email before the report can be sent.</p> : null}
        <ReportForm
          mode="edit"
          reportId={report.id}
          clients={clients}
          templates={templates}
          showStatusField
          initialValues={{
            title: report.title,
            clientId: report.clientId,
            projectId: report.projectId ?? undefined,
            reportTemplateId: report.reportTemplateId ?? undefined,
            periodStart: report.periodStart ?? undefined,
            periodEnd: report.periodEnd ?? undefined,
            status: report.status,
          }}
        />
      </main>
    </>
  );
}
