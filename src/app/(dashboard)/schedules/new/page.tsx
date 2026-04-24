import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { ScheduleForm } from "@/components/reports/ScheduleForm";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function NewSchedulePage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const [projects, templates] = await Promise.all([
    prisma.project.findMany({
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
      <Header
        title="New schedule"
        description="Set up a recurring report delivery schedule."
      />
      <div className="p-6">
        <ScheduleForm mode="create" projects={projects} templates={templates} />
      </div>
    </>
  );
}
