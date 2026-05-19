"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate, mondayOf } from "@/lib/dates";

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

export async function saveWeeklyReflection(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const weekStart = mondayOf(todayLocalDate());
  const socialKindRaw = trimmedOrNull(form, "socialKind");
  const allowedSocial = ["none", "text", "call", "in-person", "group"];
  const socialKind =
    socialKindRaw && allowedSocial.includes(socialKindRaw) ? socialKindRaw : null;

  const smokeDaysRaw = intOrNull(form, "smokeDays");
  const smokeDays =
    smokeDaysRaw != null && smokeDaysRaw >= 0 && smokeDaysRaw <= 7
      ? smokeDaysRaw
      : null;

  const data = {
    alcoholUnits: floatOrNull(form, "alcoholUnits"),
    sugaryDrinkCount: intOrNull(form, "sugaryDrinkCount"),
    smokeDays,
    socialKind,
    notes: trimmedOrNull(form, "notes"),
  };

  await prisma.weeklyReflection.upsert({
    where: {
      userId_weekStart: { userId: session.user.id, weekStart },
    },
    update: data,
    create: { userId: session.user.id, weekStart, ...data },
  });

  redirect("/client");
}
