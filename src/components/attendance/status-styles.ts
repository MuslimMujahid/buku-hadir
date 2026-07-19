import type { AttendanceStatusValue } from "@/lib/attendance";

/**
 * Pemetaan status → kelas Tailwind. Semua literal ditulis penuh supaya
 * Tailwind v4 mendeteksinya saat compile (jangan dirakit dinamis).
 */

/** Border berwarna status, dipakai chip huruf & kartu statistik. */
export const STATUS_BORDER: Record<AttendanceStatusValue, string> = {
  HADIR: "border-hadir",
  SAKIT: "border-sakit",
  IZIN: "border-izin",
  ALPA: "border-alpa",
};

/**
 * Gaya segmen terpilih pada kontrol radio absensi (dipasang lewat
 * `peer-checked:` pada span visual di sebelah input sr-only).
 */
export const SEGMENT_CHECKED: Record<AttendanceStatusValue, string> = {
  HADIR: "peer-checked:border-hadir peer-checked:bg-hadir-soft peer-checked:text-hadir",
  SAKIT: "peer-checked:border-sakit peer-checked:bg-sakit-soft peer-checked:text-sakit",
  IZIN: "peer-checked:border-izin peer-checked:bg-izin-soft peer-checked:text-izin",
  ALPA: "peer-checked:border-alpa peer-checked:bg-alpa-soft peer-checked:text-alpa",
};
