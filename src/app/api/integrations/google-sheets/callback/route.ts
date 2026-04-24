import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
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
      workspaceId: workspace.workspaceId,
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

  const updatedIntegration = await prisma.integration.update({
    where: { id: integration.id },
    data: {
      status: "CONNECTED",
      lastError: null,
      externalAccountId: `google-oauth:${state}`,
      configJson: {
        ...(typeof integration.configJson === "object" && integration.configJson ? integration.configJson : {}),
        oauthCompletedAt: new Date().toISOString(),
        oauthCodeReceived: true,
      },
      lastSyncedAt: null,
    },
  });

  return NextResponse.json({
    integration: updatedIntegration,
    message: "Google Sheets connection scaffold completed. Token exchange is not implemented yet.",
  });
}
