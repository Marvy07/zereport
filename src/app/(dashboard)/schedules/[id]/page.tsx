import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { ScheduleForm } from "@/components/reports/ScheduleForm";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
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

  const [schedule, projects, templates] = await Promise.all([
    prisma.reportSchedule.findFirst({
      where: { id, workspaceId: workspace.workspaceId },
    }),
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

  if (!schedule) {
    notFound();
  }

  const initialValues = {
    frequency: schedule.frequency,
    dayOfWeek: schedule.dayOfWeek ?? undefined,
    dayOfMonth: schedule.dayOfMonth ?? undefined,
    hour: schedule.hour,
    timezone: schedule.timezone,
    isActive: schedule.isActive,
    projectId: schedule.projectId ?? undefined,
    reportTemplateId: schedule.reportTemplateId ?? undefined,
  };

  return (
    <>
      <Header
        title="Edit schedule"
        description="Update this recurring report delivery schedule."
      />
      <div className="p-6">
        <ScheduleForm
          mode="edit"
          scheduleId={schedule.id}
          projects={projects}
          templates={templates}
          initialValues={initialValues}
        />
      </div>
    </>
  );
}
