import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createInvoice } from "./actions";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, role: true },
  });
  if (!client || client.role !== "CLIENT") notFound();

  const today = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 7);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[560px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${clientId}`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          New invoice — {client.name}
        </h1>

        <form
          action={createInvoice.bind(null, clientId)}
          className="mt-6 space-y-4 bg-surface border border-border rounded-lg p-5"
        >
          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">รายการ</span>
            <input
              name="description"
              required
              defaultValue="ค่าบริการ designer รอบประจำเดือน"
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">ยอด (บาท)</span>
              <input
                name="amount"
                type="number"
                step="100"
                min="0"
                required
                defaultValue={3000}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">สกุล</span>
              <input
                name="currency"
                defaultValue="THB"
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">วันที่ออก</span>
              <input
                name="issuedDate"
                type="date"
                required
                defaultValue={today.toISOString().slice(0, 10)}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">ครบกำหนด</span>
              <input
                name="dueDate"
                type="date"
                required
                defaultValue={due.toISOString().slice(0, 10)}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">หมายเหตุ</span>
            <textarea
              name="notes"
              rows={3}
              className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
            />
          </label>

          <div className="pt-2 flex gap-3">
            <Link
              href={`/coach/clients/${clientId}`}
              className="h-11 px-5 inline-flex items-center rounded-md border border-border-strong text-[14px] text-ink-2"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[14px]"
            >
              สร้าง invoice
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
