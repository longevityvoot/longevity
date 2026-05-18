"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setStatus(
  medId: string,
  clientId: string,
  status: "active" | "paused" | "discontinued",
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }
  await prisma.medication.update({
    where: { id: medId },
    data: {
      status,
      stoppedDate: status === "discontinued" ? new Date() : null,
    },
  });
  revalidatePath(`/coach/clients/${clientId}/meds`);
}
