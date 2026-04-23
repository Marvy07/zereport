"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ClientInput } from "@/lib/validations/client";

interface ClientFormProps {
  mode: "create" | "edit";
  clientId?: string;
  initialValues?: Partial<ClientInput>;
}

const defaultValues: ClientInput = {
  name: "",
  companyName: undefined,
  primaryEmail: "",
  website: undefined,
  notes: undefined,
};

export function ClientForm({ mode, clientId, initialValues }: ClientFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ClientInput>({
    ...defaultValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  function updateField<K extends keyof ClientInput>(field: K, value: ClientInput[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(mode === "create" ? "/api/clients" : `/api/clients/${clientId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to save client.");
      }

      router.push("/clients");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save client.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!clientId) return;

    const confirmed = window.confirm("Archive this client? You can still keep the record, but it will be marked archived.");
    if (!confirmed) return;

    setError(null);
    setIsArchiving(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to archive client.");
      }

      router.push("/clients");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive client.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add client" : "Edit client"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Capture the client details you need before creating projects and reports."
            : "Update client details or archive the record when the engagement ends."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Client name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                minLength={2}
                maxLength={100}
                required
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={values.companyName ?? ""}
                onChange={(event) => updateField("companyName", event.target.value || undefined)}
                maxLength={120}
                placeholder="Acme Co."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary email</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={values.primaryEmail}
                onChange={(event) => updateField("primaryEmail", event.target.value)}
                required
                placeholder="jane@acme.co"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={values.website ?? ""}
                onChange={(event) => updateField("website", event.target.value || undefined)}
                placeholder="https://acme.co"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={values.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value || undefined)}
                maxLength={5000}
                placeholder="Context, engagement notes, reporting preferences, and anything worth remembering."
                rows={8}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" ? (
              <Button type="button" variant="destructive" onClick={handleArchive} disabled={isArchiving || isSaving}>
                {isArchiving ? "Archiving..." : "Archive client"}
              </Button>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isArchiving}>
              {isSaving ? "Saving..." : mode === "create" ? "Create client" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
