import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your clients and their projects.</p>
        </div>
      </div>
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add your first client to start creating reports."
        actionLabel="Add client"
        actionHref="/clients/new"
      />
    </div>
  );
}
