"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { AttendanceDateStatus } from "@/lib/data";
import { DatePicker } from "./date-picker";
import { MonthPicker } from "./month-picker";
import { shiftDate, shiftMonth } from "./params";

/**
 * Hook kecil untuk kontrol navigasi query: menggabungkan param aktif,
 * menyetel nilai baru, lalu router.replace di dalam transition.
 */
function useQueryNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(entries: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(entries)) params.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return { update, isPending };
}

const navButtonClass = "w-11 shrink-0 px-0";

type DateNavProps = {
  date: string;
  statuses: AttendanceDateStatus[];
  totalStudents: number;
  className?: string;
};

/** Pemilih tanggal absensi: tombol hari sebelum/berikut + kalender. */
export function DateNav({ date, statuses, totalStudents, className }: DateNavProps) {
  const { update, isPending } = useQueryNavigation();
  return (
    <div
      className={cn("flex items-stretch gap-1.5", isPending && "opacity-70", className)}
      aria-busy={isPending || undefined}
    >
      <Button
        variant="secondary"
        aria-label="Hari sebelumnya"
        className={navButtonClass}
        onClick={() => update({ date: shiftDate(date, -1) })}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        <DatePicker
          key={date}
          date={date}
          statuses={statuses}
          totalStudents={totalStudents}
          onSelect={(nextDate) => update({ date: nextDate })}
        />
      </div>
      <Button
        variant="secondary"
        aria-label="Hari berikutnya"
        className={navButtonClass}
        onClick={() => update({ date: shiftDate(date, 1) })}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

type MonthNavProps = { month: string; className?: string };

/** Pemilih bulan rekap: tombol bulan sebelum/berikut + popover bulan. */
export function MonthNav({ month, className }: MonthNavProps) {
  const { update, isPending } = useQueryNavigation();
  return (
    <div
      className={cn("flex items-stretch gap-1.5", isPending && "opacity-70", className)}
      aria-busy={isPending || undefined}
    >
      <Button
        variant="secondary"
        aria-label="Bulan sebelumnya"
        className={navButtonClass}
        onClick={() => update({ month: shiftMonth(month, -1) })}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        <MonthPicker
          key={month}
          month={month}
          onSelectAction={(nextMonth) => update({ month: nextMonth })}
        />
      </div>
      <Button
        variant="secondary"
        aria-label="Bulan berikutnya"
        className={navButtonClass}
        onClick={() => update({ month: shiftMonth(month, 1) })}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

type StudentSelectProps = {
  students: { id: string; name: string }[];
  value?: string;
  className?: string;
};

/** Pemilih siswa untuk Rekap Siswa — mengubah param `student`. */
export function StudentSelect({ students, value, className }: StudentSelectProps) {
  const { update, isPending } = useQueryNavigation();
  return (
    <div className={cn("min-w-0 flex-1", isPending && "opacity-70", className)} aria-busy={isPending || undefined}>
      <label htmlFor="pilih-siswa" className="mb-1.5 block text-sm font-medium text-ink">
        Siswa
      </label>
      <select
        id="pilih-siswa"
        value={value ?? ""}
        onChange={(event) => update({ student: event.target.value })}
        className="h-11 w-full rounded-md border border-line-strong bg-raised px-3 text-base text-ink transition-colors focus:border-accent-strong"
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>
    </div>
  );
}
