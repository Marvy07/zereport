// TODO: Implement Stripe checkout session creation in Section 3
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: Create Stripe checkout session
  return NextResponse.json({ url: null }, { status: 501 });
}
