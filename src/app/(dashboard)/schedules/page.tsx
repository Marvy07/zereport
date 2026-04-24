import Link from "next/link";
import { Calendar } from "lucide-react";
import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  MONTHLY: "Monthly",
};

export default async function SchedulesPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const schedules = await prisma.reportSchedule.findMany({
    where: { workspaceId: workspace.workspaceId },
    include: {
      project: { select: { id: true, name: true } },
      reportTemplate: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Schedules"
        description="Manage recurring report delivery schedules."
      />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Link href="/schedules/new">
            <Button size="sm">New schedule</Button>
          </Link>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No schedules yet"
            description="Create a schedule to automatically send reports on a recurring basis."
            actionLabel="New schedule"
            actionHref="/schedules/new"
          />
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency}
                      </span>
                      <Badge variant={schedule.isActive ? "default" : "outline"}>
                        {schedule.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {String(schedule.hour).padStart(2, "0")}:00 {schedule.timezone}
                      {schedule.project ? ` · ${schedule.project.name}` : ""}
                      {schedule.reportTemplate ? ` · ${schedule.reportTemplate.name}` : ""}
                    </p>
                    {schedule.nextRunAt && (
                      <p className="text-xs text-slate-400">
                        Next run:{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(schedule.nextRunAt)}
                      </p>
                    )}
                  </div>
                  <Link href={`/schedules/${schedule.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
