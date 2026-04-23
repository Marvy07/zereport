import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar placeholder — full sidebar built in Section 4 */}
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col gap-4">
        <div className="text-xl font-bold text-white">Zereport</div>
        <nav className="flex flex-col gap-1 text-sm text-slate-300">
          <a href="/dashboard" className="hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">Dashboard</a>
          <a href="/clients" className="hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">Clients</a>
          <a href="/reports" className="hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">Reports</a>
          <a href="/integrations" className="hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">Integrations</a>
          <a href="/settings" className="hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">Settings</a>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
