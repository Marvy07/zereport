import { ClientForm } from "@/components/clients/ClientForm";
import { Header } from "@/components/dashboard/Header";

export default function NewClientPage() {
  return (
    <>
      <Header
        title="Add client"
        description="Create a client record so projects, contacts, and reports have a clean home."
      />
      <main className="flex-1 p-6">
        <ClientForm mode="create" />
      </main>
    </>
  );
}
