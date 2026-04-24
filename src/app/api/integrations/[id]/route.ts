import { Prisma } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { updateIntegrationSchema } from "@/lib/validations/integration";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

async function getScopedIntegration(id: string, workspaceId: string) {
  return prisma.integration.findFirst({
    where: {
      id,
      workspaceId,
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
  const integration = await getScopedIntegration(id, workspace.workspaceId);

  if (!integration || integration.status === "DISCONNECTED") {
    return NextResponse.json({ error: "Integration not found." }, { status: 404 });
  }

  return NextResponse.json({ integration });
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
    const existingIntegration = await getScopedIntegration(id, workspace.workspaceId);

    if (!existingIntegration || existingIntegration.status === "DISCONNECTED") {
      return NextResponse.json({ error: "Integration not found." }, { status: 404 });
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const data = updateIntegrationSchema.parse(body);

    const integration = await prisma.integration.update({
      where: { id: existingIntegration.id },
      data,
    });

    return NextResponse.json({ integration });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An integration with this name already exists in the workspace." },
        { status: 409 }
      );
    }

    if (error instanceof ZodError) {
      const emptyPayloadError = error.issues.find((issue) => issue.message === "Update payload cannot be empty.");
      return NextResponse.json(
        {
          error: emptyPayloadError?.message ?? "Validation failed.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Failed to update integration", error);
    return NextResponse.json({ error: "Failed to update integration." }, { status: 500 });
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
    const integration = await getScopedIntegration(id, workspace.workspaceId);

    if (!integration || integration.status === "DISCONNECTED") {
      return NextResponse.json({ error: "Integration not found." }, { status: 404 });
    }

    const disconnectedIntegration = await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: "DISCONNECTED",
        accessTokenEnc: null,
        refreshTokenEnc: null,
        apiKeyEnc: null,
        tokenExpiresAt: null,
        externalAccountId: null,
        lastError: null,
        lastSyncedAt: null,
      },
    });

    return NextResponse.json({
      integration: disconnectedIntegration,
      note: "Integration records are soft-disconnected so workspace history remains intact.",
    });
  } catch (error) {
    console.error("Failed to disconnect integration", error);
    return NextResponse.json({ error: "Failed to disconnect integration." }, { status: 500 });
  }
}
