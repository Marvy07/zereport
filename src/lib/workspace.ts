import { WorkspaceRole } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { syncPlatformUser } from "@/lib/platform-user";

export type WorkspaceResolutionErrorCode =
  | "unauthenticated"
  | "no_active_workspace"
  | "workspace_not_provisioned"
  | "membership_missing";

export type WorkspaceResolution =
  | {
      ok: true;
      workspaceId: string;
      workspace: {
        id: string;
        clerkOrgId: string;
        name: string;
        slug: string;
        timezone: string;
      };
      membership: {
        id: string;
        role: WorkspaceRole;
        platformUserId: string;
      };
    }
  | {
      ok: false;
      status: 401 | 403 | 404 | 409;
      code: WorkspaceResolutionErrorCode;
      error: string;
    };

export async function resolveWorkspaceForRequest(): Promise<WorkspaceResolution> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return {
      ok: false,
      status: 401,
      code: "unauthenticated",
      error: "Unauthorized.",
    };
  }

  if (!orgId) {
    return {
      ok: false,
      status: 409,
      code: "no_active_workspace",
      error: "No active workspace selected. Choose or create a workspace to continue.",
    };
  }

  const platformUser = await syncPlatformUser();

  if (!platformUser) {
    return {
      ok: false,
      status: 401,
      code: "unauthenticated",
      error: "Unauthorized.",
    };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: {
      id: true,
      clerkOrgId: true,
      name: true,
      slug: true,
      timezone: true,
      deletedAt: true,
    },
  });

  if (!workspace || workspace.deletedAt) {
    return {
      ok: false,
      status: 404,
      code: "workspace_not_provisioned",
      error: "The active Clerk organization is not provisioned as a Zereport workspace yet.",
    };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_platformUserId: {
        workspaceId: workspace.id,
        platformUserId: platformUser.id,
      },
    },
    select: {
      id: true,
      role: true,
      platformUserId: true,
    },
  });

  if (!membership) {
    return {
      ok: false,
      status: 403,
      code: "membership_missing",
      error: "You are signed in, but you do not belong to the active workspace.",
    };
  }

  return {
    ok: true,
    workspaceId: workspace.id,
    workspace: {
      id: workspace.id,
      clerkOrgId: workspace.clerkOrgId,
      name: workspace.name,
      slug: workspace.slug,
      timezone: workspace.timezone,
    },
    membership,
  };
}

export async function requireResolvedWorkspace() {
  const resolution = await resolveWorkspaceForRequest();

  if (!resolution.ok) {
    const error = new Error(resolution.error) as Error & {
      code?: WorkspaceResolutionErrorCode;
      status?: number;
    };
    error.code = resolution.code;
    error.status = resolution.status;
    throw error;
  }

  return resolution;
}
