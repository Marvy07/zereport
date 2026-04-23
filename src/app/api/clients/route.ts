import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

async function getFallbackWorkspaceId() {
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return workspace?.id ?? null;
}

export async function GET() {
  // TODO: Enforce current workspace filtering after onboarding creates workspace records.
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = clientSchema.parse(body);
    const workspaceId = await getFallbackWorkspaceId();

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "No workspace found. Complete workspace onboarding before creating clients.",
        },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        workspaceId,
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

    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: (error as Error & { issues: unknown }).issues,
        },
        { status: 400 }
      );
    }

    console.error("Failed to create client", error);
    return NextResponse.json({ error: "Failed to create client." }, { status: 500 });
  }
}
