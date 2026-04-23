import { Plug } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Connect your tools to pull data into reports.</p>
      </div>
      <EmptyState
        icon={Plug}
        title="No integrations connected"
        description="Connect Google Sheets, Notion, Trello, GoHighLevel, or use Zapier webhooks."
      />
    </div>
  );
}
