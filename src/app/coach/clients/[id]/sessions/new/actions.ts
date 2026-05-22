"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { threadIdForClient } from "@/lib/messages";

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

  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;

  await prisma.session.create({
    data: {
      clientId,
      coachId: session.user.id,
      type,
      scheduledAt,
      durationMin: durationRaw ? Number(durationRaw) : null,
      summary,
      actionItems,
      status,
    },
  });

  // Notify the client via their chat thread so the home page picks it up.
  // Only post when the session is upcoming with a scheduled time — past /
  // completed sessions don't need an FYI.
  if (status === "upcoming" && scheduledAt) {
    const when = scheduledAt.toLocaleString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    await prisma.message.create({
      data: {
        threadId: threadIdForClient(clientId),
        userId: session.user.id,
        content: `📅 Designer นัด session ใหม่: ${when}${durationRaw ? ` (~${durationRaw} นาที)` : ""}`,
      },
    });
  }

  redirect(`/coach/clients/${clientId}`);
}

