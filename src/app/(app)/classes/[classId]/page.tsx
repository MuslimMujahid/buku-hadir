import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarX2, UserRoundPlus, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/session";
import {
  getAttendanceDates,
  getAttendanceForDate,
  getMonthlyRecap,
  getOwnedClass,
  getStudentRecap,
} from "@/lib/data";
import { ATTENDANCE_STATUSES } from "@/lib/attendance";
import { buttonClassName } from "@/components/ui/button";
import { ClassTabs } from "@/components/attendance/class-tabs";
import { DateNav, MonthNav, StudentSelect } from "@/components/attendance/query-nav";
import { AddStudentForm } from "@/components/attendance/add-student-form";
import { AttendanceBoard } from "@/components/attendance/attendance-board";
import { StatCard } from "@/components/attendance/stat-card";
import { EmptyState } from "@/components/attendance/empty-state";
import { HistoryList } from "@/components/attendance/history-list";
import { MonthlyTable } from "@/components/attendance/monthly-table";
import { firstParam, parseDateParam, parseMonthParam, parseTabParam } from "@/components/attendance/params";
import { formatBulan, formatTanggalPanjang } from "@/components/attendance/format";

export const metadata: Metadata = { title: "Detail Kelas" };

type PageProps = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClassPage({ params, searchParams }: PageProps) {
  await requireUser();
  const [{ classId }, rawParams] = await Promise.all([params, searchParams]);

  /* Param tidak valid/asing → jatuh ke default yang aman. */
  const tab = parseTabParam(firstParam(rawParams.tab));
  const date = parseDateParam(firstParam(rawParams.date));
  const month = parseMonthParam(firstParam(rawParams.month));
  const studentParam = firstParam(rawParams.student);

  const kelas = await getOwnedClass(classId);
  if (!kelas) notFound();

  const students = kelas.students;
  const hasStudents = students.length > 0;
  const selectedStudentId = students.some((student) => student.id === studentParam)
    ? (studentParam as string)
    : students[0]?.id;

  /* Data per tab diambil terpisah supaya tab lain tidak membebani render. */
  const attendanceData =
    tab === "attendance"
      ? await Promise.all([getAttendanceForDate(classId, date), getAttendanceDates(classId)])
      : null;
  const attendance = attendanceData?.[0] ?? null;
  const attendanceStatuses = attendanceData?.[1] ?? [];
  const studentRecap =
    tab === "student" && selectedStudentId
      ? await getStudentRecap(classId, month, selectedStudentId)
      : null;
  const monthlyRecap = tab === "monthly" ? await getMonthlyRecap(classId, month) : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5 sm:px-6">
      <header>
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Semua kelas
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl leading-tight text-ink">{kelas.name}</h1>
          <p className="text-sm text-ink-soft">
            <span className="font-mono font-semibold tabular-nums text-ink">{students.length}</span>{" "}
            siswa terdaftar
          </p>
        </div>
      </header>

      <div className="mt-4">
        <ClassTabs
          classId={classId}
          active={tab}
          date={date}
          month={month}
          studentId={selectedStudentId}
        />
      </div>

      {tab === "attendance" ? (
        <section aria-labelledby="judul-absensi" className="mt-5 flex flex-col gap-4">
          <div>
            <h2 id="judul-absensi" className="font-display text-xl text-ink">
              Absensi
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">{formatTanggalPanjang(date)}</p>
          </div>
          <DateNav date={date} statuses={attendanceStatuses} totalStudents={students.length} />
          {hasStudents ? (
            <>
              <details className="group rounded-lg border border-line bg-raised">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <UserRoundPlus className="size-4 text-ink-soft" aria-hidden="true" />
                  Tambah siswa baru
                  <span aria-hidden="true" className="ml-auto font-mono text-ink-faint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-line px-4 py-4">
                  <AddStudentForm classId={classId} />
                </div>
              </details>
              <AttendanceBoard
                key={date}
                classId={classId}
                date={date}
                students={students}
                initial={attendance ?? {}}
              />
            </>
          ) : (
            <EmptyState
              icon={UsersRound}
              title="Belum ada siswa di kelas ini"
              description="Tambahkan siswa pertama lewat formulir di bawah, lalu tandai kehadiran mereka di sini setiap hari."
            >
              <div className="mx-auto max-w-sm text-left">
                <AddStudentForm classId={classId} />
              </div>
            </EmptyState>
          )}
        </section>
      ) : null}

      {tab === "student" ? (
        <section aria-labelledby="judul-rekap-siswa" className="mt-5 flex flex-col gap-4">
          <div>
            <h2 id="judul-rekap-siswa" className="font-display text-xl text-ink">
              Rekap Siswa
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Jumlah tiap status kehadiran seorang siswa dalam satu bulan.
            </p>
          </div>
          {hasStudents ? (
            <>
              <div className="flex flex-col gap-3">
                <StudentSelect students={students} value={selectedStudentId} />
                <MonthNav month={month} className="w-full" />
              </div>
              {studentRecap ? (
                <>
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-ink-soft">
                      {studentRecap.student.name} — {formatBulan(month)}
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {ATTENDANCE_STATUSES.map((status) => (
                        <StatCard key={status} status={status} value={studentRecap.totals[status]} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-ink-soft">Riwayat kehadiran</h3>
                    {studentRecap.history.length > 0 ? (
                      <HistoryList history={studentRecap.history} />
                    ) : (
                      <EmptyState
                        icon={CalendarX2}
                        title={`Belum ada catatan pada ${formatBulan(month)}`}
                        description={`${studentRecap.student.name} belum memiliki catatan kehadiran di bulan ini. Catat kehadiran lewat tab Absensi.`}
                      />
                    )}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={CalendarX2}
                  title="Rekap tidak tersedia"
                  description="Data rekap siswa ini tidak dapat dimuat. Coba pilih siswa lain atau muat ulang halaman."
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={UserRoundPlus}
              title="Belum ada siswa untuk direkap"
              description="Tambahkan siswa terlebih dahulu lewat tab Absensi, kemudian rekap per siswa akan tampil di sini."
            >
              <Link
                href={`/classes/${classId}?tab=attendance&date=${date}`}
                className={buttonClassName({ variant: "secondary" })}
              >
                Buka tab Absensi
              </Link>
            </EmptyState>
          )}
        </section>
      ) : null}

      {tab === "monthly" ? (
        <section aria-labelledby="judul-rekap-bulanan" className="mt-5 flex flex-col gap-4">
          <div>
            <h2 id="judul-rekap-bulanan" className="font-display text-xl text-ink">
              Rekap Bulanan
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Rekapitulasi seluruh siswa pada {formatBulan(month)}.
            </p>
          </div>
          <MonthNav month={month} />
          {hasStudents && monthlyRecap ? (
            <>
              <div>
                <h3 className="mb-2 text-sm font-medium text-ink-soft">Total seluruh kelas</h3>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {ATTENDANCE_STATUSES.map((status) => (
                    <StatCard key={status} status={status} value={monthlyRecap.totals[status]} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-ink-soft">Rincian per siswa</h3>
                <MonthlyTable rows={monthlyRecap.students} />
              </div>
            </>
          ) : (
            <EmptyState
              icon={UserRoundPlus}
              title="Belum ada siswa untuk direkap"
              description="Tambahkan siswa terlebih dahulu lewat tab Absensi, kemudian rekap bulanan akan tampil di sini."
            >
              <Link
                href={`/classes/${classId}?tab=attendance&date=${date}`}
                className={buttonClassName({ variant: "secondary" })}
              >
                Buka tab Absensi
              </Link>
            </EmptyState>
          )}
        </section>
      ) : null}
    </div>
  );
}
