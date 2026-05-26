"use client";

import { useMemo } from "react";
import { QUESTIONS, computeScores, type Answers } from "./questions";
import { Radar, PoleStrip } from "./Radar";
import { Frame, PrimaryBtn } from "./Screens";

const DIMS = ["D1", "D2", "D3", "D4", "D5", "D6"] as const;

export function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const scores = useMemo(() => computeScores(answers), [answers]);
  const name = (answers.A1 as string) || "คุณ";
  const rankedDims = useMemo(() => [...DIMS].sort((a, b) => (scores[b]?.value ?? 0) - (scores[a]?.value ?? 0)), [scores]);

  const snippet = (d: string) => {
    const s = scores[d];
    if (!s) return null;
    if (s.pole === "low") return QUESTIONS.snippets[`${d}_low` as keyof typeof QUESTIONS.snippets];
    if (s.pole === "high") return QUESTIONS.snippets[`${d}_high` as keyof typeof QUESTIONS.snippets];
    return null;
  };

  const h = (answers.A3 as { height?: number; weight?: number })?.height;
  const w = (answers.A3 as { height?: number; weight?: number })?.weight;
  const age = answers.A2 as number | undefined;
  const a4Options = QUESTIONS.sectionA.find((q) => q.id === "A4");
  const mult = a4Options && "options" in a4Options ? a4Options.options.find((o) => o.value === answers.A4)?.mult : undefined;
  const bmr = h && w && age ? Math.round(10 * w + 6.25 * h - 5 * age + 5) : null;
  const tdee = bmr && mult ? Math.round(bmr * mult) : null;

  return (
    <Frame>
      {/* HERO */}
      <div style={{ margin: "-20px -22px 0", padding: "36px 28px 32px", background: "var(--block)", color: "var(--block-ink)", borderRadius: "0 0 28px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -50, bottom: -50, width: 180, height: 180, borderRadius: "50%", background: "var(--block2)", opacity: 0.9 }} />
        <div style={{ position: "absolute", right: 90, top: 30, width: 36, height: 36, borderRadius: "50%", border: "1.5px solid currentColor", opacity: 0.3 }} />
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.75, position: "relative" }}>
          LONGENEER PROFILE · LAYER 01
        </div>
        <h1 className="serif" style={{ margin: "18px 0 6px", fontSize: 44, lineHeight: 1.0, fontStyle: "italic", fontWeight: 400, position: "relative", letterSpacing: "-0.02em" }}>
          สวัสดี <span style={{ color: "var(--block2)" }}>{name},</span><br />นี่คือ profile<br />ของคุณ.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.85, marginTop: 14, position: "relative", maxWidth: 360 }}>
          6 มิติของนิสัย วิเคราะห์จาก 18 คำตอบ — ใช้เป็นจุดตั้งต้นใน Onboarding session ไม่ใช่คำตัดสิน
        </p>
      </div>

      {/* RADAR */}
      <div style={{ marginTop: 28, padding: "28px 8px 24px", background: "var(--paper)", borderRadius: 18, border: "1px solid var(--rule)" }}>
        <div className="mono" style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.16em", color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 12 }}>
          6-Dimension Map
        </div>
        <Radar scores={scores} size={320} />
      </div>

      {/* POLE STRIPS */}
      <div style={{ marginTop: 28 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 4 }}>
          ตำแหน่งระหว่างขั้ว
        </div>
        {rankedDims.map((d) => <PoleStrip key={d} dim={d} scoreObj={scores[d]} />)}
      </div>

      {/* TDEE */}
      {tdee ? (
        <div style={{ marginTop: 28, padding: "18px 20px", background: "var(--secondary-soft)", borderRadius: 18, color: "var(--ink)" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>
            ค่าพลังงานเบื้องต้น
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div className="serif" style={{ fontSize: 38, fontStyle: "italic", lineHeight: 1, color: "var(--ink-soft)" }}>{bmr}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.05em", marginTop: 4 }}>BMR · kcal</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 52, fontStyle: "italic", lineHeight: 1, color: "var(--secondary)" }}>{tdee}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.05em", marginTop: 4 }}>TDEE · kcal/วัน</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, color: "var(--ink-soft)", fontSize: 12, lineHeight: 1.5 }}>
              จุดตั้งต้นสำหรับ design plan โภชนาการของคุณ
            </div>
          </div>
        </div>
      ) : null}

      {/* LAYER 2 — INSIGHTS */}
      <div style={{ marginTop: 44 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-faint)" }}>LAYER 02 · INSIGHTS</div>
        <h2 className="serif" style={{ margin: "10px 0 22px", fontSize: 32, lineHeight: 1.1, fontStyle: "italic", fontWeight: 400 }}>
          อ่านผลลัพธ์<br />ก่อนเริ่ม.
        </h2>
        {rankedDims.map((d, idx) => {
          const s = scores[d];
          const sn = snippet(d);
          if (!s) return null;
          const dimColor = idx % 2 === 0 ? "var(--accent)" : "var(--secondary)";
          const dimSoft = idx % 2 === 0 ? "var(--accent-soft)" : "var(--secondary-soft)";
          return (
            <div key={d} style={{ padding: "22px 0", borderTop: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 6px", borderRadius: 999, background: dimSoft, color: "var(--ink)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: dimColor, color: "var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 10 }}>{d}</span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.name}</span>
                  </div>
                  <div className="serif" style={{ fontSize: 30, fontStyle: "italic", marginTop: 10, color: dimColor, lineHeight: 1.1 }}>{s.label}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="serif" style={{ fontSize: 38, fontStyle: "italic", color: dimColor, lineHeight: 1 }}>{s.value?.toFixed(1)}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.06em" }}>/ 5.0</div>
                </div>
              </div>
              {sn ? (
                <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: "var(--ink)" }}>{sn.body}</p>
              ) : (
                <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", fontStyle: "italic" }}>
                  คุณอยู่ตรงกลางระหว่าง <strong style={{ color: "var(--ink)" }}>{QUESTIONS.dimensions[d as keyof typeof QUESTIONS.dimensions].thLow}</strong> กับ <strong style={{ color: "var(--ink)" }}>{QUESTIONS.dimensions[d as keyof typeof QUESTIONS.dimensions].thHigh}</strong> — ระบบของคุณไม่ต้องปรับตามขั้วใดขั้วหนึ่ง มี flexibility ในการ design
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* CLOSING BLOCK */}
      <div style={{ marginTop: 36, padding: "28px 24px", background: "var(--block2)", color: "var(--block2-ink)", borderRadius: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -30, bottom: -30, width: 120, height: 120, borderRadius: "50%", border: "1.5px solid currentColor", opacity: 0.25 }} />
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", opacity: 0.75, textTransform: "uppercase", position: "relative" }}>
          ภาพรวมของระบบที่จะออกแบบให้คุณ
        </div>
        <p className="serif" style={{ fontSize: 24, lineHeight: 1.35, fontStyle: "italic", margin: "12px 0 0", position: "relative" }}>
          {`เราจะออกแบบให้ระบบของคุณเริ่มจาก ${scores.D1?.thLabel || "ความสมดุล"} · ${scores.D2?.thLabel || ""} · ${scores.D5?.thLabel || ""} — โดยให้ ${scores.D6?.pole === "high" ? "มี milestone visible ระหว่างทาง" : "feedback loop สั้น"} เพื่อกัน drop-off`}
        </p>
      </div>

      {/* LAYER 3 — CTA */}
      <div style={{ marginTop: 36, paddingBottom: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-faint)" }}>LAYER 03 · NEXT STEP</div>
        <h2 className="serif" style={{ margin: "10px 0 8px", fontSize: 36, lineHeight: 1.05, fontStyle: "italic", fontWeight: 400 }}>
          จอง <span style={{ color: "var(--accent)" }}>Onboarding</span>.
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>
          30 นาที 1-on-1 กับ Chaivoot — เพื่อแปล Profile นี้ เป็นระบบ longevity ที่จับต้องได้
        </p>
        <div style={{ marginTop: 18 }}>
          <PrimaryBtn onClick={() => alert("เปิดลิงก์จองเวลา (Cal.com / Calendly จะถูก wire จริงตอน production)")}>
            จอง Onboarding Session →
          </PrimaryBtn>
        </div>
        <div className="mono" style={{ marginTop: 14, fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.5, letterSpacing: "0.02em" }}>
          NOTE · ข้อมูลของคุณจะถูกส่งให้ Chaivoot เพื่อออกแบบ session ส่วนตัวของคุณ — ไม่ถูกใช้เพื่อจุดประสงค์อื่น
        </div>
      </div>

      <hr style={{ margin: "36px 0 18px", border: "none", borderTop: "1px solid var(--rule)" }} />
      <button onClick={onRestart} style={{ background: "transparent", border: "none", color: "var(--ink-soft)", fontSize: 13, padding: 0, textDecoration: "underline", cursor: "pointer" }}>
        ↺ ทำใหม่อีกรอบ
      </button>
      <p style={{ marginTop: 28, fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.55 }}>
        Longeneer Profile เป็นเครื่องมือ self-reflection ไม่ใช่แบบทดสอบทางการแพทย์หรือจิตวิทยา ผลที่ได้เป็นส่วนตัว ไม่ได้จัดเก็บตามนโยบายความเป็นส่วนตัว
      </p>
    </Frame>
  );
}
