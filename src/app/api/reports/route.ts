import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { reportSchema } from "@/lib/validations/report";

async function ensureScopedRelations(workspaceId: string, clientId: string, reportTemplateId?: string) {
  const [client, template] = await Promise.all([
    prisma.client.findFirst({
      where: {
        id: clientId,
        workspaceId,
      },
      select: { id: true },
    }),
    reportTemplateId
      ? prisma.reportTemplate.findFirst({
          where: {
            id: reportTemplateId,
            workspaceId,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!client) {
    return { ok: false as const, response: NextResponse.json({ error: "Client not found in this workspace." }, { status: 400 }) };
  }

  if (reportTemplateId && !template) {
    return { ok: false as const, response: NextResponse.json({ error: "Template not found in this workspace." }, { status: 400 }) };
  }

  return { ok: true as const };
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const reports = await prisma.report.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      status: { not: "ARCHIVED" },
    },
    include: {
      client: {
        select: { id: true, name: true },
      },
      reportTemplate: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ reports });
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
    const data = reportSchema.parse(body);

    const scopedRelations = await ensureScopedRelations(workspace.workspaceId, data.clientId, data.reportTemplateId);
    if (!scopedRelations.ok) {
      return scopedRelations.response;
    }

    const report = await prisma.report.create({
      data: {
        workspaceId: workspace.workspaceId,
        clientId: data.clientId,
        projectId: data.projectId,
        reportTemplateId: data.reportTemplateId,
        title: data.title,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        status: data.status,
      },
      include: {
        client: { select: { id: true, name: true } },
        reportTemplate: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    console.error("Failed to create report", error);
    return NextResponse.json({ error: "Failed to create report." }, { status: 500 });
  }
}
