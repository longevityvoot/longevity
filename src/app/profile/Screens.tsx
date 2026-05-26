"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { QUESTIONS, type QuestionFlat } from "./questions";

/* ─── shared chrome ─── */

export function TopBar({ pos, total, onBack, sectionLabel, onSkipDemo }: {
  pos: number; total: number; onBack: () => void; sectionLabel: string; onSkipDemo: () => void;
}) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--bg)", padding: "14px 22px 12px", borderBottom: "1px solid var(--rule)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button onClick={onBack} aria-label="ย้อนกลับ" style={{ background: "transparent", border: "none", padding: "6px 0", color: "var(--ink)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
          <span className="mono" style={{ fontSize: 12, letterSpacing: "0.05em" }}>BACK</span>
        </button>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.08em" }}>
          {sectionLabel} · {String(pos).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <button onClick={onSkipDemo} title="กระโดดไปดูตัวอย่างผลลัพธ์" style={{ background: "transparent", border: "1px solid var(--rule-strong)", borderRadius: 999, padding: "4px 10px", color: "var(--ink-soft)", fontSize: 11, letterSpacing: "0.04em", fontFamily: "IBM Plex Mono, monospace" }}>
          DEMO →
        </button>
      </div>
      <div style={{ position: "relative", height: 2, background: "var(--rule)", marginTop: 12, borderRadius: 1 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(pos / total) * 100}%`, background: "var(--accent)", transition: "width 320ms cubic-bezier(.2,.7,.2,1)" }} />
      </div>
    </div>
  );
}

export function Frame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <div style={{ flex: 1, padding: "20px 22px 32px", maxWidth: "var(--max)", width: "100%", margin: "0 auto" }}>
        {children}
      </div>
      {footer ? (
        <div style={{ position: "sticky", bottom: 0, background: "linear-gradient(to bottom, transparent, var(--bg) 32%)", padding: "20px 22px 24px" }}>
          <div style={{ maxWidth: "var(--max)", margin: "0 auto" }}>{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

function QuestionHeader({ tag, label, hint }: { tag: string; label: string; hint?: string }) {
  return (
    <div style={{ marginTop: 14, marginBottom: 22 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-faint)", marginBottom: 12, textTransform: "uppercase" }}>{tag}</div>
      <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.2, fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif", fontWeight: 500, letterSpacing: "-0.005em" }}>{label}</h1>
      {hint ? <div style={{ marginTop: 8, color: "var(--ink-soft)", fontSize: 14 }}>{hint}</div> : null}
    </div>
  );
}

export function PrimaryBtn({ disabled, children, onClick, secondary }: {
  disabled?: boolean; children: ReactNode; onClick: () => void; secondary?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "14px 18px", borderRadius: 14,
      border: secondary ? "1px solid var(--rule-strong)" : "1px solid var(--ink)",
      background: secondary ? "transparent" : disabled ? "var(--ink-faint)" : "var(--ink)",
      color: secondary ? "var(--ink)" : "var(--bg)",
      fontSize: 15, fontWeight: 500, letterSpacing: "0.01em",
      opacity: disabled ? 0.7 : 1, cursor: disabled ? "not-allowed" : "pointer",
      transition: "transform 120ms ease, background 200ms ease",
    }}>
      {children}
    </button>
  );
}

/* ─── question screens ─── */

export function TextScreen({ q, value, onChange, onContinue }: {
  q: QuestionFlat; value: string | number | undefined; onChange: (v: string | number) => void; onContinue: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [q.id]);
  return (
    <>
      <QuestionHeader tag={q.id} label={q.label!} hint={q.hint} />
      <input ref={ref}
        type={q.kind === "number" ? "number" : "text"}
        value={value ?? ""}
        min={q.min} max={q.max}
        placeholder={q.placeholder ?? ""}
        inputMode={q.kind === "number" ? "numeric" : "text"}
        onChange={(e) => onChange(q.kind === "number" ? (e.target.value === "" ? "" as unknown as number : Number(e.target.value)) : e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onContinue(); }}
        style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid var(--ink)", padding: "12px 0", fontSize: 26, fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif", fontWeight: 400, outline: "none" }}
      />
      {q.suffix ? <div className="mono" style={{ marginTop: 8, color: "var(--ink-faint)", fontSize: 12 }}>หน่วย: {q.suffix}</div> : null}
    </>
  );
}

export function DualNumberScreen({ q, value, onChange, onContinue }: {
  q: QuestionFlat; value: Record<string, number> | undefined; onChange: (v: Record<string, number>) => void; onContinue: () => void;
}) {
  const v = value ?? {};
  const set = (k: string, x: string) => onChange({ ...v, [k]: x === "" ? (undefined as unknown as number) : Number(x) });
  return (
    <>
      <QuestionHeader tag={q.id} label={q.label!} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 8 }}>
        {q.fields!.map((f, i) => (
          <div key={f.key}>
            <input type="number" autoFocus={i === 0} value={v[f.key] ?? ""} min={f.min} max={f.max} placeholder={f.placeholder} inputMode="numeric"
              onChange={(e) => set(f.key, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onContinue(); }}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid var(--ink)", padding: "12px 0", fontSize: 26, fontFamily: "inherit", outline: "none" }}
            />
            <div className="mono" style={{ marginTop: 6, color: "var(--ink-faint)", fontSize: 12, letterSpacing: "0.05em" }}>
              {f.key === "height" ? "ส่วนสูง · " : "น้ำหนัก · "}{f.suffix}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function LongTextScreen({ q, value, onChange, onContinue }: {
  q: QuestionFlat; value: string | undefined; onChange: (v: string) => void; onContinue: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, [q.id]);
  return (
    <>
      <QuestionHeader tag={q.id} label={q.label!} hint={q.hint} />
      <textarea ref={ref} rows={5} value={value ?? ""} placeholder={q.placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onContinue(); }}
        style={{ width: "100%", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 12, padding: "14px 16px", fontSize: 17, lineHeight: 1.55, fontFamily: "inherit", outline: "none" }}
      />
      <div className="mono" style={{ marginTop: 8, color: "var(--ink-faint)", fontSize: 11, letterSpacing: "0.05em" }}>
        ⌘ + ENTER เพื่อไปต่อ
      </div>
    </>
  );
}

export function SingleSelectScreen({ q, value, onChange, onContinue }: {
  q: QuestionFlat; value: string | undefined; onChange: (v: string) => void; onContinue: () => void;
}) {
  return (
    <>
      <QuestionHeader tag={q.id} label={q.label!} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options!.map((opt) => {
          const selected = value === opt.value;
          return (
            <button key={opt.value} onClick={() => { onChange(opt.value); setTimeout(onContinue, 240); }}
              style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${selected ? "var(--accent)" : "var(--rule)"}`, background: selected ? "var(--accent-soft)" : "var(--paper)", transition: "all 160ms ease", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.05em", width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${selected ? "var(--accent)" : "var(--rule-strong)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", background: selected ? "var(--accent)" : "transparent", color: selected ? "var(--paper)" : "var(--ink-soft)", flexShrink: 0, marginTop: 2 }}>
                {selected ? "✓" : ""}
              </span>
              <span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{opt.title}</span>
                <span style={{ display: "block", color: "var(--ink-soft)", fontSize: 13, marginTop: 2 }}>{opt.desc}</span>
                <span className="mono" style={{ display: "block", color: "var(--ink-faint)", fontSize: 10, letterSpacing: "0.05em", marginTop: 4 }}>
                  ตัวคูณ {opt.mult}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function MultiSelectScreen({ q, value, onChange }: {
  q: QuestionFlat; value: { values: string[]; other: string } | undefined; onChange: (v: { values: string[]; other: string }) => void;
}) {
  const arr = value?.values ?? [];
  const otherText = value?.other ?? "";
  const toggle = (label: string) => {
    let next = arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label];
    if (q.exclusive) {
      if (label === q.exclusive && next.includes(q.exclusive)) next = [q.exclusive];
      else if (label !== q.exclusive) next = next.filter((x) => x !== q.exclusive);
    }
    onChange({ values: next, other: otherText });
  };
  return (
    <>
      <QuestionHeader tag={q.id} label={q.label!} hint={q.hint} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {q.multiOptions!.map((opt) => {
          const on = arr.includes(opt);
          return (
            <button key={opt} onClick={() => toggle(opt)}
              style={{ padding: "10px 14px", borderRadius: 999, border: `1.5px solid ${on ? "var(--accent)" : "var(--rule-strong)"}`, background: on ? "var(--accent-soft)" : "transparent", color: "var(--ink)", fontSize: 14, transition: "all 160ms ease" }}>
              {on ? "✓ " : ""}{opt}
            </button>
          );
        })}
      </div>
      {arr.includes(q.otherOption!) ? (
        <input autoFocus value={otherText} onChange={(e) => onChange({ values: arr, other: e.target.value })} placeholder="ระบุ..."
          style={{ marginTop: 14, width: "100%", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 10, padding: "10px 14px", fontSize: 15, outline: "none" }} />
      ) : null}
    </>
  );
}

export function LikertScreen({ q, value, onChange, onContinue }: {
  q: QuestionFlat; value: number | undefined; onChange: (v: number) => void; onContinue: () => void;
}) {
  const labels = QUESTIONS.likertLabels;
  const dimColors: Record<string, string> = { D1: "var(--accent)", D2: "var(--secondary)", D3: "var(--accent)", D4: "var(--secondary)", D5: "var(--accent)", D6: "var(--secondary)" };
  const dimSoft: Record<string, string> = { D1: "var(--accent-soft)", D2: "var(--secondary-soft)", D3: "var(--accent-soft)", D4: "var(--secondary-soft)", D5: "var(--accent-soft)", D6: "var(--secondary-soft)" };
  const color = dimColors[q.dim!];
  const soft = dimSoft[q.dim!];
  const dimName = QUESTIONS.dimensions[q.dim! as keyof typeof QUESTIONS.dimensions]?.name ?? "";
  return (
    <>
      <div style={{ marginTop: 14, marginBottom: 26 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 6px", borderRadius: 999, background: soft, color: "var(--ink)" }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: color, color: "var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 10 }}>{q.id}</span>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {dimName}{q.reverse ? " · reverse" : ""}
          </span>
        </div>
        <h1 className="serif" style={{ margin: "20px 0 0", fontSize: 30, lineHeight: 1.3, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.005em" }}>
          &ldquo;{q.text}&rdquo;
        </h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 22 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = value === n;
          const size = 38 + (n - 1) * 5;
          return (
            <button key={n} onClick={() => { onChange(n); setTimeout(onContinue, 240); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: 6, cursor: "pointer" }}>
              <span style={{ width: size, height: size, borderRadius: "50%", border: `1.5px solid ${sel ? color : "var(--rule-strong)"}`, background: sel ? color : "transparent", color: sel ? "var(--bg)" : "var(--ink-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 500, transition: "all 180ms ease", transform: sel ? "scale(1.06)" : "scale(1)" }}>{n}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12, color: "var(--ink-faint)" }}>
        <span>{labels[1]}</span>
        <span>{labels[5]}</span>
      </div>
      {value ? (
        <div style={{ marginTop: 22, textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: soft, color: "var(--ink)", fontSize: 14, fontWeight: 500 }}>
            {labels[value as keyof typeof labels]}
          </span>
        </div>
      ) : null}
    </>
  );
}

/* ─── welcome ─── */

export function Welcome({ onStart, onSkipDemo }: { onStart: () => void; onSkipDemo: () => void }) {
  return (
    <Frame>
      <div style={{ margin: "-20px -22px 0", padding: "44px 28px 40px", background: "var(--block)", color: "var(--block-ink)", borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -70, top: -70, width: 240, height: 240, borderRadius: "50%", background: "var(--block2)", opacity: 0.9 }} />
        <div style={{ position: "absolute", right: 70, top: 110, width: 64, height: 64, borderRadius: "50%", background: "var(--block-ink)", opacity: 0.14 }} />
        <div style={{ position: "absolute", left: -40, bottom: -40, width: 120, height: 120, borderRadius: "50%", border: "1.5px solid currentColor", opacity: 0.18 }} />
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.7, position: "relative", zIndex: 1 }}>
          CHAIVOOT · PRE-ONBOARDING
        </div>
        <h1 className="serif" style={{ margin: "28px 0 0", fontSize: 64, lineHeight: 0.94, fontStyle: "italic", fontWeight: 400, position: "relative", zIndex: 1, letterSpacing: "-0.02em" }}>
          Longeneer<br /><span style={{ color: "var(--block2)" }}>Profile.</span>
        </h1>
        <div className="mono" style={{ marginTop: 28, fontSize: 11, opacity: 0.78, letterSpacing: "0.1em", position: "relative", zIndex: 1, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>24 ข้อ</span><span style={{ opacity: 0.5 }}>·</span>
          <span>~10 นาที</span><span style={{ opacity: 0.5 }}>·</span>
          <span>ไม่ต้องล็อกอิน</span>
        </div>
      </div>

      <div style={{ paddingTop: 28 }}>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink)" }}>
          24 คำถาม สำหรับทบทวนตัวเองก่อน Onboarding Session 30 นาที — เพื่อให้เราออกแบบระบบ longevity ที่เหมาะกับ <em className="serif" style={{ color: "var(--accent)", fontSize: 20, fontStyle: "italic" }}>นิสัยตัวจริง</em> ของคุณ ไม่ใช่ template สำเร็จรูป
        </p>

        <div style={{ marginTop: 26 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 14 }}>
            สิ่งที่จะเกิดขึ้น
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {([
              ["A", "Context", "6 ข้อ", "อายุ, เป้าหมาย, สุขภาพปัจจุบัน", "var(--accent)"],
              ["B", "Profile", "18 ข้อ", "วินัย · social · ข้อมูล · จังหวะชีวิต", "var(--secondary)"],
              ["C", "Reflection", "3 ข้อ", "เล่าเพิ่ม ก่อนเราคุยกัน", "var(--accent)"],
            ] as const).map(([k, t, c, d, clr]) => (
              <div key={k} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid var(--rule)" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: clr, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 22, flexShrink: 0 }}>{k}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{t}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c}</span>
                  </div>
                  <div style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryBtn onClick={onStart}>เริ่มทำ →</PrimaryBtn>
          <PrimaryBtn secondary onClick={onSkipDemo}>ข้ามไปดูตัวอย่างผลลัพธ์</PrimaryBtn>
        </div>

        <p style={{ marginTop: 28, fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.55 }}>
          Longeneer Profile เป็นเครื่องมือ self-reflection — ไม่ใช่แบบทดสอบทางการแพทย์หรือจิตวิทยา ผลที่ได้เป็นส่วนตัว ไม่ได้จัดเก็บตามนโยบายความเป็นส่วนตัว
        </p>
      </div>
    </Frame>
  );
}

/* ─── section intro ─── */

export function SectionIntro({ letter, title, desc, count, onStart, onBack }: {
  letter: string; title: string; desc: string; count: number; onStart: () => void; onBack: () => void;
}) {
  const bg = letter === "B" ? "var(--block2)" : "var(--block)";
  const ink = letter === "B" ? "var(--block2-ink)" : "var(--block-ink)";
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: bg, color: ink, transition: "background 240ms ease" }}>
      <div style={{ padding: "20px 22px 12px", maxWidth: "var(--max)", width: "100%", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "inherit", padding: "6px 0", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, letterSpacing: "0.06em", opacity: 0.75 }}>
          ← BACK
        </button>
      </div>
      <div style={{ flex: 1, padding: "12px 28px", maxWidth: "var(--max)", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <div className="serif" style={{ position: "absolute", right: -10, top: "-2vh", fontSize: 280, lineHeight: 1, fontStyle: "italic", opacity: 0.18, pointerEvents: "none", userSelect: "none" }}>{letter}</div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.75, position: "relative" }}>
          SECTION {letter} · {count} ข้อ
        </div>
        <h1 className="serif" style={{ margin: "18px 0 22px", fontSize: 60, lineHeight: 0.95, fontStyle: "italic", fontWeight: 400, position: "relative" }}>
          {title}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.88, maxWidth: 440, position: "relative" }}>{desc}</p>
      </div>
      <div style={{ padding: "0 22px 28px", maxWidth: "var(--max)", width: "100%", margin: "0 auto" }}>
        <button onClick={onStart} style={{ width: "100%", padding: "16px 18px", borderRadius: 14, border: "none", background: ink, color: bg, fontSize: 15, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.01em", cursor: "pointer" }}>
          เริ่ม Section {letter} →
        </button>
      </div>
    </div>
  );
}
