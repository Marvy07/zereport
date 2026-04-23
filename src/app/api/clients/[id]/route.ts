import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

const partialClientSchema = clientSchema.partial();

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = partialClientSchema.parse(body);

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json({ client });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Client not found." }, { status: 404 });
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A client with this primary email already exists in the workspace." },
          { status: 409 }
        );
      }
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

    console.error("Failed to update client", error);
    return NextResponse.json({ error: "Failed to update client." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const client = await prisma.client.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    console.error("Failed to archive client", error);
    return NextResponse.json({ error: "Failed to archive client." }, { status: 500 });
  }
}
