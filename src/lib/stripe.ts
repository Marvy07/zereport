import Stripe from "stripe";

// Lazy singleton — avoids crashes during `next build` when env vars aren't set.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
  return _stripe;
}

/** Convenience export — resolves at call time, not at import time. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PLANS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  AGENCY: process.env.STRIPE_AGENCY_PRICE_ID ?? "",
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

/**
 * Resolve a Stripe price ID back to a plan name.
 * Returns "FREE" if the price ID doesn't match any known plan.
 */
export function resolvePlanFromPriceId(priceId: string): "FREE" | "PRO" | "AGENCY" {
  if (priceId === STRIPE_PLANS.AGENCY) return "AGENCY";
  if (priceId === STRIPE_PLANS.PRO) return "PRO";
  return "FREE";
}
