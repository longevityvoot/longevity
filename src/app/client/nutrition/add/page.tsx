import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { addMeal } from "../actions";
import { FoodPicker } from "./FoodPicker";

type SearchParams = Promise<{ type?: string }>;

export default async function AddMealPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { type = guessMealType() } = await searchParams;

  return (
    <main className="min-h-screen bg-canvas pb-32">
      <header className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client/nutrition"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="ปิด"
          >
            ✕
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.1em] text-pillar-nutrition font-bold">
              Nutrition
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              เพิ่มมื้ออาหาร
            </p>
          </div>
        </div>
      </header>

      <form action={addMeal} className="max-w-[420px] mx-auto px-5 pt-4 space-y-4">
        <section className="bg-surface border border-border rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wider text-pillar-nutrition font-bold">
            มื้อไหน
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[
              { v: "breakfast", label: "เช้า" },
              { v: "lunch", label: "กลางวัน" },
              { v: "dinner", label: "เย็น" },
              { v: "snack", label: "ของว่าง" },
            ].map((o) => (
              <label
                key={o.v}
                className="inline-flex items-center justify-center h-10 rounded-md text-[12.5px] font-semibold border border-border-strong cursor-pointer has-[:checked]:bg-pillar-nutrition has-[:checked]:text-white has-[:checked]:border-pillar-nutrition"
              >
                <input
                  type="radio"
                  name="mealType"
                  value={o.v}
                  defaultChecked={o.v === type}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </section>

        <FoodPicker />

        <p className="text-[10px] text-ink-4 text-center">
          ตัวเลขเป็นค่าเฉลี่ย — ปรับให้ใกล้จริงได้ในช่อง kcal
        </p>
      </form>
    </main>
  );
}

// Guess based on current Bangkok hour
function guessMealType(): string {
  const now = new Date();
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const h = tz.getHours();
  if (h >= 5 && h < 10) return "breakfast";
  if (h >= 10 && h < 14) return "lunch";
  if (h >= 14 && h < 17) return "snack";
  if (h >= 17 && h < 22) return "dinner";
  return "snack";
}
