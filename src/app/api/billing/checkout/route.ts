import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { resolveWorkspaceForRequest } from "@/lib/workspace";
import { checkoutSchema } from "@/lib/validations/billing";

export async function POST(req: NextRequest) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let plan: "PRO" | "AGENCY";
  try {
    const parsed = checkoutSchema.parse(body);
    plan = parsed.plan;
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const priceId = STRIPE_PLANS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID for plan "${plan}" is not configured.` },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zereport.io";
  const billingUrl = `${appUrl}/billing`;

  // Fetch user email for pre-filling the Stripe checkout form.
  const user = await getCurrentUser();
  const customerEmail =
    user?.emailAddresses?.[0]?.emailAddress ?? undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { workspaceId: workspace.workspaceId },
    success_url: `${billingUrl}?checkout=success`,
    cancel_url: `${billingUrl}?checkout=canceled`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
  });

  return NextResponse.json({ url: session.url });
}
