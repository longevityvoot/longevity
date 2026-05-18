import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const role = session?.user?.role;
  const dest = role === "COACH" || role === "ADMIN" ? "/coach" : role === "CLIENT" ? "/client" : "/login";

  return (
    <main className="min-h-screen px-5 py-10 max-w-[920px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-tight">Longevity Designer</h1>
      <p className="text-ink-3 mt-2">Phase 1 — DB + Auth พร้อมใช้</p>

      <Link
        href={dest}
        className="inline-flex mt-6 h-11 px-5 rounded-md bg-ink text-white font-semibold items-center text-[14px]"
      >
        {session ? "เข้าหน้า dashboard" : "เข้าสู่ระบบ"}
      </Link>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { name: "Nutrition", className: "bg-pillar-nutrition-wash text-pillar-nutrition" },
          { name: "Sleep", className: "bg-pillar-sleep-wash text-pillar-sleep" },
          { name: "Activity", className: "bg-pillar-activity-wash text-pillar-activity" },
          { name: "Stress", className: "bg-pillar-stress-wash text-pillar-stress" },
          { name: "Social", className: "bg-pillar-social-wash text-pillar-social" },
          { name: "Substances", className: "bg-pillar-substances-wash text-pillar-substances" },
        ].map((p) => (
          <div key={p.name} className={`rounded-lg px-3 py-2 text-[12px] font-semibold ${p.className}`}>
            {p.name}
          </div>
        ))}
      </section>
    </main>
  );
}
