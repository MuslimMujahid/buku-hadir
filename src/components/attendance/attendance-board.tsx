"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { initialActionState } from "@/lib/validation";
import {
  ATTENDANCE_STATUSES,
  type AttendanceStatusValue,
} from "@/lib/attendance";
import { statusMeta } from "@/components/ui/stamp";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { RenameStudentDialog } from "./rename-student-dialog";
import { IncompleteAttendanceDialog } from "./incomplete-attendance-dialog";
import { RemoveStudentDialog } from "./remove-student-dialog";
import { StudentMenu } from "./student-menu";
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

function sortByName(students: StudentLite[]): StudentLite[] {
  return [...students].sort((a, b) =>
    a.name.localeCompare(b.name, "id", { sensitivity: "base" })
  );
}

function fromServer(
  students: StudentLite[],
  initial: Record<string, AttendanceStatusValue>
): Statuses {
  const next: Statuses = {};
  for (const student of students) next[student.id] = initial[student.id];
  return next;
}

function sameStatuses(
  a: Statuses,
  b: Statuses,
  students: StudentLite[]
): boolean {
  return students.every(
    (student) => (a[student.id] ?? null) === (b[student.id] ?? null)
  );
}

/**
 * Papan absensi satu tanggal: kontrol tersegmentasi empat status per siswa,
 * validasi payload, indikator kotor, dan bilah simpan lengket dengan umpan
 * balik status.
 */
export function AttendanceBoard({
  classId,
  date,
  students: unsortedStudents,
  initial,
}: AttendanceBoardProps) {
  const students = sortByName(unsortedStudents);
  const [statuses, setStatuses] = useState<Statuses>(() =>
    fromServer(students, initial)
  );
  const [baseline, setBaseline] = useState<Statuses>(() =>
    fromServer(students, initial)
  );
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [renameStudent, setRenameStudent] = useState<StudentLite | null>(null);
  const [removeStudent, setRemoveStudent] = useState<StudentLite | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    saveAttendanceAction,
    initialActionState
  );

  const formRef = useRef<HTMLFormElement>(null);
  const allowPartialSubmitRef = useRef(false);
  const partialSubmitStartedRef = useRef(false);
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
      for (const student of students)
        next[student.id] = prev[student.id] ?? initial[student.id];
      return next;
    });
    setBaseline(fromServer(students, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterKey, initial]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Setelah simpan sukses, posisi saat ini menjadi baseline baru. */
  useEffect(() => {
    if (state.status !== "success" && state.status !== "error") return;
    partialSubmitStartedRef.current = false;
    if (state.status !== "success") return;
    setBaseline(statusesRef.current);
    setIncompleteCount(0);
    setLocalError(null);
  }, [state]);

  const dirty = !sameStatuses(statuses, baseline, students);
  const answered = students.filter((student) => statuses[student.id]).length;
  const totals: Record<AttendanceStatusValue, number> = {
    HADIR: 0,
    SAKIT: 0,
    IZIN: 0,
    ALPA: 0,
  };
  for (const student of students) {
    const status = statuses[student.id];
    if (status) totals[status] += 1;
  }
  const payload = JSON.stringify(
    Object.fromEntries(
      students
        .filter((student) => statuses[student.id])
        .map((student) => [student.id, statuses[student.id]])
    )
  );

  function setStatus(studentId: string, status: AttendanceStatusValue) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setLocalError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (isPending) {
      event.preventDefault();
      return;
    }
    const missing = students.filter((student) => !statuses[student.id]);
    const allowingPartialSubmit = allowPartialSubmitRef.current;
    allowPartialSubmitRef.current = false;
    if (missing.length > 0 && !allowingPartialSubmit) {
      event.preventDefault();
      partialSubmitStartedRef.current = false;
      setIncompleteCount(missing.length);
      setLocalError(null);
    }
  }

  function confirmPartialSubmit() {
    if (isPending || partialSubmitStartedRef.current) return;
    partialSubmitStartedRef.current = true;
    allowPartialSubmitRef.current = true;
    setIncompleteCount(0);
    const form = formRef.current;
    if (!form) {
      allowPartialSubmitRef.current = false;
      partialSubmitStartedRef.current = false;
      return;
    }
    form.requestSubmit();
  }

  let feedback: { tone: "error" | "success" | "muted"; text: string } = {
    tone: "muted",
    text: "Tandai siswa, lalu simpan.",
  };
  if (localError) feedback = { tone: "error", text: localError };
  else if (state.status === "error" && state.message)
    feedback = { tone: "error", text: state.message };
  else if (dirty)
    feedback = { tone: "muted", text: "Ada perubahan yang belum disimpan." };
  else if (state.status === "success" && state.message)
    feedback = { tone: "success", text: state.message };

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        aria-label="Formulir absensi"
      >
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
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label="Ringkasan status hari ini"
          >
            {ATTENDANCE_STATUSES.map((status) => {
              const meta = statusMeta[status];
              return (
                <li
                  key={status}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold",
                    meta.fg,
                    meta.softBg
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
            return (
              <li
                key={student.id}
                className="rounded-md border border-line bg-raised p-3 shadow-card transition-colors"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs tabular-nums text-ink-faint"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    id={`nama-${student.id}`}
                    className="min-w-0 flex-1 break-words font-medium text-ink"
                  >
                    {student.name}
                  </span>
                  <div className="ml-auto flex items-center">
                    <StudentMenu
                      student={student}
                      onRenameAction={() => setRenameStudent(student)}
                      onRemoveAction={() => setRemoveStudent(student)}
                    />
                  </div>
                </div>
                <div
                  role="radiogroup"
                  aria-labelledby={`nama-${student.id}`}
                  className="grid grid-cols-4 gap-1 rounded-md bg-sunk p-1"
                >
                  {ATTENDANCE_STATUSES.map((status) => {
                    const meta = statusMeta[status];
                    const inputId = `status-${student.id}-${status}`;
                    return (
                      <label
                        key={status}
                        htmlFor={inputId}
                        className="block cursor-pointer"
                      >
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
                            SEGMENT_CHECKED[status]
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="font-mono text-sm font-bold leading-none"
                          >
                            {meta.letter}
                          </span>
                          <span className="mt-0.5 text-[0.6875rem] leading-tight">
                            {meta.word}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
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
                  className={cn(
                    "text-sm",
                    feedback.tone === "success" ? "text-hadir" : "text-ink-soft"
                  )}
                >
                  {feedback.text}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              loading={isPending}
              className="shrink-0"
            >
              Simpan absensi
            </Button>
          </div>
        </div>
      </form>
      {incompleteCount > 0 ? (
        <IncompleteAttendanceDialog
          count={incompleteCount}
          isPending={isPending}
          onClose={() => setIncompleteCount(0)}
          onConfirm={confirmPartialSubmit}
        />
      ) : null}
      {renameStudent ? (
        <RenameStudentDialog
          key={renameStudent.id}
          classId={classId}
          student={renameStudent}
          onClose={() => setRenameStudent(null)}
        />
      ) : null}
      {removeStudent ? (
        <RemoveStudentDialog
          key={removeStudent.id}
          classId={classId}
          student={removeStudent}
          onClose={() => setRemoveStudent(null)}
        />
      ) : null}
    </>
  );
}
