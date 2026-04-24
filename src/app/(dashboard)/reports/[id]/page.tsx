import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { ReportForm } from "@/components/reports/ReportForm";
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

  return (
    <>
      <Header title={`Edit ${report.title}`} description="Update report metadata, assign a template, or change delivery readiness." />
      <main className="flex-1 p-6">
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
