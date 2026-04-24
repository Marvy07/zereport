import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { reportUpdateSchema } from "@/lib/validations/report";

async function getScopedReport(id: string, workspaceId: string) {
  return prisma.report.findFirst({
    where: { id, workspaceId },
    include: {
      client: { select: { id: true, name: true } },
      reportTemplate: { select: { id: true, name: true } },
    },
  });
}

async function ensureScopedRelations(workspaceId: string, clientId?: string, reportTemplateId?: string) {
  const [client, template] = await Promise.all([
    clientId
      ? prisma.client.findFirst({
          where: { id: clientId, workspaceId },
          select: { id: true },
        })
      : Promise.resolve(null),
    reportTemplateId
      ? prisma.reportTemplate.findFirst({
          where: { id: reportTemplateId, workspaceId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (clientId && !client) {
    return { ok: false as const, response: NextResponse.json({ error: "Client not found in this workspace." }, { status: 400 }) };
  }

  if (reportTemplateId && !template) {
    return { ok: false as const, response: NextResponse.json({ error: "Template not found in this workspace." }, { status: 400 }) };
  }

  return { ok: true as const };
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
  const report = await getScopedReport(id, workspace.workspaceId);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({ report });
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
    const existingReport = await getScopedReport(id, workspace.workspaceId);

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const data = reportUpdateSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const scopedRelations = await ensureScopedRelations(workspace.workspaceId, data.clientId, data.reportTemplateId);
    if (!scopedRelations.ok) {
      return scopedRelations.response;
    }

    const report = await prisma.report.update({
      where: { id: existingReport.id },
      data,
      include: {
        client: { select: { id: true, name: true } },
        reportTemplate: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    console.error("Failed to update report", error);
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const report = await getScopedReport(id, workspace.workspaceId);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Archive instead of deleting so delivery history and future report content can stay intact.
    const archivedReport = await prisma.report.update({
      where: { id: report.id },
      data: { status: "ARCHIVED" },
      include: {
        client: { select: { id: true, name: true } },
        reportTemplate: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ report: archivedReport });
  } catch (error) {
    console.error("Failed to archive report", error);
    return NextResponse.json({ error: "Failed to archive report." }, { status: 500 });
  }
}
