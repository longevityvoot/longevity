"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createSession(clientId: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const type = (form.get("type") as string) || "scheduled";
  const scheduledRaw = form.get("scheduledAt") as string | null;
  const durationRaw = form.get("durationMin") as string | null;
  const summary = (form.get("summary") as string | null)?.trim() || null;
  const actionItemsRaw = (form.get("actionItems") as string | null) ?? "";
  const status = (form.get("status") as string) || "upcoming";

  const actionItems = actionItemsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text, completed: false }));

  await prisma.session.create({
    data: {
      clientId,
      coachId: session.user.id,
      type,
      scheduledAt: scheduledRaw ? new Date(scheduledRaw) : null,
      durationMin: durationRaw ? Number(durationRaw) : null,
      summary,
      actionItems,
      status,
    },
  });

  redirect(`/coach/clients/${clientId}`);
}
