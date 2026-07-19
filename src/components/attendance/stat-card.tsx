import { Card } from "@/components/ui/card";
import { statusMeta } from "@/components/ui/stamp";
import { cn } from "@/components/ui/cn";
import type { AttendanceStatusValue } from "@/lib/attendance";
import { STATUS_BORDER } from "./status-styles";

type StatCardProps = {
  status: AttendanceStatusValue;
  value: number;
  className?: string;
};

/** Kartu statistik satu status: stempel huruf + angka + kata (bukan warna saja). */
export function StatCard({ status, value, className }: StatCardProps) {
  const meta = statusMeta[status];
  return (
    <Card className={cn("flex items-center gap-3 p-3.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 font-mono text-base font-bold",
          meta.fg,
          meta.softBg,
          STATUS_BORDER[status],
        )}
      >
        {meta.letter}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xl font-bold leading-none tabular-nums text-ink">{value}</p>
        <p className="mt-1 text-sm text-ink-soft">{meta.word}</p>
      </div>
    </Card>
  );
}
