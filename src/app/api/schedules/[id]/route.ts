import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { scheduleUpdateSchema } from "@/lib/validations/schedule";
import { computeNextRunAt } from "@/lib/schedule-utils";

async function getScopedSchedule(id: string, workspaceId: string) {
  return prisma.reportSchedule.findFirst({
    where: { id, workspaceId },
    include: {
      project: { select: { id: true, name: true } },
      reportTemplate: { select: { id: true, name: true } },
    },
  });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const { id } = await params;
  const schedule = await getScopedSchedule(id, workspace.workspaceId);

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  return NextResponse.json({ schedule });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const existing = await getScopedSchedule(id, workspace.workspaceId);

    if (!existing) {
      return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
    }

    const body = await req.json();
    const data = scheduleUpdateSchema.parse(body);

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

    // Recompute nextRunAt if schedule fields changed
    const merged = {
      frequency: data.frequency ?? existing.frequency,
      dayOfWeek: data.dayOfWeek ?? existing.dayOfWeek ?? undefined,
      dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth ?? undefined,
      hour: data.hour ?? existing.hour,
      timezone: data.timezone ?? existing.timezone,
      isActive: data.isActive ?? existing.isActive,
    };

    const nextRunAt = (data.frequency || data.dayOfWeek !== undefined || data.dayOfMonth !== undefined || data.hour !== undefined)
      ? computeNextRunAt(merged)
      : existing.nextRunAt;

    const schedule = await prisma.reportSchedule.update({
      where: { id },
      data: {
        ...data,
        nextRunAt,
      },
      include: {
        project: { select: { id: true, name: true } },
        reportTemplate: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    console.error("Failed to update schedule", error);
    return NextResponse.json({ error: "Failed to update schedule." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const { id } = await params;
  const existing = await getScopedSchedule(id, workspace.workspaceId);

  if (!existing) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  await prisma.reportSchedule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
