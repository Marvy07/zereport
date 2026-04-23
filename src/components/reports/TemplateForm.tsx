"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReportTemplateInput } from "@/lib/validations/report-template";

interface TemplateFormProps {
  mode: "create" | "edit";
  templateId?: string;
  initialValues?: Partial<ReportTemplateInput>;
}

const defaultValues: ReportTemplateInput = {
  name: "",
  description: undefined,
  isDefault: false,
  primaryColor: "#2563EB",
  secondaryColor: "#0F172A",
  fontFamily: "Inter",
  emailSubjectTemplate: undefined,
  emailBodyTemplate: undefined,
};

export function TemplateForm({ mode, templateId, initialValues }: TemplateFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ReportTemplateInput>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function updateField<K extends keyof ReportTemplateInput>(field: K, value: ReportTemplateInput[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(mode === "create" ? "/api/templates" : `/api/templates/${templateId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to save template.");
      }

      router.push("/templates");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save template.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!templateId) return;
    if (!window.confirm("Delete this template? This cannot be undone.")) return;

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to delete template.");
      }

      router.push("/templates");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete template.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create template" : "Edit template"}</CardTitle>
        <CardDescription>
          Define branding defaults and reusable email copy for recurring client reports.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Template name</Label>
              <Input id="name" value={values.name} onChange={(e) => updateField("name", e.target.value)} required minLength={2} maxLength={120} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={values.description ?? ""} onChange={(e) => updateField("description", e.target.value || undefined)} rows={3} maxLength={1000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary color</Label>
              <Input id="primaryColor" value={values.primaryColor ?? ""} onChange={(e) => updateField("primaryColor", e.target.value || undefined)} placeholder="#2563EB" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary color</Label>
              <Input id="secondaryColor" value={values.secondaryColor ?? ""} onChange={(e) => updateField("secondaryColor", e.target.value || undefined)} placeholder="#0F172A" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fontFamily">Font family</Label>
              <Input id="fontFamily" value={values.fontFamily ?? ""} onChange={(e) => updateField("fontFamily", e.target.value || undefined)} placeholder="Inter" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emailSubjectTemplate">Email subject template</Label>
              <Input id="emailSubjectTemplate" value={values.emailSubjectTemplate ?? ""} onChange={(e) => updateField("emailSubjectTemplate", e.target.value || undefined)} placeholder="Your monthly report for {{client_name}}" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emailBodyTemplate">Email body template</Label>
              <Textarea id="emailBodyTemplate" value={values.emailBodyTemplate ?? ""} onChange={(e) => updateField("emailBodyTemplate", e.target.value || undefined)} rows={8} placeholder="Hi {{client_name}},\n\nHere is your latest report..." />
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={values.isDefault ?? false} onChange={(e) => updateField("isDefault", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              Make this the default template for new reports in this workspace.
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting || isSaving}>
                {isDeleting ? "Deleting..." : "Delete template"}
              </Button>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push("/templates")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isDeleting}>
              {isSaving ? "Saving..." : mode === "create" ? "Create template" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
