import { Prisma } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { reportTemplateUpdateSchema } from "@/lib/validations/report-template";

async function getScopedTemplate(id: string, workspaceId: string) {
  return prisma.reportTemplate.findFirst({
    where: { id, workspaceId },
  });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const { id } = await params;
  const template = await getScopedTemplate(id, workspace.workspaceId);

  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json({ template });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  try {
    const { id } = await params;
    const existingTemplate = await getScopedTemplate(id, workspace.workspaceId);

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const data = reportTemplateUpdateSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const template = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.reportTemplate.updateMany({
          where: { workspaceId: workspace.workspaceId, isDefault: true, NOT: { id: existingTemplate.id } },
          data: { isDefault: false },
        });
      }

      return tx.reportTemplate.update({
        where: { id: existingTemplate.id },
        data,
      });
    });

    return NextResponse.json({ template });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A template with this configuration already exists." }, { status: 409 });
    }

    console.error("Failed to update template", error);
    return NextResponse.json({ error: "Failed to update template." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  try {
    const { id } = await params;
    const template = await getScopedTemplate(id, workspace.workspaceId);

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    await prisma.reportTemplate.delete({ where: { id: template.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template", error);
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 });
  }
}
