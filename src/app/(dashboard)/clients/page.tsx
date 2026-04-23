import { Users } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ClientsPage() {
  return (
    <>
      <Header
        title="Clients"
        description="Manage the businesses you report for and keep their records organized."
      />
      <main className="flex-1 p-6">
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start organizing reporting work, contacts, and delivery history."
          actionLabel="Add client"
          actionHref="/clients/new"
        />
      </main>
    </>
  );
}
