"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

export async function toggleSlot(medicationId: string, slot: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const med = await prisma.medication.findUnique({ where: { id: medicationId } });
  if (!med || med.userId !== session.user.id) return;

  const date = todayLocalDate();
  const existing = await prisma.medicationLog.findUnique({
    where: { medicationId_date_slot: { medicationId, date, slot } },
  });

  if (existing) {
    await prisma.medicationLog.update({
      where: { id: existing.id },
      data: {
        taken: !existing.taken,
        takenAt: !existing.taken ? new Date() : null,
      },
    });
  } else {
    await prisma.medicationLog.create({
      data: {
        medicationId,
        date,
        slot,
        taken: true,
        takenAt: new Date(),
      },
    });
  }

  revalidatePath("/client/meds");
}
