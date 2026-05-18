"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitOnboarding(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dobRaw = form.get("dateOfBirth") as string;
  const gender = (form.get("gender") as string) || "other";
  const heightCm = Number(form.get("heightCm"));
  const weightKg = Number(form.get("weightKg"));
  const medicalHistory = ((form.get("medicalHistory") as string) || "").trim() || null;
  const allergies = ((form.get("allergies") as string) || "").trim() || null;
  const longevityGoal = ((form.get("longevityGoal") as string) || "").trim() || null;
  const interestTags = form.getAll("interestTags").map((v) => String(v));
  const wearableType = (form.get("wearableType") as string) || "none";

  if (!dobRaw || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return;

  // Find current designer (primary) so newly-onboarded client gets assigned
  const designer = await prisma.user.findFirst({
    where: { role: "COACH" },
    select: { id: true },
  });

  await prisma.clientProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      dateOfBirth: new Date(dobRaw),
      gender,
      heightCm,
      weightKg,
      medicalHistory,
      allergies,
      longevityGoal,
      interestTags,
      wearableType,
      assignedCoachId: designer?.id ?? null,
    },
    update: {
      dateOfBirth: new Date(dobRaw),
      gender,
      heightCm,
      weightKg,
      medicalHistory,
      allergies,
      longevityGoal,
      interestTags,
      wearableType,
    },
  });

  redirect("/client");
}
