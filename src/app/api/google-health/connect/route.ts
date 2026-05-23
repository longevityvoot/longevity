import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Google Health OAuth scopes — start with Fitness API (body + activity)
// which is still functional. Swap/extend once Google Health API scopes
// are published.
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
].join(" ");

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL));
  }

  const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_HEALTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google Health not configured" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: session.user.id,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
