"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_BRANDS = ["omron", "inbody", "tanita", "xiaomi"] as const;

export async function setScaleBrand(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = (form.get("scaleBrand") as string | null) ?? "";
  const value =
    (ALLOWED_BRANDS as readonly string[]).includes(raw) ? raw : null;

  await prisma.clientProfile.update({
    where: { userId: session.user.id },
    data: { scaleBrand: value },
  });
  revalidatePath("/client/profile");
  revalidatePath("/client/body");
}
