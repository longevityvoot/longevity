import { prisma } from "@/lib/prisma";

type GoogleTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
};

// Refresh the access token if expired. Returns the current valid token.
export async function getValidToken(userId: string): Promise<string | null> {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { googleHealthTokens: true },
  });
  if (!profile?.googleHealthTokens) return null;

  const tokens = profile.googleHealthTokens as unknown as GoogleTokens;

  // Still valid (with 60s buffer)
  if (tokens.expiresAt > Date.now() + 60_000) {
    return tokens.accessToken;
  }

  // Refresh
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_HEALTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_HEALTH_CLIENT_SECRET!,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("[google-health] refresh failed:", await res.text());
    await prisma.clientProfile.update({
      where: { userId },
      data: { googleHealthConnected: false },
    });
    return null;
  }

  const data = await res.json();
  const updated: GoogleTokens = {
    ...tokens,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  await prisma.clientProfile.update({
    where: { userId },
    data: { googleHealthTokens: updated as never },
  });

  return updated.accessToken;
}

// Fetch steps for a date range using Google Fitness aggregate API.
export async function fetchSteps(
  token: string,
  startMs: number,
  endMs: number,
): Promise<Array<{ date: Date; steps: number }>> {
  const res = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: "com.google.step_count.delta" },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startMs,
        endTimeMillis: endMs,
      }),
    },
  );

  if (!res.ok) {
    console.error("[google-health] steps fetch failed:", await res.text());
    return [];
  }

  const data = await res.json();
  const results: Array<{ date: Date; steps: number }> = [];

  for (const bucket of data.bucket ?? []) {
    const startDate = new Date(Number(bucket.startTimeMillis));
    let steps = 0;
    for (const ds of bucket.dataset ?? []) {
      for (const pt of ds.point ?? []) {
        for (const val of pt.value ?? []) {
          steps += val.intVal ?? 0;
        }
      }
    }
    if (steps > 0) {
      results.push({ date: startDate, steps });
    }
  }

  return results;
}

// Fetch sleep sessions from Google Fitness.
// Activity type 72 = sleep.
export async function fetchSleep(
  token: string,
  startMs: number,
  endMs: number,
): Promise<Array<{ date: Date; durationMin: number }>> {
  const params = new URLSearchParams({
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(endMs).toISOString(),
    activityType: "72",
  });

  const res = await fetch(
    `https://www.googleapis.com/fitness/v1/users/me/sessions?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    console.error("[google-health] sleep fetch failed:", await res.text());
    return [];
  }

  const data = await res.json();
  const results: Array<{ date: Date; durationMin: number }> = [];

  for (const s of data.session ?? []) {
    const start = Number(s.startTimeMillis);
    const end = Number(s.endTimeMillis);
    const durationMin = Math.round((end - start) / 60000);
    if (durationMin > 0) {
      results.push({
        date: new Date(start),
        durationMin,
      });
    }
  }

  return results;
}
