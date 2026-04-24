"use client";

import { ScheduleFrequency } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ScheduleInput } from "@/lib/validations/schedule";

interface Option {
  id: string;
  name: string;
}

interface ScheduleFormProps {
  mode: "create" | "edit";
  scheduleId?: string;
  projects?: Option[];
  templates?: Option[];
  initialValues?: Partial<ScheduleInput>;
}

const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  MONTHLY: "Monthly",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "UTC",
  "Europe/London",
  "Europe/Paris",
];

interface FormValues {
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  timezone: string;
  isActive: boolean;
  projectId?: string;
  reportTemplateId?: string;
}

export function ScheduleForm({ mode, scheduleId, projects = [], templates = [], initialValues }: ScheduleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    frequency: initialValues?.frequency ?? ScheduleFrequency.MONTHLY,
    dayOfWeek: initialValues?.dayOfWeek,
    dayOfMonth: initialValues?.dayOfMonth,
    hour: initialValues?.hour ?? 9,
    timezone: initialValues?.timezone ?? "America/Chicago",
    isActive: initialValues?.isActive ?? true,
    projectId: initialValues?.projectId,
    reportTemplateId: initialValues?.reportTemplateId,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(
        mode === "create" ? "/api/schedules" : `/api/schedules/${scheduleId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to save schedule.");
      }

      router.push("/schedules");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save schedule.");
    } finally {
      setIsSaving(false);
    }
  }

  const needsDayOfWeek =
    values.frequency === ScheduleFrequency.WEEKLY ||
    values.frequency === ScheduleFrequency.BIWEEKLY;
  const needsDayOfMonth = values.frequency === ScheduleFrequency.MONTHLY;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{mode === "create" ? "New schedule" : "Edit schedule"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Frequency */}
          <div className="space-y-1.5">
            <Label htmlFor="frequency">Frequency</Label>
            <select
              id="frequency"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={values.frequency}
              onChange={(e) => updateField("frequency", e.target.value as ScheduleFrequency)}
              required
            >
              {Object.values(ScheduleFrequency).map((freq) => (
                <option key={freq} value={freq}>
                  {FREQUENCY_LABELS[freq]}
                </option>
              ))}
            </select>
          </div>

          {/* Day of week — for weekly/biweekly */}
          {needsDayOfWeek && (
            <div className="space-y-1.5">
              <Label htmlFor="dayOfWeek">Day of week</Label>
              <select
                id="dayOfWeek"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={values.dayOfWeek ?? 1}
                onChange={(e) => updateField("dayOfWeek", Number(e.target.value))}
              >
                {DAY_NAMES.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of month — for monthly */}
          {needsDayOfMonth && (
            <div className="space-y-1.5">
              <Label htmlFor="dayOfMonth">Day of month</Label>
              <select
                id="dayOfMonth"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={values.dayOfMonth ?? 1}
                onChange={(e) => updateField("dayOfMonth", Number(e.target.value))}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Days capped at 28 to support all months.</p>
            </div>
          )}

          {/* Hour */}
          <div className="space-y-1.5">
            <Label htmlFor="hour">Send hour (24h)</Label>
            <select
              id="hour"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={values.hour}
              onChange={(e) => updateField("hour", Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={values.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Project (optional) */}
          {projects.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="projectId">Project (optional)</Label>
              <select
                id="projectId"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={values.projectId ?? ""}
                onChange={(e) => updateField("projectId", e.target.value || undefined)}
              >
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Template (optional) */}
          {templates.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="reportTemplateId">Report template (optional)</Label>
              <select
                id="reportTemplateId"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={values.reportTemplateId ?? ""}
                onChange={(e) => updateField("reportTemplateId", e.target.value || undefined)}
              >
                <option value="">— None —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600"
              checked={values.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : mode === "create" ? "Create schedule" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
