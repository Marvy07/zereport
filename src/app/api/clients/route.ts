import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { clientSchema } from "@/lib/validations/client";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error }, { status: workspace.status });
  }

  const includeArchived = req.nextUrl.searchParams.get("includeArchived") === "true";

  const clients = await prisma.client.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      ...(includeArchived ? {} : { status: { not: "ARCHIVED" } }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = clientSchema.parse(body);
    const workspace = await resolveWorkspaceForRequest();

    if (!workspace.ok) {
      return NextResponse.json({ error: workspace.error }, { status: workspace.status });
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        workspaceId: workspace.workspaceId,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A client with this primary email already exists in the workspace.",
        },
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

    console.error("Failed to create client", error);
    return NextResponse.json({ error: "Failed to create client." }, { status: 500 });
  }
}
