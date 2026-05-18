"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createClient(form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const name = ((form.get("name") as string) || "").trim();
  const email = ((form.get("email") as string) || "").trim().toLowerCase();
  const password = ((form.get("password") as string) || "").trim();

  if (!name || !email || !password) return;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: "CLIENT",
      passwordHash,
    },
  });

  redirect(`/coach/clients/${user.id}`);
}
