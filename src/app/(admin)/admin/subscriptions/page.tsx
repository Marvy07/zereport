import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      workspaceId: true,
      plan: true,
      status: true,
      stripeCustomerId: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscriptions ({subs.length})</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Workspace</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Stripe Customer</th>
              <th className="px-4 py-3 text-left">Period End</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/workspaces/${s.workspaceId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {s.workspace.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      s.plan === "AGENCY"
                        ? "bg-purple-100 text-purple-700"
                        : s.plan === "PRO"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      s.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : s.status === "CANCELED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {s.stripeCustomerId}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {s.currentPeriodEnd
                    ? new Date(s.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
