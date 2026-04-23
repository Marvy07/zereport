import { BarChart3, CalendarClock, FileClock, Users } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Clients", value: "0", icon: Users },
  { label: "Reports Sent", value: "0", icon: BarChart3 },
  { label: "Draft Reports", value: "0", icon: FileClock },
  { label: "Scheduled", value: "0", icon: CalendarClock },
];

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Track client activity, delivery status, and upcoming reporting work."
      />
      <main className="flex-1 space-y-6 p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
                <p className="mt-1 text-xs text-slate-500">No data yet. Connect clients and reports to populate this card.</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">
              Your most recent generated and scheduled reports will appear here.
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
