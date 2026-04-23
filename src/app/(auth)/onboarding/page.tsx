"use client";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function OnboardingPage() {
  const { user } = useUser();
  const { setActive } = useOrganizationList();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState(
    user?.organizationMemberships?.[0]?.organization?.name ?? ""
  );
  const [timezone, setTimezone] = useState("America/Chicago");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceName, timezone }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; redirectTo?: string; clerkOrgId?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to set up workspace.");
      }

      if (payload?.clerkOrgId && setActive) {
        await setActive({ organization: payload.clerkOrgId });
      }

      router.push(payload?.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to set up workspace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-3xl">🗂️</div>
          <CardTitle className="text-2xl">Welcome to Zereport</CardTitle>
          <CardDescription>
            Let&apos;s set up your workspace so you can start sending reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                placeholder="e.g. Acme Agency"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Your timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Continue to dashboard →"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
