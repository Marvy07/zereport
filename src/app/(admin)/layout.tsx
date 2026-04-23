import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check platform admin — stored in Clerk publicMetadata
  const isPlatformAdmin = (sessionClaims?.metadata as { platformRole?: string })?.platformRole === "admin";

  if (!isPlatformAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-red-900 text-white p-4">
        <div className="text-lg font-bold mb-4">⚙️ Admin</div>
        <nav className="flex flex-col gap-1 text-sm">
          <a href="/admin" className="hover:bg-red-800 px-2 py-1.5 rounded">Overview</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
