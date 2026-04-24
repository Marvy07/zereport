"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  workspaceId: string;
  currentPlan: string;
}

const PLANS = ["FREE", "PRO", "AGENCY"] as const;

export function PlanOverride({ workspaceId, currentPlan }: Props) {
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleOverride() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}/override-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage(`Plan updated to ${plan}`);
    } catch {
      setMessage("Error updating plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className="rounded border px-2 py-1.5 text-sm"
      >
        {PLANS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleOverride} disabled={loading}>
        {loading ? "Saving…" : "Override Plan"}
      </Button>
      {message && <span className="text-sm text-green-600">{message}</span>}
    </div>
  );
}
