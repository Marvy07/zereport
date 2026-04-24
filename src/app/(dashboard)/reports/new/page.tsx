import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { ReportForm } from "@/components/reports/ReportForm";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function NewReportPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const [clients, templates] = await Promise.all([
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

  return (
    <>
      <Header title="Create report" description="Start a new report for a client and optionally attach a reusable template." />
      <main className="flex-1 p-6">
        <ReportForm mode="create" clients={clients} templates={templates} />
      </main>
    </>
  );
}
