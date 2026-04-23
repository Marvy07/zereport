import { redirect } from "next/navigation";

import { ClientForm } from "@/components/clients/ClientForm";
import { Header } from "@/components/dashboard/Header";
import { requireAuth } from "@/lib/auth";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { handleWorkspaceResolution } from "@/lib/workspace-navigation";

export default async function NewClientPage() {
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
        title="Add client"
        description="Create a client record so projects, contacts, and reports have a clean home."
      />
      <main className="flex-1 p-6">
        <ClientForm mode="create" />
      </main>
    </>
  );
}
