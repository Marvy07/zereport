import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminWorkspacesPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      clerkOrgId: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Workspaces ({workspaces.length})</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Org ID</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workspaces.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{w.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{w.slug}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{w.clerkOrgId}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(w.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/workspaces/${w.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
