import { clerkClient, auth } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { syncPlatformUser } from "@/lib/platform-user";

const onboardingWorkspaceSchema = z.object({
  workspaceName: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(2).max(100),
});

function slugifyWorkspaceName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

async function buildUniqueSlug(base: string, existingWorkspaceId?: string) {
  let slug = base;
  let counter = 1;

  for (;;) {
    const existingWorkspace = await prisma.workspace.findUnique({ where: { slug } });

    if (!existingWorkspace || existingWorkspace.id === existingWorkspaceId) {
      return slug;
    }

    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceName, timezone } = onboardingWorkspaceSchema.parse(body);
    const platformUser = await syncPlatformUser();

    if (!platformUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const client = await clerkClient();

    const organization = orgId
      ? await client.organizations.getOrganization({ organizationId: orgId })
      : await client.organizations.createOrganization({
          name: workspaceName,
          slug: slugifyWorkspaceName(workspaceName),
          createdBy: platformUser.clerkUserId,
        });

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { clerkOrgId: organization.id },
      select: { id: true, slug: true },
    });

    const workspaceSlug = await buildUniqueSlug(
      slugifyWorkspaceName(workspaceName),
      existingWorkspace?.id
    );

    const workspace = await prisma.workspace.upsert({
      where: { clerkOrgId: organization.id },
      create: {
        clerkOrgId: organization.id,
        name: workspaceName,
        slug: workspaceSlug,
        timezone,
      },
      update: {
        name: workspaceName,
        slug: workspaceSlug,
        timezone,
        deletedAt: null,
      },
    });

    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_platformUserId: {
          workspaceId: workspace.id,
          platformUserId: platformUser.id,
        },
      },
      create: {
        workspaceId: workspace.id,
        platformUserId: platformUser.id,
        role: "OWNER",
      },
      update: {
        role: "OWNER",
      },
    });

    return NextResponse.json({ success: true, redirectTo: "/dashboard", clerkOrgId: organization.id });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A workspace with this organization mapping already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Failed to complete workspace onboarding", error);
    return NextResponse.json({ error: "Failed to complete workspace onboarding." }, { status: 500 });
  }
}
