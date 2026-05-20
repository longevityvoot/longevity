"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Designer override for the activity multiplier used in TDEE = BMR × factor.
// Null clears the override → fallback to default 1.4.
export async function setClientActivityFactor(clientId: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const raw = form.get("activityFactor") as string | null;
  let value: number | null = null;
  if (raw && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1.0 && n <= 2.5) {
      value = +n.toFixed(3);
    }
  }

  await prisma.clientProfile.update({
    where: { userId: clientId },
    data: { activityFactor: value },
  });
  revalidatePath(`/coach/clients/${clientId}`);
  revalidatePath("/client");
  revalidatePath("/client/nutrition");
}
