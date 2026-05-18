import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/client");

  return <OnboardingWizard name={session.user.name ?? ""} />;
}
