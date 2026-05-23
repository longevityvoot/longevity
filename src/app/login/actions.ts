"use server";

import { signIn } from "@/auth";

export async function signInWithLine(from: string) {
  await signIn("line", { redirectTo: from || "/" });
}
