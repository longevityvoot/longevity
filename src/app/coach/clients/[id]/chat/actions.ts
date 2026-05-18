"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { threadIdForClient } from "@/lib/messages";

export async function sendMessage(clientId: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const content = (form.get("content") as string | null)?.trim();
  if (!content) return;

  await prisma.message.create({
    data: {
      threadId: threadIdForClient(clientId),
      userId: session.user.id,
      content,
    },
  });

  revalidatePath(`/coach/clients/${clientId}/chat`);
}
