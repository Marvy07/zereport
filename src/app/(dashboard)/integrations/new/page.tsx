import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import { requireAuth } from "@/lib/auth";
import { handleWorkspaceResolution } from "@/lib/workspace-navigation";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function NewIntegrationPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();
  handleWorkspaceResolution(workspace);

  return (
    <>
      <Header
        title="Add integration"
        description="Create a connector record for this workspace and kick off the first connection step where available."
      />
      <main className="flex-1 p-6">
        <IntegrationForm mode="create" />
      </main>
    </>
  );
}
