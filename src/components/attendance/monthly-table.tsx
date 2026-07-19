import { statusMeta } from "@/components/ui/stamp";
import { cn } from "@/components/ui/cn";
import { ATTENDANCE_STATUSES } from "@/lib/attendance";
import type { MonthlyStudentTotals } from "@/lib/data";
import { STATUS_BORDER } from "./status-styles";

/**
 * Tabel rekap bulanan per siswa. Angka nol tetap ditampilkan (redup)
 * supaya baris siswa tanpa catatan tidak tampak kosong/hilang.
 */
export function MonthlyTable({ rows }: { rows: MonthlyStudentTotals[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-raised">
      <table className="w-full min-w-[26rem] text-sm">
        <caption className="sr-only">
          Jumlah kehadiran tiap siswa per status pada bulan ini
        </caption>
        <thead>
          <tr className="border-b border-line bg-sunk">
            <th scope="col" className="px-4 py-2.5 text-left font-medium text-ink-soft">
              Siswa
            </th>
            {ATTENDANCE_STATUSES.map((status) => {
              const meta = statusMeta[status];
              return (
                <th key={status} scope="col" className="w-12 px-2 py-2.5 text-center font-medium">
                  <span
                    title={meta.word}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-sm border-2 font-mono text-xs font-bold",
                      meta.fg,
                      meta.softBg,
                      STATUS_BORDER[status],
                    )}
                  >
                    <span aria-hidden="true">{meta.letter}</span>
                    <span className="sr-only">{meta.word}</span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={row.studentId}>
              <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                <span aria-hidden="true" className="mr-2 font-mono text-xs font-normal text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {row.name}
              </th>
              {ATTENDANCE_STATUSES.map((status) => {
                const value = row.totals[status];
                return (
                  <td key={status} className="px-2 py-3 text-center font-mono tabular-nums">
                    {value === 0 ? (
                      <span className="text-ink-faint">0</span>
                    ) : (
                      <span className="font-semibold text-ink">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
