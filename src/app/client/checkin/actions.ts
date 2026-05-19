"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

function intOrNull(form: FormData, key: string): number | null {
  const raw = form.get(key);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
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
  const data = {
    energyLevel: intOrNull(form, "energyLevel"),
    moodLevel: intOrNull(form, "moodLevel"),
    sleepQuality: intOrNull(form, "sleepQuality"),
    stressLevel: intOrNull(form, "stressLevel"),
    notes: trimmedOrNull(form, "notes"),
  };

  await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: data,
    create: { userId: session.user.id, date, ...data },
  });

  redirect("/client");
}
