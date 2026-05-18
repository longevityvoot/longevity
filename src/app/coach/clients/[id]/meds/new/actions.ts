"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function addMedication(clientId: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const type = (form.get("type") as string) || "supplement";
  const name = ((form.get("name") as string) || "").trim();
  const dose = ((form.get("dose") as string) || "").trim();
  const schedule = form.getAll("schedule").map((v) => String(v));
  const reason = ((form.get("reason") as string) || "").trim() || null;
  const source = (form.get("source") as string) || "self";
  const sourceName = ((form.get("sourceName") as string) || "").trim() || null;
  const startedDate = new Date(form.get("startedDate") as string);

  if (!name || !dose) return;

  await prisma.medication.create({
    data: {
      userId: clientId,
      type,
      name,
      dose,
      schedule,
      reason,
      source,
      sourceName,
      startedDate,
      status: "active",
    },
  });

  redirect(`/coach/clients/${clientId}/meds`);
}
