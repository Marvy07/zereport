import { Prisma } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { createIntegrationSchema } from "@/lib/validations/integration";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const integrations = await prisma.integration.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      status: { not: "DISCONNECTED" },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ integrations });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createIntegrationSchema.parse(body);
    const workspace = await resolveWorkspaceForRequest();

    if (!workspace.ok) {
      return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
    }

    const integration = await prisma.integration.create({
      data: {
        ...data,
        status: data.type === "MANUAL" ? "CONNECTED" : "DISCONNECTED",
        workspaceId: workspace.workspaceId,
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An integration with this name already exists in the workspace." },
        { status: 409 }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Failed to create integration", error);
    return NextResponse.json({ error: "Failed to create integration." }, { status: 500 });
  }
}
