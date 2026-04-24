import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSessionMetadata } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_PLANS = ["FREE", "PRO", "AGENCY"] as const;
type Plan = (typeof VALID_PLANS)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metadata = await getSessionMetadata();
  if (metadata.platformRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const body = (await req.json()) as { plan?: unknown };
  const plan = body.plan;

  if (!plan || !VALID_PLANS.includes(plan as Plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await prisma.subscription.updateMany({
    where: { workspaceId },
    data: { plan: plan as Plan },
  });

  return NextResponse.json({ success: true });
}
