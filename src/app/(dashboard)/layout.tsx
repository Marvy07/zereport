import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireAuth } from "@/lib/auth";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { handleWorkspaceResolution } from "@/lib/workspace-navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();
  handleWorkspaceResolution(workspace);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar workspaceName={workspace.workspace.name} />
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
