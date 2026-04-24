import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export async function POST(_req: NextRequest) {
  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId: workspace.workspaceId },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found for this workspace. Subscribe to a plan first." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zereport.io";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
