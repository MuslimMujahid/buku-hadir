"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { AttendanceDateStatus } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { formatBulan, formatTanggalPanjang } from "./format";
import { parseMonthParam, shiftMonth } from "./params";

type DatePickerProps = {
  date: string;
  statuses: AttendanceDateStatus[];
  totalStudents: number;
  onSelect: (date: string) => void;
};

type DayStatus = "complete" | "incomplete" | null;

const WEEKDAYS = [
  { short: "Sen", long: "Senin" },
  { short: "Sel", long: "Selasa" },
  { short: "Rab", long: "Rabu" },
  { short: "Kam", long: "Kamis" },
  { short: "Jum", long: "Jumat" },
  { short: "Sab", long: "Sabtu" },
  { short: "Min", long: "Minggu" },
] as const;

function dateForDay(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function monthParts(month: string): { year: number; monthIndex: number } {
  const [year, monthNumber] = month.split("-").map(Number);
  return { year, monthIndex: monthNumber - 1 };
}

function getDaysInMonth(month: string): number {
  const { year, monthIndex } = monthParts(month);
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function getLeadingBlankCount(month: string): number {
  const { year, monthIndex } = monthParts(month);
  // Monday is the first column in the Indonesian calendar layout.
  return (new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() + 6) % 7;
}

function getDayStatus(
  status: AttendanceDateStatus | undefined,
  totalStudents: number,
): DayStatus {
  if (!status || totalStudents === 0) return null;
  if (status.markedCount === totalStudents) return "complete";
  return "incomplete";
}

function statusDescription(
  status: AttendanceDateStatus | undefined,
  dayStatus: DayStatus,
  totalStudents: number,
): string {
  if (dayStatus === "complete") return `lengkap, ${status?.markedCount ?? 0} dari ${totalStudents} siswa ditandai`;
  if (dayStatus === "incomplete") return `belum lengkap, ${status?.markedCount ?? 0} dari ${totalStudents} siswa ditandai`;
  return "belum ada catatan absensi";
}

/** Pemilih tanggal absensi berbentuk kalender popover, bukan input native. */
export function DatePicker({ date, statuses, totalStudents, onSelect }: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const calendarId = useId();
  const selectedMonth = parseMonthParam(date.slice(0, 7));
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(selectedMonth);
  const statusByDate = useMemo(
    () => new Map(statuses.map((status) => [status.date, status])),
    [statuses],
  );

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const leadingBlankCount = getLeadingBlankCount(visibleMonth);
  const daysInMonth = getDaysInMonth(visibleMonth);
  const cellCount = Math.ceil((leadingBlankCount + daysInMonth) / 7) * 7;
  const { year, monthIndex } = monthParts(visibleMonth);
  const weeks = Array.from({ length: cellCount / 7 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, weekdayIndex) => {
      const cellIndex = weekIndex * 7 + weekdayIndex;
      const day = cellIndex - leadingBlankCount + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    }),
  );

  function moveMonth(amount: number) {
    setVisibleMonth((month) => shiftMonth(month, amount));
  }

  function selectDate(nextDate: string) {
    setIsOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    onSelect(nextDate);
  }

  return (
    <div ref={rootRef} className="relative inline-block w-full">
      <Button
        variant="secondary"
        size="lg"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={calendarId}
        aria-label={`Pilih tanggal absensi, ${formatTanggalPanjang(date)}`}
        className="w-full justify-between"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="min-w-0 truncate text-left">{formatTanggalPanjang(date)}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/30 p-4 sm:absolute sm:inset-auto sm:left-0 sm:top-[calc(100%+0.5rem)] sm:block sm:w-[min(22rem,calc(100vw-2rem))] sm:bg-transparent sm:p-0"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            id={calendarId}
            role="dialog"
            aria-modal="true"
            aria-label={`Kalender ${formatBulan(visibleMonth)}`}
            className="mx-auto mt-auto w-full rounded-lg border border-line bg-raised p-3 shadow-card sm:mt-0 sm:w-full"
            onClick={(event) => event.stopPropagation()}
          >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="md"
              aria-label="Bulan sebelumnya"
              className="w-11 shrink-0 px-0"
              onClick={() => moveMonth(-1)}
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </Button>
            <p className="text-center font-display text-base font-semibold capitalize text-ink">
              {formatBulan(visibleMonth)}
            </p>
            <Button
              variant="ghost"
              size="md"
              aria-label="Bulan berikutnya"
              className="w-11 shrink-0 px-0"
              onClick={() => moveMonth(1)}
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <div role="grid" aria-label={`Tanggal pada ${formatBulan(visibleMonth)}`}>
            <div role="row" className="grid grid-cols-7 gap-1 pb-1">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday.short}
                  role="columnheader"
                  aria-label={weekday.long}
                  className="py-1 text-center font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint"
                >
                  {weekday.short}
                </div>
              ))}
            </div>

            <div className="grid gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} role="row" className="grid grid-cols-7 gap-1">
                  {week.map((day, weekdayIndex) => {
                    if (day === null) {
                      return <div key={`blank-${weekIndex}-${weekdayIndex}`} role="gridcell" aria-hidden="true" />;
                    }

                    const dayDate = dateForDay(visibleMonth, day);
                    const dayRecord = statusByDate.get(dayDate);
                    const dayStatus = getDayStatus(dayRecord, totalStudents);
                    const isSelected = dayDate === date;
                    const description = statusDescription(dayRecord, dayStatus, totalStudents);
                    const dateLabel = formatTanggalPanjang(dayDate);

                    return (
                      <div
                        key={dayDate}
                        role="gridcell"
                        aria-selected={isSelected}
                        className="min-w-0"
                      >
                        <button
                          type="button"
                          aria-label={`${dateLabel}, ${description}`}
                          aria-current={isSelected ? "date" : undefined}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative flex h-10 w-full min-w-0 flex-col items-center justify-center rounded-md border border-transparent font-mono text-sm tabular-nums text-ink transition-colors hover:border-line-strong hover:bg-sunk focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong",
                            isSelected && "border-accent-strong bg-accent-soft font-semibold text-accent-deep",
                          )}
                          onClick={() => selectDate(dayDate)}
                        >
                          <span>{day}</span>
                          {dayStatus ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "absolute bottom-1 size-2 rounded-full",
                                dayStatus === "complete" ? "bg-hadir" : "bg-alpa",
                              )}
                            />
                          ) : null}
                          <span className="sr-only">{description}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-hadir" />
              Lengkap
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-alpa" />
              Belum lengkap
            </span>
            <span className="sr-only">
              Bulan {monthIndex + 1} tahun {year}. Tanggal tanpa titik belum memiliki catatan absensi.
            </span>
          </div>
        </section>
        </div>
      ) : null}
    </div>
  );
}
