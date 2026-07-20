import type { Attendance as AttendanceModel, AttendanceStatus, Class as ClassModel, Student as StudentModel } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  aggregateStatusTotals,
  emptyStatusTotals,
  getMonthBounds,
  isValidDate,
  type StatusTotals,
} from "@/lib/attendance";

export type OwnedClass = ClassModel & { _count: { students: number } };
export type OwnedClassWithStudents = ClassModel & { students: StudentModel[] };
export type StudentHistoryEntry = Pick<AttendanceModel, "id" | "date" | "status">;
export type StudentRecap = {
  student: StudentModel;
  month: string;
  totals: StatusTotals;
  history: StudentHistoryEntry[];
};
export type MonthlyStudentTotals = {
  studentId: string;
  name: string;
  totals: StatusTotals;
};
export type MonthlyRecap = {
  month: string;
  totals: StatusTotals;
  students: MonthlyStudentTotals[];
};
export type OwnedClassArgs = { classId: string };
export type AttendanceForDateArgs = { classId: string; date: string };
export type StudentRecapArgs = { classId: string; month: string; studentId: string };
export type MonthlyRecapArgs = { classId: string; month: string };

export type AttendanceDateStatus = { date: string; markedCount: number };
export type AttendanceDatesArgs = { classId: string };
export async function getOwnedClasses(): Promise<OwnedClass[]> {
  const user = await requireUser();
  return db.class.findMany({
    where: { ownerId: user.id },
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export function getOwnedClass(classId: string): Promise<OwnedClassWithStudents | null>;
export function getOwnedClass(args: OwnedClassArgs): Promise<OwnedClassWithStudents | null>;
export async function getOwnedClass(
  input: string | OwnedClassArgs,
): Promise<OwnedClassWithStudents | null> {
  const user = await requireUser();
  const classId = typeof input === "string" ? input : input.classId;
  if (typeof classId !== "string" || classId.trim().length === 0) return null;
  return db.class.findFirst({
    where: { id: classId, ownerId: user.id },
    include: { students: { orderBy: { createdAt: "asc" } } },
  });
}
export function getAttendanceForDate(
  classId: string,
  date: string,
): Promise<Record<string, AttendanceStatus>>;
export function getAttendanceForDate(
  args: AttendanceForDateArgs,
): Promise<Record<string, AttendanceStatus>>;
export async function getAttendanceForDate(
  input: string | AttendanceForDateArgs,
  date?: string,
): Promise<Record<string, AttendanceStatus>> {
  const user = await requireUser();
  const args = typeof input === "string" ? { classId: input, date: date ?? "" } : input;
  if (typeof args.classId !== "string" || args.classId.trim().length === 0 || !isValidDate(args.date)) return {};
  const parsedDate = new Date(`${args.date}T00:00:00.000Z`);
  const records = await db.attendance.findMany({
    where: {
      date: parsedDate,
      student: { class: { id: args.classId, ownerId: user.id } },
    },
    select: { studentId: true, status: true },
  });
  return Object.fromEntries(records.map((record) => [record.studentId, record.status]));
}

export function getStudentRecap(
  classId: string,
  month: string,
  studentId: string,
): Promise<StudentRecap | null>;
export function getStudentRecap(args: StudentRecapArgs): Promise<StudentRecap | null>;
export async function getStudentRecap(
  input: string | StudentRecapArgs,
  month?: string,
  studentId?: string,
): Promise<StudentRecap | null> {
  const user = await requireUser();
  const args = typeof input === "string"
    ? { classId: input, month: month ?? "", studentId: studentId ?? "" }
    : input;
  const bounds = getMonthBounds(args.month);
  if (
    typeof args.classId !== "string" || args.classId.trim().length === 0 ||
    typeof args.studentId !== "string" || args.studentId.trim().length === 0 ||
    !bounds
  ) return null;


  const student = await db.student.findFirst({
    where: { id: args.studentId, class: { id: args.classId, ownerId: user.id } },
    include: {
      attendance: {
        where: { date: { gte: bounds.start, lt: bounds.endExclusive } },
        orderBy: { date: "asc" },
      },
    },
  });
  if (!student) return null;
  const history = student.attendance.map(({ id, date, status }) => ({ id, date, status }));
  return {
    student,
    month: args.month,
    totals: aggregateStatusTotals(history),
    history,
  };
}
export function getMonthlyRecap(classId: string, month: string): Promise<MonthlyRecap>;
export function getMonthlyRecap(args: MonthlyRecapArgs): Promise<MonthlyRecap>;
export async function getMonthlyRecap(
  input: string | MonthlyRecapArgs,
  month?: string,
): Promise<MonthlyRecap> {
  const user = await requireUser();
  const args = typeof input === "string" ? { classId: input, month: month ?? "" } : input;
  const bounds = getMonthBounds(args.month);
  const empty: MonthlyRecap = { month: args.month, totals: emptyStatusTotals(), students: [] };
  if (typeof args.classId !== "string" || args.classId.trim().length === 0 || !bounds) return empty;

  const klass = await db.class.findFirst({
    where: { id: args.classId, ownerId: user.id },
    include: {
      students: {
        orderBy: { createdAt: "asc" },
        include: {
          attendance: {
            where: { date: { gte: bounds.start, lt: bounds.endExclusive } },
            orderBy: { date: "asc" },
          },
        },
      },
    },
  });
  if (!klass) return empty;

  const students = klass.students.map((student) => ({
    studentId: student.id,
    name: student.name,
    totals: aggregateStatusTotals(student.attendance),
  }));
  const allAttendance = klass.students.flatMap((student) => student.attendance);
  return { month: args.month, totals: aggregateStatusTotals(allAttendance), students };
}

export function getAttendanceDates(classId: string): Promise<AttendanceDateStatus[]>;
export function getAttendanceDates(args: AttendanceDatesArgs): Promise<AttendanceDateStatus[]>;
export async function getAttendanceDates(
  input: string | AttendanceDatesArgs,
): Promise<AttendanceDateStatus[]> {
  const user = await requireUser();
  const args = typeof input === "string" ? { classId: input } : input;
  if (typeof args.classId !== "string" || args.classId.trim().length === 0) return [];

  const records = await db.attendance.groupBy({
    by: ["date"],
    where: {
      student: { class: { id: args.classId, ownerId: user.id } },
    },
    _count: { studentId: true },
  });

  return records
    .map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      markedCount: r._count.studentId,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
