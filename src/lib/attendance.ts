import type { AttendanceStatus } from "@prisma/client";

export const ATTENDANCE_STATUSES = ["HADIR", "SAKIT", "IZIN", "ALPA"] as const;
export type AttendanceStatusValue = (typeof ATTENDANCE_STATUSES)[number];
export type StatusTotals = Record<AttendanceStatusValue, number>;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
function createUtcDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
}

export function isAttendanceStatus(value: unknown): value is AttendanceStatusValue {
  return typeof value === "string" && (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

export function parseUtcDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = createUtcDate(year, month - 1, day);
  if (!Number.isFinite(date.getTime())) return null;
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export const parseDate = parseUtcDate;
export const isValidDate = (value: unknown): value is string => parseUtcDate(value) !== null;

export type ParsedMonth = { year: number; month: number };

export function parseUtcMonth(value: unknown): ParsedMonth | null {
  if (typeof value !== "string") return null;
  const match = MONTH_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || year < 1 || month < 1 || month > 12) return null;
  return { year, month };
}

export const parseMonth = parseUtcMonth;
export const isValidMonth = (value: unknown): value is string => parseUtcMonth(value) !== null;

export function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatUtcMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export type MonthBounds = {
  start: Date;
  endExclusive: Date;
};

/** Returns a half-open UTC range [start, endExclusive) for a YYYY-MM month. */
export function getMonthBounds(value: unknown): MonthBounds | null {
  const parsed = parseUtcMonth(value);
  if (!parsed) return null;
  const start = createUtcDate(parsed.year, parsed.month - 1, 1);
  const endExclusive = createUtcDate(parsed.year, parsed.month, 1);
  return { start, endExclusive };
}

export const getMonthDateRange = getMonthBounds;

export function emptyStatusTotals(): StatusTotals {
  return { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
}

export function aggregateStatusTotals(
  records: Iterable<{ status: AttendanceStatus | string }>,
): StatusTotals {
  const totals = emptyStatusTotals();
  for (const record of records) {
    if (isAttendanceStatus(record.status)) totals[record.status] += 1;
  }
  return totals;
}

export const aggregateAttendance = aggregateStatusTotals;
export const calculateStatusTotals = aggregateStatusTotals;
