import { Stamp } from "@/components/ui/stamp";
import { formatTanggalRiwayat } from "./format";
import { toDateString } from "./params";

type HistoryEntry = {
  id: string;
  date: string | Date;
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPA";
};

/** Riwayat kehadiran kronologis (tanggal terlama di atas) dalam baris bergaris. */
export function HistoryList({ history }: { history: HistoryEntry[] }) {
  const sorted = [...history].sort((a, b) => toDateString(a.date).localeCompare(toDateString(b.date)));
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-raised">
      {sorted.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <time dateTime={toDateString(entry.date)} className="font-mono text-sm text-ink">
            {formatTanggalRiwayat(toDateString(entry.date))}
          </time>
          <Stamp status={entry.status} size="sm" />
        </li>
      ))}
    </ol>
  );
}
