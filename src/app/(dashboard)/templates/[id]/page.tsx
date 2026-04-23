import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { TemplateForm } from "@/components/reports/TemplateForm";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
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
  const template = await prisma.reportTemplate.findFirst({
    where: {
      id,
      workspaceId: workspace.workspaceId,
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <>
      <Header title={`Edit ${template.name}`} description="Update branding defaults, email copy, or default template status." />
      <main className="flex-1 p-6">
        <TemplateForm
          mode="edit"
          templateId={template.id}
          initialValues={{
            name: template.name,
            description: template.description ?? undefined,
            isDefault: template.isDefault,
            primaryColor: template.primaryColor ?? undefined,
            secondaryColor: template.secondaryColor ?? undefined,
            fontFamily: template.fontFamily ?? undefined,
            emailSubjectTemplate: template.emailSubjectTemplate ?? undefined,
            emailBodyTemplate: template.emailBodyTemplate ?? undefined,
          }}
        />
      </main>
    </>
  );
}
