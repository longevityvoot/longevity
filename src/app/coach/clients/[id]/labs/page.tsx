import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listPanelsForUser } from "@/lib/labs";

export default async function CoachLabsListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, clientProfile: { select: { id: true } } },
  });
  if (!client || !client.clientProfile) notFound();

  const panels = await listPanelsForUser(id);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[920px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${id}`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          Lab panels — {client.name}
        </h1>

        {panels.length === 0 ? (
          <p className="mt-6 text-[14px] text-ink-3">ยังไม่มี panel</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {panels.map((p) => {
              const flagged = p.results.filter((r) => r.flag !== "normal");
              return (
                <li key={p.id}>
                  <Link
                    href={`/coach/clients/${id}/labs/${p.id}`}
                    className="bg-surface border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink">
                        {p.date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {p.labName ? ` · ${p.labName}` : ""}
                      </p>
                      <p className="text-[11px] text-ink-4 mt-0.5">
                        {p.results.length} รายการ · {flagged.length} flag · {p.status}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-pill ${
                        p.status === "published"
                          ? "bg-pillar-social-wash text-pillar-social"
                          : "bg-pillar-stress-wash text-pillar-stress"
                      }`}
                    >
                      {p.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
