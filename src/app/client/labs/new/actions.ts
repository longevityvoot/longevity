"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LAB_RANGES, LAB_TEMPLATES, computeLabFlag } from "@/lib/lab-ranges";

export async function submitDraftPanel(templateKey: string, form: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tmpl = LAB_TEMPLATES.find((t) => t.key === templateKey);
  if (!tmpl) return;

  const dateRaw = form.get("date") as string;
  const labName = (form.get("labName") as string | null)?.trim() || null;
  const note = (form.get("note") as string | null)?.trim() || null;

  const results: Array<{
    name: string;
    value: number;
    unit: string;
    refLow: number;
    refHigh: number;
    flag: string;
    category: string;
  }> = [];

  for (const key of tmpl.tests) {
    const spec = LAB_RANGES[key];
    if (!spec) continue;
    const raw = form.get(`value:${key}`);
    if (typeof raw !== "string" || raw.trim() === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    const flag = computeLabFlag(spec, value);
    results.push({
      name: spec.name,
      value,
      unit: spec.unit,
      refLow: spec.low,
      refHigh: spec.high,
      flag,
      category: spec.category,
    });
  }

  if (results.length === 0) return;

  await prisma.labPanel.create({
    data: {
      userId: session.user.id,
      date: new Date(dateRaw),
      labName,
      note,
      status: "draft",
      results: {
        create: results.map((r) => ({
          name: r.name,
          value: r.value,
          unit: r.unit,
          refLow: r.refLow,
          refHigh: r.refHigh,
          flag: r.flag,
          category: r.category,
        })),
      },
    },
  });

  redirect("/client/labs");
}
