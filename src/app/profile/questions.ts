export type QuestionText = {
  id: string;
  kind: 'text';
  required: boolean;
  label: string;
  placeholder: string;
};

export type QuestionNumber = {
  id: string;
  kind: 'number';
  required: boolean;
  min: number;
  max: number;
  label: string;
  suffix: string;
};

export type DualNumberField = {
  key: string;
  suffix: string;
  min: number;
  max: number;
  placeholder: string;
};

export type QuestionDualNumber = {
  id: string;
  kind: 'dual-number';
  required: boolean;
  label: string;
  fields: [DualNumberField, DualNumberField];
};

export type SingleSelectOption = {
  value: string;
  title: string;
  desc: string;
  mult: number;
};

export type QuestionSingleSelect = {
  id: string;
  kind: 'single-select';
  required: boolean;
  label: string;
  options: SingleSelectOption[];
};

export type QuestionLongtext = {
  id: string;
  kind: 'longtext';
  required: boolean;
  label: string;
  placeholder: string;
};

export type QuestionMultiSelect = {
  id: string;
  kind: 'multi-select';
  required: boolean;
  label: string;
  hint: string;
  options: string[];
  otherOption: string;
  exclusive: string;
};

export type SectionAQuestion =
  | QuestionText
  | QuestionNumber
  | QuestionDualNumber
  | QuestionSingleSelect
  | QuestionLongtext
  | QuestionMultiSelect;

export type LikertQuestion = {
  id: string;
  dim: string;
  reverse: boolean;
  text: string;
};

export type SectionCQuestion = {
  id: string;
  kind: 'longtext';
  required: boolean;
  label: string;
  placeholder: string;
};

export type DimensionMeta = {
  name: string;
  low: string;
  mid: string;
  high: string;
  thLow: string;
  thMid: string;
  thHigh: string;
};

export type Snippet = {
  title: string;
  th: string;
  body: string;
};

export type Pole = 'low' | 'mid' | 'high';

export type DimensionScore = {
  value: number | null;
  pole: Pole;
  label: string;
  thLabel: string;
  name: string;
};

export type Answers = Record<string, unknown>;

export type DimScore = DimensionScore;

export type QuestionFlat = {
  id: string;
  kind: string;
  section: string;
  required?: boolean;
  label?: string;
  hint?: string;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
  fields?: DualNumberField[];
  options?: SingleSelectOption[];
  multiOptions?: string[];
  otherOption?: string;
  exclusive?: string;
  dim?: string;
  reverse?: boolean;
  text?: string;
};

export function buildAllQuestions(): QuestionFlat[] {
  return [
    ...QUESTIONS.sectionA.map((q) => ({ ...(q as Record<string, unknown>), section: "A", multiOptions: "options" in q && q.kind === "multi-select" ? (q as QuestionMultiSelect).options : undefined, options: "options" in q && q.kind === "single-select" ? (q as QuestionSingleSelect).options : undefined } as QuestionFlat)),
    ...QUESTIONS.sectionB.map((b) => ({ id: b.id, kind: "likert", section: "B", dim: b.dim, reverse: b.reverse, text: b.text } as QuestionFlat)),
    ...QUESTIONS.sectionC.map((q) => ({ ...q, section: "C" } as QuestionFlat)),
  ];
}

export const QUESTIONS = {
  sectionA: [
    {
      id: 'A1', kind: 'text', required: true,
      label: 'ชื่อเล่นของคุณ?',
      placeholder: 'เช่น มะม่วง, อิงค์, ตุ้ย...',
    },
    {
      id: 'A2', kind: 'number', required: true, min: 18, max: 100,
      label: 'อายุ?',
      suffix: 'ปี',
    },
    {
      id: 'A3', kind: 'dual-number', required: true,
      label: 'ส่วนสูง · น้ำหนัก?',
      fields: [
        { key: 'height', suffix: 'cm', min: 100, max: 250, placeholder: '170' },
        { key: 'weight', suffix: 'kg', min: 30, max: 250, placeholder: '65' },
      ],
    },
    {
      id: 'A4', kind: 'single-select', required: true,
      label: 'ระดับกิจกรรมปัจจุบันของคุณ?',
      options: [
        { value: 'sedentary', title: 'Sedentary', desc: 'นั่งโต๊ะเกือบทั้งวัน ไม่ได้ออกกำลังกาย', mult: 1.2 },
        { value: 'light', title: 'Light', desc: 'ออกกำลังกายเบา 1–3 วัน/สัปดาห์', mult: 1.375 },
        { value: 'moderate', title: 'Moderate', desc: 'ออกกำลังกาย 3–5 วัน/สัปดาห์', mult: 1.55 },
        { value: 'active', title: 'Active', desc: 'ออกกำลังกายหนัก 6–7 วัน/สัปดาห์', mult: 1.725 },
        { value: 'very_active', title: 'Very active', desc: 'เทรนหนัก + งานใช้แรง', mult: 1.9 },
      ],
    },
    {
      id: 'A5', kind: 'longtext', required: true,
      label: 'อะไรคือสิ่งที่คุณอยากให้เกิดขึ้นใน 6 เดือนข้างหน้า?',
      placeholder: 'เช่น รู้สึกไม่เหนื่อยง่าย / ลดไขมัน 5 กิโล / นอนหลับดีขึ้น...',
    },
    {
      id: 'A6', kind: 'multi-select', required: false,
      label: 'ตอนนี้มีปัญหาสุขภาพอะไรที่รบกวนใจอยู่มั้ย?',
      hint: 'เลือกได้หลายข้อ',
      options: [
        'น้ำหนักเกินเกณฑ์',
        'นอนไม่หลับ / นอนไม่พอ',
        'พลังงานต่ำ เหนื่อยง่าย',
        'ความเครียดสะสม',
        'ระบบย่อยอาหารไม่ดี',
        'กล้ามเนื้อลดลง',
        'ไขมันในเลือด / ความดัน / น้ำตาลสูง',
        'อื่นๆ (ระบุ)',
        'ไม่มี',
      ],
      otherOption: 'อื่นๆ (ระบุ)',
      exclusive: 'ไม่มี',
    },
  ] as const satisfies readonly SectionAQuestion[],

  sectionB: [
    // D1: Discipline (high = มีวินัย)
    { id: 'B1',  dim: 'D1', reverse: false, text: 'ฉันทำตามกิจวัตรประจำวันได้สม่ำเสมอโดยไม่ต้องฝืน' },
    { id: 'B2',  dim: 'D1', reverse: false, text: 'เมื่อตั้งเป้าหมายไว้ ฉันมักทำตามจนสำเร็จ' },
    { id: 'B3',  dim: 'D1', reverse: true,  text: 'ฉันปล่อยให้แต่ละวันดำเนินไปเองโดยไม่วางแผนล่วงหน้า' },
    { id: 'B4',  dim: 'D1', reverse: true,  text: 'เมื่อแผนเปลี่ยนกะทันหัน ฉันปรับตัวได้ทันทีโดยไม่เครียด' },
    // D2: Social (high = ชาร์จด้วยคน)
    { id: 'B5',  dim: 'D2', reverse: false, text: 'ฉันรู้สึกมีพลังมากขึ้นหลังจากใช้เวลากับคนอื่น' },
    { id: 'B6',  dim: 'D2', reverse: false, text: 'ฉันชอบทำกิจกรรมร่วมกับคนอื่นมากกว่าทำคนเดียว' },
    { id: 'B7',  dim: 'D2', reverse: true,  text: 'หลังวันที่เหนื่อย สิ่งที่ฉันต้องการคือเวลาส่วนตัว' },
    { id: 'B8',  dim: 'D2', reverse: true,  text: 'ฉันคิดอะไรได้ดีที่สุดเมื่ออยู่คนเดียว' },
    // D3: Data (high = ใช้ข้อมูล)
    { id: 'B9',  dim: 'D3', reverse: false, text: 'ฉันชอบดูตัวเลขความก้าวหน้าของตัวเอง' },
    { id: 'B10', dim: 'D3', reverse: false, text: 'ฉันใช้แอปหรืออุปกรณ์ติดตามสุขภาพเป็นประจำ' },
    { id: 'B11', dim: 'D3', reverse: true,  text: 'ฉันรู้จักร่างกายตัวเองดีโดยไม่ต้องพึ่งข้อมูล' },
    { id: 'B12', dim: 'D3', reverse: true,  text: 'ฉันตัดสินใจจากความรู้สึกมากกว่าตัวเลข' },
    // D4: Variety (high = ชอบลองใหม่)
    { id: 'B13', dim: 'D4', reverse: false, text: 'ฉันชอบลองอาหารหรือร้านใหม่ๆ อยู่เสมอ' },
    { id: 'B14', dim: 'D4', reverse: false, text: 'ฉันเปลี่ยนรูปแบบการออกกำลังกายบ่อย' },
    { id: 'B15', dim: 'D4', reverse: true,  text: 'ฉันกินอาหารเดิมซ้ำได้เป็นสัปดาห์' },
    { id: 'B16', dim: 'D4', reverse: true,  text: 'ฉันรู้สึกสบายใจเมื่อแต่ละวันเป็นไปตามรูปแบบเดิม' },
    // D5: Chronotype (high = คนเช้า)
    { id: 'B17', dim: 'D5', reverse: false, text: 'ฉันตื่นเช้าได้เองโดยไม่ต้องฝืน' },
    { id: 'B18', dim: 'D5', reverse: false, text: 'ช่วงเช้าเป็นเวลาที่ฉันมีสมาธิมากที่สุด' },
    { id: 'B19', dim: 'D5', reverse: true,  text: 'ฉันทำงานได้ดีที่สุดในช่วงค่ำถึงดึก' },
    { id: 'B20', dim: 'D5', reverse: true,  text: 'ช่วงหลังสามทุ่ม ฉันยังรู้สึกตื่นตัวและกระตือรือร้น' },
    // D6: Horizon (high = ระยะยาว)
    { id: 'B21', dim: 'D6', reverse: false, text: 'ฉันทำสิ่งที่ยังไม่เห็นผลได้ต่อเนื่องเป็นเดือน' },
    { id: 'B22', dim: 'D6', reverse: false, text: 'เป้าหมายระยะยาวมีพลังกับฉันมากกว่าผลลัพธ์ระยะสั้น' },
    { id: 'B23', dim: 'D6', reverse: true,  text: 'ฉันต้องเห็นความก้าวหน้าบ่อยๆ ถึงจะทำต่อได้' },
    { id: 'B24', dim: 'D6', reverse: true,  text: 'ฉันสนใจผลลัพธ์ที่เกิดขึ้นเร็วมากกว่าแผนระยะยาว' },
  ] as const satisfies readonly LikertQuestion[],

  sectionC: [
    { id: 'C1', kind: 'longtext' as const, required: false, label: 'เคยลองอะไรเพื่อสุขภาพมาแล้วบ้าง?', placeholder: 'เล่าให้ฟังได้เลย...' },
    { id: 'C2', kind: 'longtext' as const, required: false, label: 'อะไรคืออุปสรรคหลักที่ทำให้ไม่ stick กับสิ่งที่ตั้งใจ?', placeholder: 'ความรู้สึก, สถานการณ์, คน...' },
    { id: 'C3', kind: 'longtext' as const, required: false, label: 'อยากบอกผมอะไรเพิ่มเติม ก่อนเราจะคุยกัน?', placeholder: 'อะไรก็ได้ที่คิดออก' },
  ] as const satisfies readonly SectionCQuestion[],

  likertLabels: {
    1: 'ไม่ตรงกับฉันเลย',
    2: 'ไม่ค่อยตรง',
    3: 'กลางๆ',
    4: 'ค่อนข้างตรง',
    5: 'ตรงกับฉันมาก',
  } as const,

  dimensions: {
    D1: { name: 'วินัย',       low: 'Spontaneous',   mid: 'Flexible',  high: 'Disciplined',    thLow: 'ยืดหยุ่น',     thMid: 'สมดุล',      thHigh: 'มีวินัย' },
    D2: { name: 'พลังงานสังคม', low: 'Solo Charger',  mid: 'Balanced',  high: 'Social Charger', thLow: 'ชาร์จคนเดียว', thMid: 'สมดุล',      thHigh: 'ชาร์จด้วยคน' },
    D3: { name: 'การใช้ข้อมูล', low: 'Intuitive',     mid: 'Mixed',     high: 'Data-driven',    thLow: 'ใช้สัญชาตญาณ', thMid: 'ผสมผสาน',    thHigh: 'ใช้ข้อมูล' },
    D4: { name: 'ความหลากหลาย', low: 'Routine Lover', mid: 'Balanced',  high: 'Variety Seeker', thLow: 'ชอบของเดิม',   thMid: 'สมดุล',      thHigh: 'ชอบลองใหม่' },
    D5: { name: 'จังหวะชีวิต',  low: 'Night Owl',     mid: 'All-day',   high: 'Early Bird',     thLow: 'คนกลางคืน',    thMid: 'ทั้งวัน',    thHigh: 'คนเช้า' },
    D6: { name: 'มุมมองเวลา',  low: 'Short-term',    mid: 'Mixed',     high: 'Long-term',      thLow: 'ระยะสั้น',     thMid: 'ผสมผสาน',    thHigh: 'ระยะยาว' },
  } as const satisfies Record<string, DimensionMeta>,

  snippets: {
    D1_low:  { title: 'Spontaneous', th: 'คนทำตามจังหวะของตัวเอง', body: 'คุณเป็นคนที่ทำตามจังหวะของตัวเอง มากกว่าตามตารางที่ตั้งไว้ ระบบ longevity ที่จะ work สำหรับคุณ ต้องมี flexibility สูง — ไม่ใช่ "ตื่นตี 5 ทุกวัน" แต่อาจเป็น "กิน protein พอในแต่ละมื้อ" — กฏที่ใช้ได้ในทุกบริบท' },
    D1_high: { title: 'Disciplined', th: 'คนทำตามแผน เมื่อตั้งใจแล้วทำได้', body: 'คุณเป็นคนทำตามแผน — เมื่อตั้งใจแล้ว ทำได้ จุดแข็งนี้ทำให้ habit ติดง่ายกว่าคนทั่วไป แต่ระวัง over-disciplined ที่ทำให้หมดไฟ — ระบบของคุณควรมี recovery built-in ตั้งแต่แรก' },
    D2_low:  { title: 'Solo Charger', th: 'ชาร์จพลังจากเวลาคนเดียว', body: 'คุณ recover พลังจากเวลาคนเดียว — ไม่ใช่จากการเจอคน ระบบของคุณควรเน้น solo activity (เดินคนเดียว, weight training ที่บ้าน) มากกว่ากลุ่ม fitness class — และให้ social pillar ทำงานผ่าน relationship เชิงคุณภาพไม่ใช่ปริมาณ' },
    D2_high: { title: 'Social Charger', th: 'ได้พลังจากการอยู่กับคน', body: 'คุณได้พลังจากการอยู่กับคน — solo workout จะรู้สึกฝืน ระบบของคุณควรมี accountability partner, group walk, หรือ shared meal เป็น core ไม่ใช่ option — social pillar ของคุณเป็น lever ที่ทรงพลังที่สุด' },
    D3_low:  { title: 'Intuitive', th: 'ตัดสินจากความรู้สึกของร่างกาย', body: 'คุณตัดสินจากความรู้สึกของร่างกายมากกว่าตัวเลข ระบบ tracking ที่ลึกเกินไปอาจกลายเป็นภาระ — จะออกแบบให้คุณใช้ data เฉพาะจุด critical (เช่น น้ำหนักรายสัปดาห์) และอาศัย body wisdom สำหรับเรื่องอื่น' },
    D3_high: { title: 'Data-driven', th: 'trust ตัวเลขมากกว่าความรู้สึก', body: 'คุณ trust ตัวเลขมากกว่าความรู้สึก — รู้ตัวว่ากำลังไปทางไหน ระบบของคุณจะใช้ tracking เต็มศักยภาพ: body composition, sleep score, HRV — แต่ระวัง analysis paralysis ที่ทำให้ track มากกว่าทำ' },
    D4_low:  { title: 'Routine Lover', th: 'ของเดิมๆ ทำให้รู้สึกมั่นคง', body: 'ของเดิมๆ ไม่ทำให้คุณเบื่อ — กลับทำให้รู้สึกมั่นคง ระบบของคุณจะเน้น 5–7 อาหารหลักหมุนเวียน, exercise pattern เดียวกัน, เวลาเดียวกันทุกวัน — ไม่ใช่ "boring" แต่เป็น "predictably sustainable"' },
    D4_high: { title: 'Variety Seeker', th: 'ต้องการความหลากหลายเพื่ออยู่กับ habit', body: 'ของเดิมๆ ทำให้คุณหมดไฟ — ต้องการความหลากหลายเพื่ออยู่กับ habit ได้ ระบบของคุณต้องมี rotation built-in: เปลี่ยน exercise ทุก 2–3 สัปดาห์, ลอง recipe ใหม่, vary workout intensity — ไม่ใช่ความฟุ้งซ่าน แต่เป็น sustainability strategy' },
    D5_low:  { title: 'Night Owl', th: 'ร่างกายตื่นจริงๆ ตอนสาย', body: 'ร่างกายคุณตื่นจริงๆ ตอนสาย — ไม่ใช่ตอนตี 5 ระบบของคุณจะออกแบบให้ exercise เป็นช่วงเที่ยง-เย็น, deep work เป็นช่วงค่ำ, sleep schedule ที่เลื่อน 1–2 ชม. จากปกติ — ไม่ฝืน chronotype' },
    D5_high: { title: 'Early Bird', th: 'เช้าคือเวลาทอง', body: 'เช้าคือเวลาทองของคุณ — หัวใสที่สุด พลังเต็มที่ ระบบของคุณจะ leverage morning energy: workout 6–8 โมง, planning session ก่อนเที่ยง, social activity ช่วงกลางวัน — และนอนเร็วเพื่อรักษา rhythm' },
    D6_low:  { title: 'Short-term', th: 'ผลทันทีคือ fuel ของคุณ', body: 'ผลทันทีคือ fuel ของคุณ — เป้าหมาย 10 ปีรู้สึกไกลเกินไป ระบบของคุณจะ design feedback loop สั้น: ดู progress ทุก 3–7 วัน, milestone เล็กๆ ทุก 2 สัปดาห์, reward system ที่ tangible — long-term outcome เกิดจากสะสมของ short wins' },
    D6_high: { title: 'Long-term', th: 'เป้าหมายระยะยาวมีพลังกับคุณ', body: 'เป้าหมายระยะยาวมีพลังกับคุณ — ผลพรุ่งนี้ไม่จำเป็น ระบบของคุณจะ frame ทุกอย่างเป็น "10-year view" — แต่ระวัง: เมื่อ progress เล็กในระยะสั้น คุณอาจถอดใจเพราะ "ไม่เห็นภาพใหญ่" — ต้องสร้าง milestone visible ระหว่างทาง' },
  } as const satisfies Record<string, Snippet>,

  demoAnswers: {
    A1: 'มะม่วง', A2: 34,
    A3: { height: 172, weight: 71 },
    A4: 'light',
    A5: 'อยากรู้สึกตื่นมาแล้วมีพลัง ไม่ต้องพึ่งกาแฟ และค่อยๆ ลดไขมันหน้าท้องลง',
    A6: ['พลังงานต่ำ เหนื่อยง่าย', 'ความเครียดสะสม'],
    B1: 3, B2: 4, B3: 4, B4: 4,
    B5: 2, B6: 2, B7: 5, B8: 4,
    B9: 5, B10: 5, B11: 2, B12: 2,
    B13: 2, B14: 2, B15: 4, B16: 4,
    B17: 2, B18: 2, B19: 4, B20: 4,
    B21: 4, B22: 5, B23: 4, B24: 2,
    C1: 'เคยพยายามวิ่งเช้าตอนต้นปี ทำได้สองสัปดาห์ แล้วก็เลิก',
    C2: 'ตื่นเช้าไม่ไหวจริงๆ ค่ะ และทำงานดึก',
    C3: 'อยากได้ระบบที่ไม่ต้องตื่นเช้า',
  } as const,
} as const;

export function computeScores(answers: Answers): Record<string, DimensionScore> {
  const score = (b: LikertQuestion): number | null => {
    const raw = answers[b.id];
    if (raw == null) return null;
    return b.reverse ? 6 - (raw as number) : (raw as number);
  };

  const avg = (arr: (number | null)[]): number | null => {
    const xs = arr.filter((x): x is number => x != null);
    if (!xs.length) return null;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  };

  const byDim: Record<string, (number | null)[]> = {};
  for (const b of QUESTIONS.sectionB) {
    (byDim[b.dim] ||= []).push(score(b));
  }

  const result: Record<string, DimensionScore> = {};
  for (const d of Object.keys(byDim)) {
    const v = avg(byDim[d]);
    const dim = QUESTIONS.dimensions[d as keyof typeof QUESTIONS.dimensions];
    let pole: Pole;
    let label: string;
    let thLabel: string;
    if (v == null)     { pole = 'mid';  label = dim.mid;  thLabel = dim.thMid; }
    else if (v <= 2.5) { pole = 'low';  label = dim.low;  thLabel = dim.thLow; }
    else if (v >= 3.5) { pole = 'high'; label = dim.high; thLabel = dim.thHigh; }
    else               { pole = 'mid';  label = dim.mid;  thLabel = dim.thMid; }
    result[d] = { value: v, pole, label, thLabel, name: dim.name };
  }
  return result;
}
