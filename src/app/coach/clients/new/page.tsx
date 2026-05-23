import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createClient } from "./actions";

export default async function NewClientPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
    redirect("/client");
  }

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[560px] mx-auto px-6 py-6">
        <Link href="/coach" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ Longeneer console
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          เพิ่มลูกค้าใหม่
        </h1>
        <p className="text-[12px] text-ink-3 mt-1">
          สร้าง account ชั่วคราว — ลูกค้า login ครั้งแรกจะ onboard ต่อเอง
        </p>

        <form
          action={createClient}
          className="mt-6 space-y-4 bg-surface border border-border rounded-lg p-5"
        >
          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">ชื่อ-สกุล</span>
            <input
              name="name"
              required
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
              placeholder="คุณสมชาย"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">อีเมล</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
              placeholder="customer@example.com"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">รหัสผ่านชั่วคราว</span>
            <input
              name="password"
              type="text"
              required
              defaultValue={generateTemp()}
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-mono"
            />
            <span className="text-[11px] text-ink-4 mt-1 block">
              ส่งให้ลูกค้าผ่าน LINE — เปลี่ยนได้หลัง login (Phase 7+)
            </span>
          </label>

          <div className="pt-2 flex gap-3">
            <Link
              href="/coach"
              className="h-11 px-5 inline-flex items-center rounded-md border border-border-strong text-[14px] text-ink-2"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[14px]"
            >
              สร้าง account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function generateTemp(): string {
  // Stable per-render but unique enough for first hand-off.
  return "lv-" + Math.random().toString(36).slice(2, 8);
}
