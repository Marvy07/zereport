import { FileText } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Reports"
        description="Create, review, and schedule the reports you send to clients."
      />
      <main className="flex-1 p-6">
        <EmptyState
          icon={FileText}
          title="No reports created"
          description="Create your first report to start building repeatable delivery for your clients."
          actionLabel="Create report"
          actionHref="/reports/new"
        />
      </main>
    </>
  );
}
