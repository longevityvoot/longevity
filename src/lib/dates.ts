// Local midnight (Asia/Bangkok) for the @db.Date column. Postgres stores
// the date as-is; we anchor to the user's local day so a 23:00 check-in
// doesn't get filed under tomorrow's UTC date.
export function todayLocalDate(): Date {
  const now = new Date();
  const tz = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  return new Date(Date.UTC(tz.getFullYear(), tz.getMonth(), tz.getDate()));
}
