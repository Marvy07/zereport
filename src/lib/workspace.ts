import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

type WorkspaceResolution =
  | { ok: true; workspaceId: string }
  | { ok: false; status: 400 | 409; error: string };

/**
 * TODO: Replace this transitional resolver once onboarding persists a real
 * user/org-to-workspace mapping. Until then, only a single workspace instance
 * is safe to auto-resolve.
 */
export async function resolveWorkspaceForRequest(): Promise<WorkspaceResolution> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, status: 401 as never, error: "Unauthorized." } as never;
  }

  const workspaces = await prisma.workspace.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
    take: 2,
  });

  if (workspaces.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "No workspace found. Complete workspace onboarding before managing clients.",
    };
  }

  if (workspaces.length > 1) {
    return {
      ok: false,
      status: 409,
      error:
        "Workspace resolution is not configured yet for multi-workspace accounts. Complete onboarding before managing clients.",
    };
  }

  return { ok: true, workspaceId: workspaces[0].id };
}

export async function requireResolvedWorkspace(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const resolution = await resolveWorkspaceForRequest();

  if (!resolution.ok) {
    throw new Error(resolution.error);
  }

  return resolution.workspaceId;
}
