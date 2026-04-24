import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSessionMetadata } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const metadata = await getSessionMetadata();
  if (metadata.platformRole !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 shrink-0 bg-red-900 text-white p-4">
        <div className="text-lg font-bold mb-6">⚙️ Admin</div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="hover:bg-red-800 px-2 py-1.5 rounded">
            Overview
          </Link>
          <Link href="/admin/users" className="hover:bg-red-800 px-2 py-1.5 rounded">
            Users
          </Link>
          <Link href="/admin/workspaces" className="hover:bg-red-800 px-2 py-1.5 rounded">
            Workspaces
          </Link>
          <Link href="/admin/subscriptions" className="hover:bg-red-800 px-2 py-1.5 rounded">
            Subscriptions
          </Link>
          <Link href="/admin/flags" className="hover:bg-red-800 px-2 py-1.5 rounded">
            Feature Flags
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
