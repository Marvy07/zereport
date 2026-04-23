import { FileText, Users, Send, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Clients",
    value: "0",
    description: "Active clients",
    icon: Users,
  },
  {
    title: "Reports Sent",
    value: "0",
    description: "All time",
    icon: Send,
  },
  {
    title: "Draft Reports",
    value: "0",
    description: "Pending review",
    icon: FileText,
  },
  {
    title: "Scheduled",
    value: "0",
    description: "Active schedules",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome to Zereport. Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No reports yet. Create your first client to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}
