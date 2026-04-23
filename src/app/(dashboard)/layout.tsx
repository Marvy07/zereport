import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
