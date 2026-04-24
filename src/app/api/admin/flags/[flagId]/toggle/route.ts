import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSessionMetadata } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ flagId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metadata = await getSessionMetadata();
  if (metadata.platformRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { flagId } = await params;

  const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } });
  if (!flag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.featureFlag.update({
    where: { id: flagId },
    data: { value: !flag.value },
  });

  return NextResponse.json({ success: true, value: updated.value });
}
