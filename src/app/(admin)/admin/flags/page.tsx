import { prisma } from "@/lib/prisma";
import { FlagToggle } from "./FlagToggle";

export default async function AdminFlagsPage() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: [{ workspaceId: "asc" }, { key: "asc" }],
    include: {
      workspace: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Feature Flags ({flags.length})</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Scope</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No feature flags defined yet.
                </td>
              </tr>
            ) : (
              flags.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{f.key}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {f.workspace ? f.workspace.name : "Global"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    <FlagToggle flagId={f.id} initialValue={f.value} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
