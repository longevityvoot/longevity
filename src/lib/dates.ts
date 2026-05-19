// Local midnight (Asia/Bangkok) for the @db.Date column. Postgres stores
// the date as-is; we anchor to the user's local day so a 23:00 check-in
// doesn't get filed under tomorrow's UTC date.
export function todayLocalDate(): Date {
  const now = new Date();
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  return new Date(Date.UTC(tz.getFullYear(), tz.getMonth(), tz.getDate()));
}

// Monday of the ISO week containing `d` (Bangkok-anchored midnight).
// Used as the weekStart key for WeeklyReflection rows.
export function mondayOf(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
}

// ISO date key (YYYY-MM-DD) usable as Map key.
export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
