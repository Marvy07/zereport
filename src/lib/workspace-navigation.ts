import { notFound, redirect } from "next/navigation";

import type { WorkspaceResolution } from "@/lib/workspace";

export function handleWorkspaceResolution(resolution: WorkspaceResolution): asserts resolution is Extract<WorkspaceResolution, { ok: true }> {
  if (resolution.ok) {
    return;
  }

  switch (resolution.code) {
    case "unauthenticated":
      redirect("/sign-in");
    case "no_active_workspace":
    case "workspace_not_provisioned":
      redirect("/onboarding");
    case "membership_missing":
    default:
      notFound();
  }
}
