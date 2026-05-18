"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

export async function addMeal(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mealType = (form.get("mealType") as string) || "snack";
  const description = ((form.get("description") as string) || "").trim();
  const kcalRaw = form.get("kcal") as string | null;
  const kcal = kcalRaw ? Number(kcalRaw) : null;
  const foodKey = ((form.get("foodKey") as string) || "").trim() || null;
  const portionRaw = form.get("portion") as string | null;
  const portion = portionRaw ? Number(portionRaw) : 1;

  if (!description) return;

  await prisma.meal.create({
    data: {
      userId: session.user.id,
      date: todayLocalDate(),
      mealType,
      description,
      kcal: kcal && Number.isFinite(kcal) ? Math.round(kcal) : null,
      foodKey,
      portion: Number.isFinite(portion) ? portion : 1,
    },
  });

  redirect("/client/nutrition");
}

export async function deleteMeal(mealId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal || meal.userId !== session.user.id) return;
  await prisma.meal.delete({ where: { id: mealId } });
  revalidatePath("/client/nutrition");
}
