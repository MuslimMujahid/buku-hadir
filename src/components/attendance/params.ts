/**
 * Helpers murni untuk mem-parsing query string halaman kelas.
 * Aman dipakai di server maupun client component (tanpa dependensi Node).
 *
 * Kontrak tanggal: string UTC date-only "YYYY-MM-DD"; bulan: "YYYY-MM".
 */

export type ClassTab = "attendance" | "student" | "monthly";

export const CLASS_TABS: readonly ClassTab[] = ["attendance", "student", "monthly"];

/** Ambil nilai pertama bila param muncul berulang (?tab=a&tab=b). */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTabParam(value: string | undefined): ClassTab {
  if (value === "student" || value === "monthly") return value;
  return "attendance";
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;

/** Validasi ketat YYYY-MM-DD, termasuk tanggal kalender nyata (mis. bukan 30 Feb). */
export function isValidDateString(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidMonthString(value: string): boolean {
  const match = MONTH_RE.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function todayDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function currentMonthString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

/** Param tanggal tidak valid/tidak ada → jatuh ke tanggal hari ini (UTC). */
export function parseDateParam(value: string | undefined, fallback: string = todayDateString()): string {
  return value !== undefined && isValidDateString(value) ? value : fallback;
}

/** Param bulan tidak valid/tidak ada → jatuh ke bulan berjalan (UTC). */
export function parseMonthParam(value: string | undefined, fallback: string = currentMonthString()): string {
  return value !== undefined && isValidMonthString(value) ? value : fallback;
}

/** Geser tanggal N hari (negatif = mundur), tetap dalam format YYYY-MM-DD. */
export function shiftDate(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Geser bulan N bulan (negatif = mundur), tetap dalam format YYYY-MM. */
export function shiftMonth(monthStr: string, months: number): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return date.toISOString().slice(0, 7);
}

/**
 * Normalisasi nilai tanggal dari database (string ISO atau Date) menjadi
 * string UTC date-only YYYY-MM-DD agar aman diformat & dibandingkan.
 */
export function toDateString(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}
