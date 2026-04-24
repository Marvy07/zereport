import Link from "next/link";
import { Pencil, Plug } from "lucide-react";
import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

function formatLastSyncedAt(value: Date | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "CONNECTED":
      return "default";
    case "DISCONNECTED":
      return "outline";
    default:
      return "secondary";
  }
}

export default async function IntegrationsPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const integrations = await prisma.integration.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      status: { not: "DISCONNECTED" },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Header
        title="Integrations"
        description="Manage workspace connectors and prepare secure connection flows before full sync logic lands."
      />
      <main className="flex-1 p-6">
        {integrations.length === 0 ? (
          <EmptyState
            icon={Plug}
            title="No integrations connected"
            description="Create your first integration record to manage connection status, scaffold config, and future sync setup."
            actionLabel="Add integration"
            actionHref="/integrations/new"
          />
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-end">
              <Link href="/integrations/new">
                <Button>Add integration</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Last synced</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {integrations.map((integration) => (
                        <tr key={integration.id}>
                          <td className="px-4 py-4">{integration.type.replaceAll("_", " ")}</td>
                          <td className="px-4 py-4 font-medium text-slate-950">{integration.name}</td>
                          <td className="px-4 py-4">
                            <Badge variant={getBadgeVariant(integration.status)}>{integration.status}</Badge>
                          </td>
                          <td className="px-4 py-4">{formatLastSyncedAt(integration.lastSyncedAt)}</td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/integrations/${integration.id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Manage
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
