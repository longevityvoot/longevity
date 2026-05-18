import { auth, signOut } from "@/auth";

export default async function CoachHome() {
  const session = await auth();
  return (
    <main className="min-h-screen px-5 py-10 max-w-[920px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-tight">Designer console</h1>
      <p className="text-ink-3 mt-2">
        สวัสดี {session?.user?.name ?? "designer"} — Phase 1 placeholder
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <button className="h-10 px-4 rounded-md border border-border-strong text-[14px] font-semibold">
          ออกจากระบบ
        </button>
      </form>
    </main>
  );
}
