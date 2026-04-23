// TODO: Implement Stripe webhook handler in Section 3
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: Verify Stripe webhook signature
  // TODO: Handle events: checkout.session.completed, customer.subscription.updated, etc.
  return NextResponse.json({ received: true });
}
