"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateIntegrationInput, UpdateIntegrationInput } from "@/lib/validations/integration";

const integrationTypes = [
  { value: "GOOGLE_SHEETS", label: "Google Sheets" },
  { value: "NOTION", label: "Notion" },
  { value: "TRELLO", label: "Trello" },
  { value: "GOHIGHLEVEL", label: "GoHighLevel" },
  { value: "ZAPIER_WEBHOOK", label: "Zapier Webhook" },
  { value: "MANUAL", label: "Manual" },
] as const;

const integrationStatuses = [
  { value: "CONNECTED", label: "Connected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "ERROR", label: "Error" },
  { value: "DISCONNECTED", label: "Disconnected" },
] as const;

type IntegrationTypeValue = CreateIntegrationInput["type"];
type IntegrationStatusValue = NonNullable<UpdateIntegrationInput["status"]>;

interface IntegrationFormValues {
  type: IntegrationTypeValue;
  name: string;
  status?: IntegrationStatusValue;
  externalAccountId?: string;
  configJson?: Record<string, unknown>;
}

interface IntegrationFormProps {
  mode: "create" | "edit";
  integrationId?: string;
  initialValues?: Partial<IntegrationFormValues>;
}

const defaultValues: IntegrationFormValues = {
  type: "GOOGLE_SHEETS",
  name: "",
  status: "DISCONNECTED",
  externalAccountId: "",
  configJson: undefined,
};

function prettyJson(value?: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

function parseJsonConfig(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Config JSON must be a valid object.");
  }

  return parsed as Record<string, unknown>;
}

export function IntegrationForm({ mode, integrationId, initialValues }: IntegrationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<IntegrationFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [configText, setConfigText] = useState(prettyJson(initialValues?.configJson));
  const [error, setError] = useState<string | null>(null);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isGoogleSheets = useMemo(() => values.type === "GOOGLE_SHEETS", [values.type]);

  function updateField<K extends keyof IntegrationFormValues>(field: K, value: IntegrationFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setHelperMessage(null);
    setIsSaving(true);

    try {
      const payload: Record<string, unknown> = {
        type: values.type,
        name: values.name,
        externalAccountId: values.externalAccountId || undefined,
        configJson: parseJsonConfig(configText),
      };

      if (mode === "edit") {
        payload.status = values.status;
      }

      const response = await fetch(mode === "create" ? "/api/integrations" : `/api/integrations/${integrationId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to save integration.");
      }

      const result = (await response.json()) as { integration?: { id: string } };

      if (mode === "create" && values.type === "GOOGLE_SHEETS") {
        const connectResponse = await fetch(`/api/integrations/google-sheets/connect?name=${encodeURIComponent(values.name)}`);
        const connectPayload = (await connectResponse.json().catch(() => null)) as
          | { authorizationUrl?: string; error?: string }
          | null;

        if (connectResponse.ok && connectPayload?.authorizationUrl) {
          window.location.href = connectPayload.authorizationUrl;
          return;
        }

        if (!connectResponse.ok) {
          setHelperMessage(connectPayload?.error ?? "Google Sheets scaffold saved, but OAuth is not configured yet.");
        }
      }

      router.push(mode === "create" ? "/integrations" : `/integrations/${result.integration?.id ?? integrationId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save integration.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!integrationId) return;

    const confirmed = window.confirm(
      "Disconnect this integration? The record will be kept for workspace history, but credentials and sync state will be cleared."
    );
    if (!confirmed) return;

    setError(null);
    setHelperMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to disconnect integration.");
      }

      router.push("/integrations");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to disconnect integration.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add integration" : "Edit integration"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a workspace-scoped integration record and start the connection flow where available."
            : "Update naming, connection state, and scaffold config details for this integration."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Integration type</Label>
              <select
                id="type"
                value={values.type}
                onChange={(event) => updateField("type", event.target.value as IntegrationTypeValue)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={mode === "edit"}
              >
                {integrationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                minLength={2}
                maxLength={100}
                required
                placeholder="Weekly KPI tracker"
              />
            </div>
            {mode === "edit" ? (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={values.status}
                  onChange={(event) => updateField("status", event.target.value as IntegrationStatusValue)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {integrationStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="externalAccountId">External account ID</Label>
              <Input
                id="externalAccountId"
                value={values.externalAccountId ?? ""}
                onChange={(event) => updateField("externalAccountId", event.target.value)}
                placeholder="Optional connector account or tenant ID"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="configJson">Config JSON</Label>
              <Textarea
                id="configJson"
                value={configText}
                onChange={(event) => setConfigText(event.target.value)}
                rows={10}
                placeholder='{"sheetId":"abc123","tabName":"Summary"}'
              />
              <p className="text-xs text-slate-500">
                Use this for lightweight scaffold settings only. Full sync mappings come later.
              </p>
            </div>
          </div>
          {isGoogleSheets && mode === "create" ? (
            <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              After save, Google Sheets will try to start its OAuth scaffold. If env vars are missing, the record is still created and the API returns a clear setup error.
            </p>
          ) : null}
          {helperMessage ? <p className="text-sm text-amber-600">{helperMessage}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" ? (
              <Button type="button" variant="destructive" onClick={handleDisconnect} disabled={isDeleting || isSaving}>
                {isDeleting ? "Disconnecting..." : "Disconnect integration"}
              </Button>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push("/integrations")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isDeleting}>
              {isSaving ? "Saving..." : mode === "create" ? "Create integration" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
