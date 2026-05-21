import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ageFromDOB, isSyntheticLineEmail } from "@/lib/clients";
import { setScaleBrand } from "./actions";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    include: { assignedCoach: { select: { name: true } } },
  });

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-7">
        <header>
          <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
            โปรไฟล์
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink mt-0.5">
            {session.user.name}
          </h1>
          {isSyntheticLineEmail(session.user.email) ? null : (
            <p className="text-[12px] text-ink-4 mt-0.5">{session.user.email}</p>
          )}
        </header>

        <section className="mt-6 bg-surface border border-border rounded-lg p-4">
          <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            ข้อมูลพื้นฐาน
          </h2>
          {profile ? (
            <dl className="mt-3 space-y-2 text-[13px]">
              <Row k="อายุ" v={`${ageFromDOB(profile.dateOfBirth)} ปี`} />
              <Row
                k="เพศ"
                v={profile.gender === "male" ? "ชาย" : profile.gender === "female" ? "หญิง" : profile.gender}
              />
              <Row k="ส่วนสูง" v={`${profile.heightCm} cm`} />
              <Row k="น้ำหนักเริ่มต้น" v={`${profile.weightKg} kg`} />
              <Row k="wearable" v={profile.wearableType ?? "ไม่มี"} />
              {profile.assignedCoach ? (
                <Row k="Longevity Designer" v={profile.assignedCoach.name} />
              ) : null}
            </dl>
          ) : (
            <p className="mt-2 text-[13px] text-ink-3">ยังไม่ได้ onboard</p>
          )}
        </section>

        {profile?.longevityGoal ? (
          <section className="mt-3 bg-surface border border-border rounded-lg p-4">
            <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
              เป้าหมาย
            </h2>
            <p className="mt-2 text-[13px] text-ink-2">{profile.longevityGoal}</p>
            {profile.interestTags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.interestTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-canvas text-ink-2 border border-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-3 bg-surface border border-border rounded-lg p-4">
          <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            Cadence การวัด
          </h2>
          {profile ? (
            <dl className="mt-3 space-y-2 text-[13px]">
              <Row k="น้ำหนัก" v={cadenceLabel(profile.weightCadence)} />
              <Row k="รอบเอว" v={cadenceLabel(profile.waistCadence)} />
              <Row k="ความดัน" v={cadenceLabel(profile.bpCadence)} />
              <Row k="น้ำตาล" v={cadenceLabel(profile.glucoseCadence)} />
            </dl>
          ) : null}
          <p className="text-[11px] text-ink-4 mt-3">
            แก้ cadence ได้ผ่าน designer ในเฟส 1 — Settings page มาเฟสถัดไป
          </p>
        </section>

        <section className="mt-3 bg-surface border border-border rounded-lg p-4">
          <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            เครื่องชั่ง body composition
          </h2>
          <p className="text-[11px] text-ink-3 mt-1 leading-snug">
            ระบบจะปรับเกณฑ์มวลกล้าม/ไขมัน ให้ match กับ algorithm ของเครื่อง
          </p>
          <form action={setScaleBrand} className="mt-3 flex items-center gap-2">
            <select
              name="scaleBrand"
              defaultValue={profile?.scaleBrand ?? ""}
              className="flex-1 h-10 rounded-md border border-border-strong px-3 text-[14px] bg-surface focus:outline-none focus:border-ink"
            >
              <option value="">— ไม่ระบุ —</option>
              <option value="inbody">InBody (H20N, H30 home)</option>
              <option value="omron">Omron HBF series</option>
              <option value="tanita">Tanita</option>
              <option value="xiaomi">Xiaomi Mi Body</option>
            </select>
            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-ink text-white text-[13px] font-semibold"
            >
              บันทึก
            </button>
          </form>
        </section>

        <section className="mt-3 bg-surface border border-border rounded-lg p-4 space-y-3">
          <Link
            href="/client/labs"
            className="flex items-center justify-between text-[14px] text-ink-2"
          >
            <span>ผลแล็บ</span>
            <span className="text-ink-4">→</span>
          </Link>
          <Link
            href="/client/meds"
            className="flex items-center justify-between text-[14px] text-ink-2"
          >
            <span>อาหารเสริม</span>
            <span className="text-ink-4">→</span>
          </Link>
          <Link
            href="/client/body"
            className="flex items-center justify-between text-[14px] text-ink-2"
          >
            <span>Body & vitals</span>
            <span className="text-ink-4">→</span>
          </Link>
        </section>

        {session.user.role === "COACH" || session.user.role === "ADMIN" ? (
          <Link
            href="/coach"
            className="mt-6 w-full h-11 inline-flex items-center justify-center rounded-md bg-ink text-white text-[14px] font-semibold"
          >
            ← มุม designer
          </Link>
        ) : null}

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-3"
        >
          <button className="w-full h-11 rounded-md border border-border-strong text-[14px] font-semibold text-ink-2">
            ออกจากระบบ
          </button>
        </form>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-4">{k}</dt>
      <dd className="text-ink-2 font-medium text-right">{v}</dd>
    </div>
  );
}

function cadenceLabel(v: string): string {
  const map: Record<string, string> = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    biweekly: "ทุก 2 สัปดาห์",
    monthly: "รายเดือน",
    "as-needed": "เมื่อต้องการ",
    "scheduled-daily": "ทุกวัน (นัด)",
  };
  return map[v] ?? v;
}
