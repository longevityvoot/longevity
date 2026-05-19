import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Root just routes — landing copy lives nowhere because clients arrive
// from LineOA and go straight to /login.
export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = session.user.role;
  if (role === "COACH" || role === "ADMIN") redirect("/coach");
  redirect("/client");
}
