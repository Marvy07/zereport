"use client";

import { ReportStatus, type ReportStatus as ReportStatusValue } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportInput } from "@/lib/validations/report";

interface Option {
  id: string;
  name: string;
}

interface ReportFormValues {
  title: string;
  clientId: string;
  projectId?: string;
  reportTemplateId?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: ReportStatusValue;
}

interface ReportFormProps {
  mode: "create" | "edit";
  reportId?: string;
  clients: Option[];
  templates: Option[];
  initialValues?: Partial<ReportInput>;
  showStatusField?: boolean;
}

const defaultValues: ReportFormValues = {
  title: "",
  clientId: "",
  projectId: undefined,
  reportTemplateId: undefined,
  periodStart: undefined,
  periodEnd: undefined,
  status: ReportStatus.DRAFT,
};

function toDateInputValue(value?: string | Date) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export function ReportForm({ mode, reportId, clients, templates, initialValues, showStatusField = false }: ReportFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ReportFormValues>({
    ...defaultValues,
    title: initialValues?.title ?? defaultValues.title,
    clientId: initialValues?.clientId ?? defaultValues.clientId,
    projectId: initialValues?.projectId ?? defaultValues.projectId,
    reportTemplateId: initialValues?.reportTemplateId ?? defaultValues.reportTemplateId,
    periodStart: toDateInputValue(initialValues?.periodStart),
    periodEnd: toDateInputValue(initialValues?.periodEnd),
    status: initialValues?.status ?? defaultValues.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  function updateField<K extends keyof ReportFormValues>(field: K, value: ReportFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(mode === "create" ? "/api/reports" : `/api/reports/${reportId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to save report.");
      }

      router.push("/reports");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save report.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!reportId) return;
    if (!window.confirm("Archive this report? This keeps the record while removing it from the active reports list.")) return;

    setError(null);
    setIsArchiving(true);

    try {
      const response = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to archive report.");
      }

      router.push("/reports");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive report.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create report" : "Edit report"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Start a new client report using a workspace client and optional template."
            : "Update report details, change status, or archive it when it is no longer active."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Report title</Label>
              <Input id="title" value={values.title} onChange={(event) => updateField("title", event.target.value)} minLength={2} maxLength={160} required placeholder="April 2026 performance report" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <select
                id="clientId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                value={values.clientId}
                onChange={(event) => updateField("clientId", event.target.value)}
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportTemplateId">Template</Label>
              <select
                id="reportTemplateId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                value={values.reportTemplateId ?? ""}
                onChange={(event) => updateField("reportTemplateId", event.target.value || undefined)}
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period start</Label>
              <Input id="periodStart" type="date" value={values.periodStart ?? ""} onChange={(event) => updateField("periodStart", event.target.value || undefined)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period end</Label>
              <Input id="periodEnd" type="date" value={values.periodEnd ?? ""} onChange={(event) => updateField("periodEnd", event.target.value || undefined)} />
            </div>
            {showStatusField ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  value={values.status ?? ReportStatus.DRAFT}
                  onChange={(event) => updateField("status", event.target.value as ReportStatusValue)}
                >
                  {Object.values(ReportStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" ? (
              <Button type="button" variant="destructive" onClick={handleArchive} disabled={isArchiving || isSaving}>
                {isArchiving ? "Archiving..." : "Archive report"}
              </Button>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push("/reports")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isArchiving}>
              {isSaving ? "Saving..." : mode === "create" ? "Create report" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
