import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Create and manage client reports.</p>
      </div>
      <EmptyState
        icon={FileText}
        title="No reports yet"
        description="Create your first report once you have a client set up."
        actionLabel="Create report"
        actionHref="/reports/new"
      />
    </div>
  );
}
