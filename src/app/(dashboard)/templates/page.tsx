import Link from "next/link";
import { LayoutTemplate, Pencil } from "lucide-react";
import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function TemplatesPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    if (workspace.code === "workspace_not_provisioned") {
      redirect("/onboarding");
    }

    return (
      <>
        <Header title="Templates" description="Manage reusable branding and email defaults for client reports." />
        <main className="flex-1 p-6">
          <EmptyState icon={LayoutTemplate} title="Templates unavailable" description={workspace.error} actionLabel="Refresh" actionHref="/templates" />
        </main>
      </>
    );
  }

  const templates = await prisma.reportTemplate.findMany({
    where: { workspaceId: workspace.workspaceId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Header title="Templates" description="Manage reusable branding and email defaults for client reports." />
      <main className="flex-1 p-6">
        {templates.length === 0 ? (
          <EmptyState icon={LayoutTemplate} title="No templates yet" description="Create your first report template to save branding and email defaults for your workspace." actionLabel="Add template" actionHref="/templates/new" />
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-end">
              <Link href="/templates/new">
                <Button>Add template</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Default</th>
                        <th className="px-4 py-3 font-medium">Updated</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {templates.map((template) => (
                        <tr key={template.id}>
                          <td className="px-4 py-4 font-medium text-slate-950">{template.name}</td>
                          <td className="px-4 py-4">{template.description ?? <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-4">{template.isDefault ? "Yes" : "No"}</td>
                          <td className="px-4 py-4">{new Date(template.updatedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <Link href={`/templates/${template.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </>
  );
}
