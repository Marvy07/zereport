import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;

  const user = await prisma.platformUser.findUnique({
    where: { id: userId },
    include: {
      workspaceMemberships: {
        include: { workspace: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">User Detail</h1>

      <div className="rounded-lg border bg-white p-6 space-y-3 text-sm">
        <Row label="Email" value={user.email} />
        <Row
          label="Name"
          value={[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
        />
        <Row label="Platform Admin" value={user.isPlatformAdmin ? "Yes" : "No"} />
        <Row label="Joined" value={new Date(user.createdAt).toLocaleString()} />
        <Row
          label="Last Seen"
          value={user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "—"}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Workspace Memberships</h2>
        {user.workspaceMemberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">No memberships.</p>
        ) : (
          <div className="rounded-lg border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Workspace</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {user.workspaceMemberships.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.workspace.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.workspace.slug}</td>
                    <td className="px-4 py-3">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-32 shrink-0 font-medium text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
