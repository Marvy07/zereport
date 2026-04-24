import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlanOverride } from "./PlanOverride";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function AdminWorkspaceDetailPage({ params }: Props) {
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      members: {
        include: {
          platformUser: { select: { email: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!workspace) notFound();

  const sub = workspace.subscriptions[0] ?? null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{workspace.name}</h1>

      <div className="rounded-lg border bg-white p-6 space-y-3 text-sm">
        <h2 className="font-semibold text-base mb-2">Details</h2>
        <Row label="Slug" value={workspace.slug} />
        <Row label="Timezone" value={workspace.timezone} />
        <Row label="Created" value={new Date(workspace.createdAt).toLocaleString()} />
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-3 text-sm">
        <h2 className="font-semibold text-base mb-2">Subscription</h2>
        {sub ? (
          <>
            <Row label="Plan" value={sub.plan} />
            <Row label="Status" value={sub.status} />
            <Row label="Stripe Customer" value={sub.stripeCustomerId} />
            <Row
              label="Period End"
              value={sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
            />
            <Row label="Cancel at End" value={sub.cancelAtPeriodEnd ? "Yes" : "No"} />
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">Override plan:</p>
              <PlanOverride workspaceId={workspace.id} currentPlan={sub.plan} />
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No subscription on record.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {workspace.members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-mono text-xs">{m.platformUser.email}</td>
                  <td className="px-4 py-3">
                    {[m.platformUser.firstName, m.platformUser.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-32 shrink-0 font-medium text-gray-500">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
