import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, Pencil, Users } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

export default async function ClientsPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const clients = await prisma.client.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      status: { not: "ARCHIVED" },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Clients"
        description="Manage the businesses you report for and keep their records organized."
      />
      <main className="flex-1 p-6">
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add your first client to start organizing reporting work, contacts, and delivery history."
            actionLabel="Add client"
            actionHref="/clients/new"
          />
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-end">
              <Link href="/clients/new">
                <Button>Add client</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Primary email</th>
                        <th className="px-4 py-3 font-medium">Website</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {clients.map((client) => (
                        <tr key={client.id}>
                          <td className="px-4 py-4 font-medium text-slate-950">{client.name}</td>
                          <td className="px-4 py-4">{client.primaryEmail}</td>
                          <td className="px-4 py-4">
                            {client.website ? (
                              <a
                                href={client.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                Visit
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">{client.status}</td>
                          <td className="px-4 py-4">{new Date(client.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/clients/${client.id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                            >
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
