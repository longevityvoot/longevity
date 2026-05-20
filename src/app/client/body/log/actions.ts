"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeBpFlag, computeGlucoseFlag, type GlucoseContext } from "@/lib/vitals";

export async function logBodyMeasurement(type: "weight" | "waist", form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const value = Number(form.get("value"));
  if (!Number.isFinite(value)) return;
  const context = (form.get("context") as string | null) ?? null;
  const notes = ((form.get("notes") as string | null) ?? "").trim() || null;
  const measuredAt = new Date();

  await prisma.bodyMeasurement.create({
    data: {
      userId: session.user.id,
      type,
      value,
      unit: type === "weight" ? "kg" : "cm",
      measuredAt,
      context,
      notes,
    },
  });

  if (type === "weight") {
    const fatRaw = form.get("bodyFatPct");
    const fatPct = fatRaw && fatRaw !== "" ? Number(fatRaw) : null;
    if (fatPct != null && Number.isFinite(fatPct) && fatPct > 0 && fatPct < 100) {
      await prisma.bodyMeasurement.create({
        data: {
          userId: session.user.id,
          type: "bodyFat",
          value: fatPct,
          unit: "%",
          measuredAt,
          context,
        },
      });
    }

    // Muscle mass: user picks unit (kg or %); store as-entered.
    const muscleRaw = form.get("muscleMassValue");
    const muscleUnitRaw = form.get("muscleMassUnit");
    const muscleMass = muscleRaw && muscleRaw !== "" ? Number(muscleRaw) : null;
    const muscleUnit = muscleUnitRaw === "%" ? "%" : "kg";
    const validKg = muscleUnit === "kg" && muscleMass != null && muscleMass > 0 && muscleMass < value;
    const validPct = muscleUnit === "%" && muscleMass != null && muscleMass > 0 && muscleMass < 100;
    if (muscleMass != null && Number.isFinite(muscleMass) && (validKg || validPct)) {
      await prisma.bodyMeasurement.create({
        data: {
          userId: session.user.id,
          type: "muscleMass",
          value: muscleMass,
          unit: muscleUnit,
          measuredAt,
          context,
        },
      });
    }
  }

  redirect("/client/body");
}

export async function logBpReading(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sys = Number(form.get("sys"));
  const dia = Number(form.get("dia"));
  const hrRaw = form.get("hr");
  const hr = hrRaw && hrRaw !== "" ? Number(hrRaw) : undefined;
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) return;

  const context = (form.get("context") as string | null) ?? "morning";
  const notes = ((form.get("notes") as string | null) ?? "").trim() || null;
  const flag = computeBpFlag(sys, dia);

  await prisma.vitalReading.create({
    data: {
      userId: session.user.id,
      type: "bp",
      measuredAt: new Date(),
      context,
      values: hr != null ? { sys, dia, hr } : { sys, dia },
      flag,
      notes,
    },
  });

  redirect("/client/body");
}

export async function logGlucoseReading(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const value = Number(form.get("value"));
  if (!Number.isFinite(value)) return;
  const context = ((form.get("context") as string | null) ?? "random") as GlucoseContext;
  const notes = ((form.get("notes") as string | null) ?? "").trim() || null;
  const flag = computeGlucoseFlag(value, context);

  await prisma.vitalReading.create({
    data: {
      userId: session.user.id,
      type: "glucose",
      measuredAt: new Date(),
      context,
      values: { value, unit: "mg/dL" },
      flag,
      notes,
    },
  });

  redirect("/client/body");
}
