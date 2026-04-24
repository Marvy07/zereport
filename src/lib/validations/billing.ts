import { z } from "zod";

export const billingSchema = z.object({
  plan: z.enum(["FREE", "PRO", "AGENCY"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export type BillingInput = z.infer<typeof billingSchema>;

export const checkoutSchema = z.object({
  plan: z.enum(["PRO", "AGENCY"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
