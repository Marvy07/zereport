import { Plug } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";

export default function IntegrationsPage() {
  return (
    <>
      <Header
        title="Integrations"
        description="Connect the tools Zereport needs for data collection, delivery, and automation."
      />
      <main className="flex-1 p-6">
        <EmptyState
          icon={Plug}
          title="No integrations connected"
          description="Connect your data sources and delivery tools once backend integration flows are ready."
        />
      </main>
    </>
  );
}
