import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `Google connection failed: ${error}.` }, { status: 400 });
  }

  if (!state) {
    return NextResponse.json({ error: "Missing OAuth state." }, { status: 400 });
  }

  const integration = await prisma.integration.findFirst({
    where: {
      type: "GOOGLE_SHEETS",
      configJson: {
        path: ["oauthState"],
        equals: state,
      },
    },
  });

  if (!integration) {
    return NextResponse.json({ error: "Google Sheets integration session not found." }, { status: 404 });
  }

  if (!code) {
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: "ERROR",
        lastError: "Missing OAuth code from Google callback.",
      },
    });

    return NextResponse.json({ error: "Missing OAuth code." }, { status: 400 });
  }

  const existingConfig =
    typeof integration.configJson === "object" && integration.configJson && !Array.isArray(integration.configJson)
      ? integration.configJson
      : {};

  const updatedIntegration = await prisma.integration.update({
    where: { id: integration.id },
    data: {
      // Scaffold note: we only confirm that Google returned to our callback with a code.
      // We do not exchange tokens in Section 10, so this must remain non-CONNECTED.
      status: "DISCONNECTED",
      lastError: "OAuth callback received, but token exchange is not implemented in this scaffold.",
      externalAccountId: null,
      configJson: {
        ...existingConfig,
        workspaceId: integration.workspaceId,
        oauthCompletedAt: new Date().toISOString(),
        oauthCodeReceived: true,
        connectionState: "CALLBACK_RECEIVED",
      },
      lastSyncedAt: null,
    },
  });

  return NextResponse.json({
    integration: updatedIntegration,
    message: "Google OAuth callback received. Integration remains disconnected until token exchange is implemented.",
  });
}
