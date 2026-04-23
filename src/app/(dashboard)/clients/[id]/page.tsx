import { notFound, redirect } from "next/navigation";

import { ClientForm } from "@/components/clients/ClientForm";
import { Header } from "@/components/dashboard/Header";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { handleWorkspaceResolution } from "@/lib/workspace-navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();
  handleWorkspaceResolution(workspace);

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: {
      id,
      workspaceId: workspace.workspaceId,
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <>
      <Header
        title={`Edit ${client.name}`}
        description="Update client details, fix contact information, or archive the record when needed."
      />
      <main className="flex-1 p-6">
        <ClientForm
          mode="edit"
          clientId={client.id}
          initialValues={{
            name: client.name,
            companyName: client.companyName ?? undefined,
            primaryEmail: client.primaryEmail,
            website: client.website ?? undefined,
            notes: client.notes ?? undefined,
          }}
        />
      </main>
    </>
  );
}
