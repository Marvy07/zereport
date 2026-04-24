import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const [userCount, workspaceCount, subscriptions] = await Promise.all([
    prisma.platformUser.count(),
    prisma.workspace.count(),
    prisma.subscription.groupBy({
      by: ["plan", "status"],
      _count: { id: true },
    }),
  ]);

  const byPlan: Record<string, number> = {};
  let canceledCount = 0;

  for (const row of subscriptions) {
    if (row.status === "CANCELED") {
      canceledCount += row._count.id;
    } else {
      byPlan[row.plan] = (byPlan[row.plan] ?? 0) + row._count.id;
    }
  }

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Total Workspaces", value: workspaceCount },
    { label: "Free", value: byPlan["FREE"] ?? 0 },
    { label: "Pro", value: byPlan["PRO"] ?? 0 },
    { label: "Agency", value: byPlan["AGENCY"] ?? 0 },
    { label: "Canceled", value: canceledCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
