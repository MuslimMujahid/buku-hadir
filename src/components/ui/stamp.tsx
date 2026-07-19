import type { AttendanceStatus } from "@prisma/client";
import { cn } from "@/components/ui/cn";

type StatusMeta = {
  /** Single-letter mark — always paired with the word so color is never the only signal. */
  letter: string;
  /** Indonesian word shown next to the letter. */
  word: string;
  /** Foreground token, e.g. text-hadir / border-hadir. */
  fg: string;
  /** Soft wash background token, e.g. bg-hadir-soft. */
  softBg: string;
};

export const statusMeta: Record<AttendanceStatus, StatusMeta> = {
  HADIR: { letter: "H", word: "Hadir", fg: "text-hadir", softBg: "bg-hadir-soft" },
  SAKIT: { letter: "S", word: "Sakit", fg: "text-sakit", softBg: "bg-sakit-soft" },
  IZIN: { letter: "I", word: "Izin", fg: "text-izin", softBg: "bg-izin-soft" },
  ALPA: { letter: "A", word: "Alpa", fg: "text-alpa", softBg: "bg-alpa-soft" },
};

const borders: Record<AttendanceStatus, string> = {
  HADIR: "border-hadir",
  SAKIT: "border-sakit",
  IZIN: "border-izin",
  ALPA: "border-alpa",
};

type StampProps = {
  status: AttendanceStatus;
  /** sm = inline table mark, md = default badge. */
  size?: "sm" | "md";
  className?: string;
};

/** Teacher-stamp status badge: letter + word, status-colored ink on soft wash. */
export function Stamp({ status, size = "md", className }: StampProps) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border-2 font-mono font-semibold uppercase tracking-wider",
        meta.fg,
        meta.softBg,
        borders[status],
        size === "sm" ? "px-1.5 py-0.5 text-[0.6875rem]" : "px-2 py-1 text-xs",
        className,
      )}
    >
      <span aria-hidden="true">{meta.letter}</span>
      <span>{meta.word}</span>
    </span>
  );
}
