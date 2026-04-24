/**
 * Sentry helpers — safe to call even when DSN is not configured.
 * In production, set NEXT_PUBLIC_SENTRY_DSN and SENTRY_AUTH_TOKEN.
 */
import * as Sentry from "@sentry/nextjs";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}
