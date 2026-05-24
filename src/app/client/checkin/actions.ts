"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

function intOrNull(form: FormData, key: string): number | null {
  const raw = form.get(key);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function floatOrNull(form: FormData, key: string): number | null {
  const raw = form.get(key);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function trimmedOrNull(form: FormData, key: string): string | null {
  const raw = form.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v.length ? v : null;
}

export async function saveCheckIn(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const date = todayLocalDate();

  // Sleep feeling validation
  const feelRaw = trimmedOrNull(form, "sleepFeeling");
  const sleepFeeling =
    feelRaw && ["fresh", "neutral", "tired"].includes(feelRaw) ? feelRaw : null;

  const data = {
    energyLevel: intOrNull(form, "energyLevel"),
    stepsCount: intOrNull(form, "stepsCount"),
    moodLevel: intOrNull(form, "moodLevel"),
    stressLevel: intOrNull(form, "stressLevel"),
    sleepHours: floatOrNull(form, "sleepHours"),
    sleepWakeups: intOrNull(form, "sleepWakeups"),
    sleepFeeling,
    notes: trimmedOrNull(form, "notes"),
  };

  await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: data,
    create: { userId: session.user.id, date, ...data },
  });

  redirect("/client");
}
