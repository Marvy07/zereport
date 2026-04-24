import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe, resolvePlanFromPriceId } from "@/lib/stripe";

// Next.js must not parse the body — Stripe needs the raw bytes for signature verification.
export const runtime = "nodejs";

interface SubscriptionPeriod {
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

async function upsertSubscription(
  workspaceId: string,
  plan: "FREE" | "PRO" | "AGENCY",
  stripeCustomerId: string,
  stripeSubscriptionId?: string | null,
  period: SubscriptionPeriod = {},
) {
  await prisma.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
      plan,
      status: "ACTIVE",
      currentPeriodStart: period.currentPeriodStart ?? undefined,
      currentPeriodEnd: period.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: period.cancelAtPeriodEnd ?? false,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
      plan,
      status: "ACTIVE",
      currentPeriodStart: period.currentPeriodStart ?? undefined,
      currentPeriodEnd: period.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: period.cancelAtPeriodEnd ?? false,
    },
  });
}

export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing stripe-signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        if (!workspaceId || !stripeCustomerId) {
          console.warn("checkout.session.completed: missing workspaceId or stripeCustomerId", {
            workspaceId,
            stripeCustomerId,
          });
          break;
        }

        // Determine plan from the line items price ID if available,
        // otherwise fall back to reading the subscription.
        let plan: "FREE" | "PRO" | "AGENCY" = "PRO";

        let period: SubscriptionPeriod = {};
        if (stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          const priceId = subscription.items.data[0]?.price?.id ?? "";
          plan = resolvePlanFromPriceId(priceId);
          const item = subscription.items.data[0];
          period = {
            currentPeriodStart: item?.current_period_start != null
              ? new Date(item.current_period_start * 1000)
              : null,
            currentPeriodEnd: item?.current_period_end != null
              ? new Date(item.current_period_end * 1000)
              : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          };
        }

        await upsertSubscription(workspaceId, plan, stripeCustomerId, stripeSubscriptionId, period);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const priceId = subscription.items.data[0]?.price?.id ?? "";
        const plan = resolvePlanFromPriceId(priceId);

        // Lookup workspace via stripeCustomerId
        const existing = await prisma.subscription.findUnique({
          where: { stripeCustomerId },
          select: { workspaceId: true },
        });

        if (existing) {
          await prisma.subscription.update({
            where: { stripeCustomerId },
            data: {
              plan,
              stripeSubscriptionId: subscription.id,
              status: "ACTIVE",
              currentPeriodStart: subscription.items.data[0]?.current_period_start != null
                ? new Date(subscription.items.data[0].current_period_start * 1000)
                : undefined,
              currentPeriodEnd: subscription.items.data[0]?.current_period_end != null
                ? new Date(subscription.items.data[0].current_period_end * 1000)
                : undefined,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
            status: "CANCELED",
          },
        });
        break;
      }

      default:
        // Unhandled event types are silently acknowledged
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Internal server error processing webhook." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
