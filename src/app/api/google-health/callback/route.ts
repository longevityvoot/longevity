import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // = userId
  const error = req.nextUrl.searchParams.get("error");

  const baseUrl = process.env.AUTH_URL ?? "https://longeneer.com";

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/client/profile?ghError=${error ?? "missing_code"}`,
    );
  }

  // Exchange authorization code for access + refresh tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_HEALTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_HEALTH_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_HEALTH_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    console.error("[google-health] token exchange failed:", detail);
    return NextResponse.redirect(
      `${baseUrl}/client/profile?ghError=token_exchange`,
    );
  }

  const tokens = await tokenRes.json();
  // tokens: { access_token, refresh_token, expires_in, token_type, scope }

  await prisma.clientProfile.update({
    where: { userId: state },
    data: {
      googleHealthConnected: true,
      googleHealthTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        scope: tokens.scope,
      },
    },
  });

  return NextResponse.redirect(`${baseUrl}/client/profile?ghConnected=1`);
}
