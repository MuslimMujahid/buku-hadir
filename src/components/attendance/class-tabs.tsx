import Link from "next/link";
import { CalendarCheck2, CalendarDays, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";
import type { ClassTab } from "./params";

type ClassTabsProps = {
  classId: string;
  active: ClassTab;
  /** Tanggal terpilih saat ini — dibawa saat pindah ke tab Absensi. */
  date: string;
  /** Bulan terpilih saat ini — dibawa saat pindah ke tab rekap. */
  month: string;
  /** Siswa terpilih saat ini — dipertahankan di tab Rekap Siswa bila ada. */
  studentId?: string;
};

const TAB_META: readonly { key: ClassTab; label: string; icon: LucideIcon }[] = [
  { key: "attendance", label: "Absensi", icon: CalendarCheck2 },
  { key: "student", label: "Rekap Siswa", icon: UserRound },
  { key: "monthly", label: "Rekap Bulanan", icon: CalendarDays },
];

/** Navigasi antar-tab halaman kelas sebagai tautan (param query ikut terbawa). */
export function ClassTabs({ classId, active, date, month, studentId }: ClassTabsProps) {
  const hrefFor = (tab: ClassTab): string => {
    const base = `/classes/${classId}`;
    if (tab === "attendance") return `${base}?tab=attendance&date=${date}`;
    if (tab === "student") {
      const studentQuery = studentId ? `&student=${encodeURIComponent(studentId)}` : "";
      return `${base}?tab=student&month=${month}${studentQuery}`;
    }
    return `${base}?tab=monthly&month=${month}`;
  };

  return (
    <nav aria-label="Navigasi halaman kelas">
      <ul className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-sunk p-1">
        {TAB_META.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <li key={key}>
              <Link
                href={hrefFor(key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1.5 text-center transition-colors sm:flex-row sm:gap-2",
                  isActive
                    ? "border border-line bg-raised font-medium text-ink shadow-card"
                    : "text-ink-soft hover:bg-raised/70 hover:text-ink",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-xs leading-tight sm:text-sm">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
