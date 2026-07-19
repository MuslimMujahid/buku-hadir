import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OwnedClass } from "@/lib/data";

export function ClassCard({
  kelas,
  index,
}: {
  kelas: OwnedClass;
  index: number;
}) {
  const studentCount = kelas._count.students;
  return (
    <li>
      <Link
        href={`/classes/${kelas.id}`}
        className="group flex items-center gap-4 rounded-lg border border-line bg-raised px-4 py-4 shadow-card transition hover:border-line-strong hover:shadow-lift sm:px-5"
      >
        <span
          aria-hidden="true"
          className="font-mono text-sm font-medium text-ink-faint"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg font-semibold text-ink">
            {kelas.name}
          </span>
          <span className="mt-0.5 block text-sm text-ink-soft">
            {studentCount === 0
              ? "Belum ada siswa"
              : `${studentCount} siswa`}
          </span>
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-strong"
        />
      </Link>
    </li>
  );
}
