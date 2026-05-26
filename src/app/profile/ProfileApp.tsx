"use client";

import { useState, useCallback, useEffect } from "react";
import { QUESTIONS, buildAllQuestions, type Answers, type QuestionFlat } from "./questions";
import { PALETTES, applyPalette } from "./palettes";
import {
  Welcome, SectionIntro, TopBar, Frame, PrimaryBtn,
  TextScreen, DualNumberScreen, LongTextScreen,
  SingleSelectScreen, MultiSelectScreen, LikertScreen,
} from "./Screens";
import { Results } from "./Results";

const allQuestions = buildAllQuestions();

const sectionInfo: Record<string, { letter: string; title: string; desc: string; count: number }> = {
  A: { letter: "A", title: "Context.", desc: "เริ่มจากข้อมูลพื้นฐาน — ใครคุณคืออะไร อยากให้ระบบนี้ทำงานเพื่ออะไร และตอนนี้กำลังกังวลอะไรอยู่", count: 6 },
  B: { letter: "B", title: "Profile.", desc: "ใจกลางของ Longeneer Profile — 24 ข้อวัด 6 มิติของนิสัย ตอบตามที่เป็นจริง ไม่มีคำตอบถูกผิด", count: 24 },
  C: { letter: "C", title: "Reflection.", desc: "สามข้อสุดท้าย — เปิดเล่าให้ผมฟัง อะไรที่ตัวเลขเก็บไม่ได้ ขอให้ใช้คำของคุณเอง", count: 3 },
};

type Phase = "welcome" | "A" | "B" | "C" | "questions" | "results";

export function ProfileApp() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { applyPalette(PALETTES.grove); }, []);

  const current = allQuestions[qi];

  const startSection = (sec: string) => {
    const idx = allQuestions.findIndex((q) => q.section === sec);
    setQi(idx);
    setPhase("questions");
  };

  const advance = useCallback(() => {
    if (qi >= allQuestions.length - 1) {
      setSubmitting(true);
      setTimeout(() => { setPhase("results"); setSubmitting(false); }, 600);
      return;
    }
    const next = allQuestions[qi + 1];
    if (next.section !== current.section) {
      setPhase(next.section as Phase);
      setQi(qi + 1);
    } else {
      setQi(qi + 1);
    }
  }, [qi, current]);

  const back = useCallback(() => {
    if (qi <= 0) { setPhase("welcome"); return; }
    const prev = allQuestions[qi - 1];
    if (prev.section !== current.section) {
      setPhase(current.section as Phase);
    } else {
      setQi(qi - 1);
    }
  }, [qi, current]);

  const setAns = (id: string, val: unknown) => setAnswers((a) => ({ ...a, [id]: val }));

  const skipToDemo = () => {
    setAnswers({ ...QUESTIONS.demoAnswers });
    setPhase("results");
  };

  const isAnswered = (q: QuestionFlat) => {
    const v = answers[q.id];
    if (q.kind === "likert") return v != null;
    if (!q.required) return true;
    if (q.kind === "text") return typeof v === "string" && v.trim().length > 0;
    if (q.kind === "number") return typeof v === "number" && !isNaN(v) && v >= (q.min ?? -Infinity) && v <= (q.max ?? Infinity);
    if (q.kind === "dual-number") return v && q.fields!.every((f) => typeof (v as Record<string, unknown>)[f.key] === "number" && !isNaN((v as Record<string, number>)[f.key]));
    if (q.kind === "single-select") return !!v;
    if (q.kind === "longtext") return typeof v === "string" && v.trim().length > 0;
    return true;
  };

  if (phase === "welcome") return <Welcome onStart={() => setPhase("A")} onSkipDemo={skipToDemo} />;

  if (phase === "A" || phase === "B" || phase === "C") {
    const info = sectionInfo[phase];
    return (
      <SectionIntro {...info} onStart={() => startSection(phase)}
        onBack={() => {
          if (phase === "A") setPhase("welcome");
          else if (phase === "B") { const a = QUESTIONS.sectionA[QUESTIONS.sectionA.length - 1]; setQi(allQuestions.findIndex((q) => q.id === a.id)); setPhase("questions"); }
          else if (phase === "C") { const last = QUESTIONS.sectionB[QUESTIONS.sectionB.length - 1]; setQi(allQuestions.findIndex((q) => q.id === last.id)); setPhase("questions"); }
        }}
      />
    );
  }

  if (phase === "results") return <Results answers={answers} onRestart={() => { setAnswers({}); setQi(0); setPhase("welcome"); }} />;

  // questions phase
  const q = current;
  const total = allQuestions.length;
  const pos = qi + 1;
  const ans = answers[q.id];

  let screen: React.ReactNode;
  if (q.kind === "text" || q.kind === "number") {
    screen = <TextScreen q={q} value={ans as string | number | undefined} onChange={(v) => setAns(q.id, v)} onContinue={() => isAnswered(q) && advance()} />;
  } else if (q.kind === "dual-number") {
    screen = <DualNumberScreen q={q} value={ans as Record<string, number> | undefined} onChange={(v) => setAns(q.id, v)} onContinue={() => isAnswered(q) && advance()} />;
  } else if (q.kind === "longtext") {
    screen = <LongTextScreen q={q} value={ans as string | undefined} onChange={(v) => setAns(q.id, v)} onContinue={() => isAnswered(q) && advance()} />;
  } else if (q.kind === "single-select") {
    screen = <SingleSelectScreen q={q} value={ans as string | undefined} onChange={(v) => setAns(q.id, v)} onContinue={advance} />;
  } else if (q.kind === "multi-select") {
    screen = <MultiSelectScreen q={q} value={ans as { values: string[]; other: string } | undefined} onChange={(v) => setAns(q.id, v)} />;
  } else if (q.kind === "likert") {
    screen = <LikertScreen q={q} value={ans as number | undefined} onChange={(v) => setAns(q.id, v)} onContinue={advance} />;
  }

  const showFooter = q.kind === "text" || q.kind === "number" || q.kind === "dual-number" || q.kind === "longtext" || q.kind === "multi-select";
  const isLast = qi === allQuestions.length - 1;
  const isOptional = !q.required && q.kind !== "likert";

  return (
    <>
      <TopBar pos={pos} total={total} sectionLabel={`SECTION ${q.section}`} onBack={back} onSkipDemo={skipToDemo} />
      <Frame footer={showFooter ? (
        <PrimaryBtn onClick={advance} disabled={!isAnswered(q)}>
          {isLast ? "ดูผลลัพธ์ →" : isOptional && !ans ? "ข้ามข้อนี้" : "ต่อไป →"}
        </PrimaryBtn>
      ) : undefined}>
        {screen}
        {submitting ? (
          <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div className="serif" style={{ fontSize: 36, fontStyle: "italic" }}>กำลังประมวลผล...</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>computing 6 dimension scores</div>
          </div>
        ) : null}
      </Frame>
    </>
  );
}
