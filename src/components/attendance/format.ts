/**
 * Format tanggal & bulan berbahasa Indonesia. Semua pemformat dipaksa UTC
 * supaya string date-only tidak bergeser karena zona waktu server/browser.
 */

const LOCALE = "id-ID";
const ZONE = { timeZone: "UTC" } as const;

const tanggalPanjang = new Intl.DateTimeFormat(LOCALE, {
  ...ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const tanggalRiwayat = new Intl.DateTimeFormat(LOCALE, {
  ...ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const bulanPanjang = new Intl.DateTimeFormat(LOCALE, {
  ...ZONE,
  month: "long",
  year: "numeric",
});

/** "YYYY-MM-DD" → "Sabtu, 19 Juli 2026" (judul tanggal absensi). */
export function formatTanggalPanjang(dateStr: string): string {
  return tanggalPanjang.format(new Date(`${dateStr}T00:00:00Z`));
}

/** "YYYY-MM-DD" → "Sab, 19 Jul 2026" (baris riwayat kehadiran). */
export function formatTanggalRiwayat(dateStr: string): string {
  return tanggalRiwayat.format(new Date(`${dateStr}T00:00:00Z`));
}

/** "YYYY-MM" → "Juli 2026" (label bulan rekap). */
export function formatBulan(monthStr: string): string {
  return bulanPanjang.format(new Date(`${monthStr}-01T00:00:00Z`));
}
