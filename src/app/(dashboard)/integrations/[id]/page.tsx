import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function EditIntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const { id } = await params;
  const integration = await prisma.integration.findFirst({
    where: {
      id,
      workspaceId: workspace.workspaceId,
      status: { not: "DISCONNECTED" },
    },
  });

  if (!integration) {
    notFound();
  }

  return (
    <>
      <Header
        title={`Edit ${integration.name}`}
        description="Update integration details, inspect scaffold config, or disconnect the record when needed."
      />
      <main className="flex-1 p-6">
        <IntegrationForm
          mode="edit"
          integrationId={integration.id}
          initialValues={{
            type: integration.type,
            name: integration.name,
            status: integration.status,
            externalAccountId: integration.externalAccountId ?? undefined,
            configJson:
              integration.configJson && typeof integration.configJson === "object" && !Array.isArray(integration.configJson)
                ? (integration.configJson as Record<string, unknown>)
                : undefined,
          }}
        />
      </main>
    </>
  );
}
