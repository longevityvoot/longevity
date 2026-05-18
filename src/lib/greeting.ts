// Time-of-day greeting anchored to Asia/Bangkok so the user's app feels
// local even if Vercel runs from elsewhere.
export function bangkokHour(now: Date = new Date()): number {
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  return tz.getHours();
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "สวัสดีตอนดึก";
  if (hour < 12) return "สวัสดีตอนเช้า";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  if (hour < 20) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
}
