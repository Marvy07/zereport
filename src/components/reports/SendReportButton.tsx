"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface SendReportButtonProps {
  reportId: string;
  hasRecipients: boolean;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function SendReportButton({ reportId, hasRecipients, variant = "outline", className }: SendReportButtonProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSend() {
    if (!hasRecipients || isSending) return;

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/send`, {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to send report.");
      }

      setSuccess(payload?.message ?? "Report sent.");
      router.refresh();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send report.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant={variant} className={className} onClick={handleSend} disabled={!hasRecipients || isSending}>
        {isSending ? "Sending..." : "Send report"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      {!hasRecipients ? <p className="text-sm text-amber-600">Add a client email before sending this report.</p> : null}
    </div>
  );
}
