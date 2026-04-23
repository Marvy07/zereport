import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { reportTemplateSchema } from "@/lib/validations/report-template";

export async function GET() {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const templates = await prisma.reportTemplate.findMany({
    where: { workspaceId: workspace.workspaceId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  try {
    const body = await req.json();
    const data = reportTemplateSchema.parse(body);

    const template = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.reportTemplate.updateMany({
          where: { workspaceId: workspace.workspaceId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.reportTemplate.create({
        data: {
          workspaceId: workspace.workspaceId,
          ...data,
          isDefault: data.isDefault ?? false,
        },
      });
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A template with this configuration already exists." }, { status: 409 });
    }

    console.error("Failed to create template", error);
    return NextResponse.json({ error: "Failed to create template." }, { status: 500 });
  }
}
