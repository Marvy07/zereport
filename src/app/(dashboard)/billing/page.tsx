import { CheckCircle2 } from "lucide-react";

import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest, handleWorkspaceResolutionFailure } from "@/lib/workspace";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { BillingActions } from "@/components/billing/BillingActions";

const PLAN_FEATURES: Record<string, { label: string; features: string[] }> = {
  FREE: {
    label: "Free",
    features: [
      "Up to 3 clients",
      "Up to 10 reports",
      "1 workspace user",
      "Basic templates",
    ],
  },
  PRO: {
    label: "Pro",
    features: [
      "Up to 25 clients",
      "Up to 100 reports",
      "Up to 5 workspace users",
      "Custom branding",
      "Scheduled delivery",
    ],
  },
  AGENCY: {
    label: "Agency",
    features: [
      "Unlimited clients",
      "Unlimited reports",
      "Unlimited workspace users",
      "White-label reports",
      "Priority support",
    ],
  },
};

function formatLimit(n: number) {
  return n === -1 ? "Unlimited" : n.toString();
}

export default async function BillingPage() {
  const resolution = await resolveWorkspaceForRequest();

  if (!resolution.ok) {
    handleWorkspaceResolutionFailure(resolution);
  }

  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId: resolution.workspaceId },
    select: {
      plan: true,
      status: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  const currentPlan = (subscription?.plan ?? "FREE") as "FREE" | "PRO" | "AGENCY";
  const isSubscribed = !!subscription?.stripeSubscriptionId;
  const limits = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.FREE;

  return (
    <>
      <Header
        title="Billing"
        description="Manage your subscription plan and billing details."
      />
      <main className="flex-1 space-y-6 p-6">
        {/* Current plan summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Plan:</span>{" "}
              <span className="capitalize">{PLAN_FEATURES[currentPlan]?.label ?? currentPlan}</span>
            </p>
            <p>
              <span className="font-medium">Clients:</span> {formatLimit(limits.clients)}
            </p>
            <p>
              <span className="font-medium">Reports:</span> {formatLimit(limits.reports)}
            </p>
            <p>
              <span className="font-medium">Users:</span> {formatLimit(limits.users)}
            </p>
            {subscription?.currentPeriodEnd ? (
              <p className="text-slate-500">
                {subscription.cancelAtPeriodEnd
                  ? "Cancels on: "
                  : "Renews on: "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Plan cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {(["FREE", "PRO", "AGENCY"] as const).map((plan) => {
            const meta = PLAN_FEATURES[plan];
            const isCurrentPlan = plan === currentPlan;

            return (
              <Card
                key={plan}
                className={isCurrentPlan ? "border-blue-600 ring-1 ring-blue-600" : undefined}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {meta.label}
                    {isCurrentPlan && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                        Current
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {meta.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <BillingActions
                    plan={plan}
                    currentPlan={currentPlan}
                    isSubscribed={isSubscribed}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
