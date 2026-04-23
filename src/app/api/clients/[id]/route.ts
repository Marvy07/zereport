import { Prisma } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { clientSchema } from "@/lib/validations/client";

const partialClientSchema = clientSchema.partial();

async function getScopedClient(id: string, workspaceId: string) {
  return prisma.client.findFirst({
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
  const client = await getScopedClient(id, workspace.workspaceId);

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({ client });
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
    const existingClient = await getScopedClient(id, workspace.workspaceId);

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const data = partialClientSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Update payload cannot be empty." }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id: existingClient.id },
      data,
    });

    return NextResponse.json({ client });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "A client with this primary email already exists in the workspace." },
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

    console.error("Failed to update client", error);
    return NextResponse.json({ error: "Failed to update client." }, { status: 500 });
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
    const client = await getScopedClient(id, workspace.workspaceId);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const archivedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return NextResponse.json({ client: archivedClient });
  } catch (error) {
    console.error("Failed to archive client", error);
    return NextResponse.json({ error: "Failed to archive client." }, { status: 500 });
  }
}
