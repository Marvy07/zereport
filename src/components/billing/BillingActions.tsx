"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BillingActionsProps {
  plan: "FREE" | "PRO" | "AGENCY";
  currentPlan: "FREE" | "PRO" | "AGENCY";
  isSubscribed: boolean;
}

export function BillingActions({ plan, currentPlan, isSubscribed }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  const isCurrentPlan = plan === currentPlan;
  const isFree = plan === "FREE";

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout failed:", data.error);
      }
    } catch (err) {
      console.error("Checkout request failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal failed:", data.error);
      }
    } catch (err) {
      console.error("Portal request failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (isFree) {
    return null; // No action needed for FREE plan card
  }

  if (isCurrentPlan && isSubscribed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleManage}
        disabled={loading}
      >
        {loading ? "Redirecting…" : "Manage Subscription"}
      </Button>
    );
  }

  if (isCurrentPlan && !isSubscribed) {
    return (
      <Button size="sm" className="w-full" disabled>
        Current Plan
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="w-full"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? "Redirecting…" : `Upgrade to ${plan === "PRO" ? "Pro" : "Agency"}`}
    </Button>
  );
}
