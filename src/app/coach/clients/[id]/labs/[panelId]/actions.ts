"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireCoach() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }
  return session;
}

export async function publishPanel(panelId: string, clientId: string) {
  await requireCoach();
  await prisma.labPanel.update({
    where: { id: panelId },
    data: { status: "published" },
  });
  revalidatePath(`/coach/clients/${clientId}/labs/${panelId}`);
  revalidatePath(`/coach/clients/${clientId}/labs`);
}

export async function toggleWatch(resultId: string, clientId: string) {
  await requireCoach();
  const result = await prisma.labResult.findUnique({ where: { id: resultId } });
  if (!result) return;
  await prisma.labResult.update({
    where: { id: resultId },
    data: { watch: !result.watch },
  });
  revalidatePath(`/coach/clients/${clientId}/labs/${result.panelId}`);
}

export async function saveSummary(
  panelId: string,
  clientId: string,
  form: FormData,
) {
  await requireCoach();
  const summary = (form.get("summary") as string | null)?.trim() || null;
  await prisma.labPanel.update({
    where: { id: panelId },
    data: { summary },
  });
  revalidatePath(`/coach/clients/${clientId}/labs/${panelId}`);
}
