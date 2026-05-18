export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-10 max-w-[920px] mx-auto">
      <h1 className="text-[24px] font-semibold tracking-tight">Longevity Designer</h1>
      <p className="text-ink-3 mt-2">Phase 0 scaffold พร้อมใช้ — รัน <code>npm run dev</code></p>

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
