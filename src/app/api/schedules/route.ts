import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { scheduleSchema } from "@/lib/validations/schedule";
import { computeNextRunAt } from "@/lib/schedule-utils";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const schedules = await prisma.reportSchedule.findMany({
    where: { workspaceId: workspace.workspaceId },
    include: {
      project: { select: { id: true, name: true } },
      reportTemplate: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const workspace = await resolveWorkspaceForRequest();

    if (!workspace.ok) {
      return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
    }

    const body = await req.json();
    const data = scheduleSchema.parse(body);

    // Validate scoped relations
    if (data.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: data.projectId, workspaceId: workspace.workspaceId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found in this workspace." }, { status: 400 });
      }
    }

    if (data.reportTemplateId) {
      const template = await prisma.reportTemplate.findFirst({
        where: { id: data.reportTemplateId, workspaceId: workspace.workspaceId },
        select: { id: true },
      });
      if (!template) {
        return NextResponse.json({ error: "Template not found in this workspace." }, { status: 400 });
      }
    }

    const nextRunAt = computeNextRunAt(data);

    const schedule = await prisma.reportSchedule.create({
      data: {
        workspaceId: workspace.workspaceId,
        projectId: data.projectId,
        reportTemplateId: data.reportTemplateId,
        frequency: data.frequency,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        hour: data.hour,
        timezone: data.timezone,
        isActive: data.isActive,
        nextRunAt,
      },
      include: {
        project: { select: { id: true, name: true } },
        reportTemplate: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    console.error("Failed to create schedule", error);
    return NextResponse.json({ error: "Failed to create schedule." }, { status: 500 });
  }
}
