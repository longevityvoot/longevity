import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MED_SLOTS } from "@/lib/medications";
import { addMedication } from "./actions";

export default async function NewMedicationPage({
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

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[560px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${clientId}/meds`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          เพิ่มยา / อาหารเสริม — {client.name}
        </h1>

        <form
          action={addMedication.bind(null, clientId)}
          className="mt-6 space-y-4 bg-surface border border-border rounded-lg p-5"
        >
          <fieldset>
            <legend className="text-[12px] text-ink-3 font-semibold">ประเภท</legend>
            <div className="mt-2 flex gap-3 flex-wrap">
              <Radio name="type" value="rx" label="ยาแพทย์สั่ง (rx)" defaultChecked />
              <Radio name="type" value="supplement" label="อาหารเสริม" />
              <Radio name="type" value="prn" label="เมื่อจำเป็น (prn)" />
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">ชื่อ</span>
              <input
                name="name"
                required
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
                placeholder="เช่น Vitamin D"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">ขนาด</span>
              <input
                name="dose"
                required
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
                placeholder="เช่น 2000 IU"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-[12px] text-ink-3 font-semibold">ตารางเวลา</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MED_SLOTS.map((s) => (
                <label
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-pill border border-border-strong text-[13px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
                >
                  <input type="checkbox" name="schedule" value={s} className="sr-only" />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">เหตุผล</span>
            <input
              name="reason"
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
              placeholder="เช่น ระดับ vitamin D ต่ำ"
            />
          </label>

          <fieldset>
            <legend className="text-[12px] text-ink-3 font-semibold">แนะนำโดย</legend>
            <div className="mt-2 flex gap-3 flex-wrap">
              <Radio name="source" value="doctor" label="แพทย์" defaultChecked />
              <Radio name="source" value="pharmacist" label="ร้านยา" />
              <Radio name="source" value="coach" label="designer" />
              <Radio name="source" value="self" label="ตัวเอง" />
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">วันที่เริ่ม</span>
              <input
                name="startedDate"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">ผู้สั่ง (ชื่อ)</span>
              <input
                name="sourceName"
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
                placeholder="optional"
              />
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <Link
              href={`/coach/clients/${clientId}/meds`}
              className="h-11 px-5 inline-flex items-center rounded-md border border-border-strong text-[14px] text-ink-2"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[14px]"
            >
              เพิ่ม
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 px-3 h-9 rounded-pill border border-border-strong text-[13px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {label}
    </label>
  );
}
