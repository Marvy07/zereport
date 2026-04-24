import Link from "next/link";
import { Download, ExternalLink, FileText, Pencil } from "lucide-react";

import { SendReportButton } from "@/components/reports/SendReportButton";
import { redirect } from "next/navigation";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleWorkspaceResolutionFailure, resolveWorkspaceForRequest } from "@/lib/workspace";

function formatPeriod(periodStart: Date | null, periodEnd: Date | null) {
  if (!periodStart && !periodEnd) return "—";

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (periodStart && periodEnd) {
    return `${formatter.format(periodStart)} to ${formatter.format(periodEnd)}`;
  }

  return formatter.format(periodStart ?? periodEnd!);
}

function getBadgeVariant(status: string): "secondary" | "outline" | "default" {
  switch (status) {
    case "READY":
      return "default";
    case "ARCHIVED":
      return "outline";
    case "SENT":
      return "default";
    default:
      return "secondary";
  }
}

export default async function ReportsPage() {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    handleWorkspaceResolutionFailure(workspace);
  }

  const reports = await prisma.report.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      status: { not: "ARCHIVED" },
    },
    include: {
      client: {
        select: {
          name: true,
          primaryEmail: true,
          contacts: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <Header title="Reports" description="Create, review, and manage client-ready reports tied to your workspace records." />
      <main className="flex-1 p-6">
        {reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports created" description="Create your first report to start building repeatable delivery for your clients." actionLabel="Create report" actionHref="/reports/new" />
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-end">
              <Link href="/reports/new">
                <Button>Create report</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Client</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Period</th>
                        <th className="px-4 py-3 font-medium">Updated</th>
                        <th className="px-4 py-3 font-medium">Sent</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-4 py-4 font-medium text-slate-950">{report.title}</td>
                          <td className="px-4 py-4">{report.client.name}</td>
                          <td className="px-4 py-4">
                            <Badge variant={getBadgeVariant(report.status)}>{report.status}</Badge>
                          </td>
                          <td className="px-4 py-4">{formatPeriod(report.periodStart, report.periodEnd)}</td>
                          <td className="px-4 py-4">{new Date(report.updatedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">{report.sentAt ? new Date(report.sentAt).toLocaleString() : "Not sent"}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <SendReportButton reportId={report.id} hasRecipients={Boolean(report.client.primaryEmail || report.client.contacts.length)} />
                              <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Link>
                              {report.webSlug ? (
                                <Link href={`/r/${report.webSlug}?token=requires-email-link`} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:underline">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View hosted report
                                </Link>
                              ) : null}
                              <Link href={`/api/reports/${report.id}/pdf`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:underline">
                                <Download className="h-3.5 w-3.5" />
                                Download PDF
                              </Link>
                            </div>
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
