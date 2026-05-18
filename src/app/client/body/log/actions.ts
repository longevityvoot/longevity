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

  await prisma.bodyMeasurement.create({
    data: {
      userId: session.user.id,
      type,
      value,
      unit: type === "weight" ? "kg" : "cm",
      measuredAt: new Date(),
      context,
    },
  });

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
  const flag = computeBpFlag(sys, dia);

  await prisma.vitalReading.create({
    data: {
      userId: session.user.id,
      type: "bp",
      measuredAt: new Date(),
      context,
      values: hr != null ? { sys, dia, hr } : { sys, dia },
      flag,
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
  const flag = computeGlucoseFlag(value, context);

  await prisma.vitalReading.create({
    data: {
      userId: session.user.id,
      type: "glucose",
      measuredAt: new Date(),
      context,
      values: { value, unit: "mg/dL" },
      flag,
    },
  });

  redirect("/client/body");
}
