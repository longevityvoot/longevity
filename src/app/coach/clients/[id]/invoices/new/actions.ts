"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createInvoice(clientId: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const description = (form.get("description") as string).trim();
  const amount = Number(form.get("amount"));
  const currency = ((form.get("currency") as string) || "THB").trim();
  const issuedDate = new Date(form.get("issuedDate") as string);
  const dueDate = new Date(form.get("dueDate") as string);
  const notes = (form.get("notes") as string | null)?.trim() || null;

  await prisma.invoice.create({
    data: {
      clientId,
      description,
      amount,
      currency,
      issuedDate,
      dueDate,
      status: "pending",
      notes,
    },
  });

  redirect(`/coach/clients/${clientId}`);
}

export async function toggleInvoicePaid(invoiceId: string, clientId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  if (invoice.status === "paid") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "pending", paidDate: null },
    });
  } else {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "paid", paidDate: new Date() },
    });
  }

  revalidatePath(`/coach/clients/${clientId}`);
}
