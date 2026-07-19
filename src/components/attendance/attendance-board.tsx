"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { initialActionState } from "@/lib/validation";
import { ATTENDANCE_STATUSES, type AttendanceStatusValue } from "@/lib/attendance";
import { statusMeta } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { SEGMENT_CHECKED } from "./status-styles";

type StudentLite = { id: string; name: string };
type Statuses = Record<string, AttendanceStatusValue | undefined>;

type AttendanceBoardProps = {
  classId: string;
  /** Tanggal aktif "YYYY-MM-DD" — halaman memasang key={date} sehingga papan ter-reset per tanggal. */
  date: string;
  students: StudentLite[];
  /** Status tersimpan dari server: studentId → status (siswa tanpa catatan tidak ada di sini). */
  initial: Record<string, AttendanceStatusValue>;
};

function fromServer(students: StudentLite[], initial: Record<string, AttendanceStatusValue>): Statuses {
  const next: Statuses = {};
  for (const student of students) next[student.id] = initial[student.id];
  return next;
}

function sameStatuses(a: Statuses, b: Statuses, students: StudentLite[]): boolean {
  return students.every((student) => (a[student.id] ?? null) === (b[student.id] ?? null));
}

/**
 * Papan absensi satu tanggal: kontrol tersegmentasi empat status per siswa,
 * validasi daftar penuh sebelum submit, indikator kotor, dan bilah simpan
 * lengket dengan umpan balik status.
 */
export function AttendanceBoard({ classId, date, students, initial }: AttendanceBoardProps) {
  const [statuses, setStatuses] = useState<Statuses>(() => fromServer(students, initial));
  const [baseline, setBaseline] = useState<Statuses>(() => fromServer(students, initial));
  const [missingIds, setMissingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(saveAttendanceAction, initialActionState);

  /* Ref agar efek sukses membaca status terbaru (disinkron lewat efek, bukan saat render). */
  const statusesRef = useRef(statuses);
  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  /* Sinkron saat roster berubah (siswa ditambah/dihapus) atau data server
   * termuat ulang: pilihan pengguna yang belum disimpan tetap dipertahankan,
   * siswa baru mengambil nilai server. */
  const rosterKey = students.map((student) => student.id).join("\n");
  /* Roster changes require replacing local form state with server truth. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setStatuses((prev) => {
      const next: Statuses = {};
      for (const student of students) next[student.id] = prev[student.id] ?? initial[student.id];
      return next;
    });
    setBaseline(fromServer(students, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterKey, initial]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Setelah simpan sukses, posisi saat ini menjadi baseline baru. */
  useEffect(() => {
    if (state.status !== "success") return;
    setBaseline(statusesRef.current);
    setMissingIds(new Set());
    setLocalError(null);
  }, [state]);

  const dirty = !sameStatuses(statuses, baseline, students);
  const answered = students.filter((student) => statuses[student.id]).length;
  const totals: Record<AttendanceStatusValue, number> = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
  for (const student of students) {
    const status = statuses[student.id];
    if (status) totals[status] += 1;
  }
  const payload = JSON.stringify(
    Object.fromEntries(
      students.filter((student) => statuses[student.id]).map((student) => [student.id, statuses[student.id]]),
    ),
  );

  function setStatus(studentId: string, status: AttendanceStatusValue) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setMissingIds((prev) => {
      if (!prev.has(studentId)) return prev;
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
    setLocalError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const missing = students.filter((student) => !statuses[student.id]);
    if (missing.length > 0) {
      event.preventDefault();
      setMissingIds(new Set(missing.map((student) => student.id)));
      setLocalError(`Lengkapi status kehadiran untuk ${missing.length} siswa yang ditandai.`);
      document.getElementById(`status-${missing[0].id}-HADIR`)?.focus();
      return;
    }
    setMissingIds(new Set());
    setLocalError(null);
  }

  let feedback: { tone: "error" | "success" | "muted"; text: string } = {
    tone: "muted",
    text: "Tandai setiap siswa, lalu simpan.",
  };
  if (localError) feedback = { tone: "error", text: localError };
  else if (state.status === "error" && state.message) feedback = { tone: "error", text: state.message };
  else if (dirty) feedback = { tone: "muted", text: "Ada perubahan yang belum disimpan." };
  else if (state.status === "success" && state.message) feedback = { tone: "success", text: state.message };

  return (
    <form action={formAction} onSubmit={handleSubmit} aria-label="Formulir absensi">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="statuses" value={payload} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          <span className="font-mono font-semibold tabular-nums text-ink">
            {answered}/{students.length}
          </span>{" "}
          siswa sudah ditandai
        </p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Ringkasan status hari ini">
          {ATTENDANCE_STATUSES.map((status) => {
            const meta = statusMeta[status];
            return (
              <li
                key={status}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold",
                  meta.fg,
                  meta.softBg,
                )}
              >
                <span aria-hidden="true">{meta.letter}</span>
                <span className="tabular-nums">{totals[status]}</span>
                <span className="sr-only">{meta.word}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <ol className="mt-3 flex flex-col gap-2.5">
        {students.map((student, index) => {
          const isMissing = missingIds.has(student.id);
          return (
            <li
              key={student.id}
              className={cn(
                "rounded-md border bg-raised p-3 shadow-card transition-colors",
                isMissing ? "border-alpa" : "border-line",
              )}
            >
              <div className="mb-2 flex items-baseline gap-2">
                <span aria-hidden="true" className="font-mono text-xs tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span id={`nama-${student.id}`} className="min-w-0 break-words font-medium text-ink">
                  {student.name}
                </span>
                {isMissing ? (
                  <span className="ml-auto shrink-0 text-xs font-medium text-alpa">Wajib dipilih</span>
                ) : null}
              </div>
              <div
                role="radiogroup"
                aria-labelledby={`nama-${student.id}`}
                aria-describedby={isMissing ? `wajib-${student.id}` : undefined}
                className="grid grid-cols-4 gap-1 rounded-md bg-sunk p-1"
              >
                {ATTENDANCE_STATUSES.map((status) => {
                  const meta = statusMeta[status];
                  const inputId = `status-${student.id}-${status}`;
                  return (
                    <label key={status} htmlFor={inputId} className="block cursor-pointer">
                      <input
                        id={inputId}
                        type="radio"
                        name={`kehadiran-${student.id}`}
                        value={status}
                        checked={statuses[student.id] === status}
                        onChange={() => setStatus(student.id, status)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex min-h-11 flex-col items-center justify-center rounded-sm border border-transparent px-1 py-1 text-center text-ink-soft transition-colors",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-accent-strong",
                          SEGMENT_CHECKED[status],
                        )}
                      >
                        <span aria-hidden="true" className="font-mono text-sm font-bold leading-none">
                          {meta.letter}
                        </span>
                        <span className="mt-0.5 text-[0.6875rem] leading-tight">{meta.word}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {isMissing ? (
                <p id={`wajib-${student.id}`} className="mt-1.5 text-xs text-alpa">
                  Pilih salah satu status untuk {student.name}.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-3 z-10 mt-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raised/95 p-3 shadow-lift backdrop-blur-sm">
          <div className="min-w-0">
            {feedback.tone === "error" ? (
              <p role="alert" className="text-sm text-alpa">
                {feedback.text}
              </p>
            ) : (
              <p
                aria-live="polite"
                className={cn("text-sm", feedback.tone === "success" ? "text-hadir" : "text-ink-soft")}
              >
                {feedback.text}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" loading={isPending} className="shrink-0">
            Simpan absensi
          </Button>
        </div>
      </div>
    </form>
  );
}
