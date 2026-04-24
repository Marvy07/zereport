import { randomUUID } from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceForRequest } from "@/lib/workspace";

const GOOGLE_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured: Boolean(clientId && clientSecret && redirectUri),
  };
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workspace = await resolveWorkspaceForRequest();

  if (!workspace.ok) {
    return NextResponse.json({ error: workspace.error, code: workspace.code }, { status: workspace.status });
  }

  const config = getGoogleConfig();
  const requestedName = req.nextUrl.searchParams.get("name")?.trim();
  const integrationName = requestedName && requestedName.length >= 2 ? requestedName : "Google Sheets";

  const state = randomUUID();

  const integration = await prisma.integration.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.workspaceId,
        name: integrationName,
      },
    },
    update: {
      type: "GOOGLE_SHEETS",
      status: config.isConfigured ? "DISCONNECTED" : "ERROR",
      lastError: config.isConfigured
        ? null
        : "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.",
      configJson: {
        oauthState: state,
        oauthRequestedAt: new Date().toISOString(),
        redirectUri: config.redirectUri ?? null,
      },
    },
    create: {
      workspaceId: workspace.workspaceId,
      type: "GOOGLE_SHEETS",
      name: integrationName,
      status: config.isConfigured ? "DISCONNECTED" : "ERROR",
      lastError: config.isConfigured
        ? null
        : "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.",
      configJson: {
        oauthState: state,
        oauthRequestedAt: new Date().toISOString(),
        redirectUri: config.redirectUri ?? null,
      },
    },
  });

  if (!config.isConfigured) {
    return NextResponse.json(
      {
        error: "Google OAuth is not configured.",
        missing: [
          !config.clientId ? "GOOGLE_CLIENT_ID" : null,
          !config.clientSecret ? "GOOGLE_CLIENT_SECRET" : null,
          !config.redirectUri ? "GOOGLE_REDIRECT_URI" : null,
        ].filter(Boolean),
        integration,
      },
      { status: 503 }
    );
  }

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", config.clientId!);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri!);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("prompt", "consent");
  authorizationUrl.searchParams.set("scope", GOOGLE_SCOPE);
  authorizationUrl.searchParams.set("state", state);

  return NextResponse.json({ integration, authorizationUrl: authorizationUrl.toString() });
}
