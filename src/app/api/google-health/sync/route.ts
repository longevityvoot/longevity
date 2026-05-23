import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidToken, fetchSteps, fetchSleep } from "@/lib/google-health";

// Manual sync endpoint — pulls last 7 days of steps + sleep from
// Google Fitness and upserts into HealthMetric.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const token = await getValidToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "not_connected", message: "Google Health ยังไม่ได้เชื่อมต่อ" },
      { status: 400 },
    );
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;

  // Fetch steps + sleep in parallel.
  const [steps, sleep] = await Promise.all([
    fetchSteps(token, sevenDaysAgo, now),
    fetchSleep(token, sevenDaysAgo, now),
  ]);

  let upserted = 0;

  // Upsert steps.
  for (const s of steps) {
    await prisma.healthMetric.upsert({
      where: {
        id: `gh-steps-${session.user.id}-${s.date.toISOString().slice(0, 10)}`,
      },
      update: { value: s.steps },
      create: {
        id: `gh-steps-${session.user.id}-${s.date.toISOString().slice(0, 10)}`,
        userId: session.user.id,
        date: s.date,
        source: "google-health",
        metricType: "steps",
        value: s.steps,
        unit: "steps",
      },
    });
    upserted++;
  }

  // Upsert sleep.
  for (const s of sleep) {
    const dateKey = s.date.toISOString().slice(0, 10);
    await prisma.healthMetric.upsert({
      where: {
        id: `gh-sleep-${session.user.id}-${dateKey}`,
      },
      update: { value: s.durationMin },
      create: {
        id: `gh-sleep-${session.user.id}-${dateKey}`,
        userId: session.user.id,
        date: s.date,
        source: "google-health",
        metricType: "sleep-duration",
        value: s.durationMin,
        unit: "min",
      },
    });
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    synced: { steps: steps.length, sleep: sleep.length },
    upserted,
  });
}
