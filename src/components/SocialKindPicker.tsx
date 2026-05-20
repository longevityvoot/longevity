// Single-choice social engagement picker — ordered low to high mortality
// benefit per Holt-Lunstad 2010 + Harvard 75-year study. Used in the
// weekly reflection form; rating mapping lives in lib/scoring.ts.
export function SocialKindPicker({
  defaultValue,
  name = "socialKind",
}: {
  defaultValue: string | null;
  name?: string;
}) {
  const options: Array<{ v: string; label: string; hint: string }> = [
    { v: "none",      label: "ไม่มี",        hint: "ไม่ได้คุยกับใคร" },
    { v: "text",      label: "ข้อความ",      hint: "chat / social media" },
    { v: "call",      label: "โทร/วิดีโอ",   hint: "ได้ยินเสียง" },
    { v: "in-person", label: "พบตัว",        hint: "1-2 คน" },
    { v: "group",     label: "กิจกรรมกลุ่ม", hint: "ครอบครัว / community" },
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {options.map((o) => (
        <label
          key={o.v}
          className="cursor-pointer rounded-md border border-border bg-canvas px-1.5 py-2 text-center has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
          title={o.hint}
        >
          <input
            type="radio"
            name={name}
            value={o.v}
            defaultChecked={defaultValue === o.v}
            className="sr-only"
          />
          <span className="block text-[11px] font-semibold leading-tight">{o.label}</span>
          <span className="block text-[9px] opacity-70 mt-0.5 leading-tight">{o.hint}</span>
        </label>
      ))}
    </div>
  );
}
