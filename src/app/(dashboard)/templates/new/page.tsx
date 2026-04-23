import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { TemplateForm } from "@/components/reports/TemplateForm";
import { requireAuth } from "@/lib/auth";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function NewTemplatePage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok && workspace.code === "workspace_not_provisioned") {
    redirect("/onboarding");
  }

  return (
    <>
      <Header title="Create template" description="Save reusable branding and email defaults for future reports." />
      <main className="flex-1 p-6">
        <TemplateForm mode="create" />
      </main>
    </>
  );
}
