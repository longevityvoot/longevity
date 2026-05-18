import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/BottomNav";

// Client-area gate: a logged-in CLIENT without a ClientProfile gets bounced
// to /onboarding. The /coach/* tree and unauthenticated visitors are handled
// by middleware; this layout only sees CLIENT sessions.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/onboarding");

  return (
    <>
      <div className="pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
