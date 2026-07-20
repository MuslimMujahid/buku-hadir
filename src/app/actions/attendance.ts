"use server";

import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isAttendanceStatus, parseUtcDate } from "@/lib/attendance";
import {
  classIdSchema,
  invalidAction,
  readFormString,
  successfulAction,
  type ActionState,
} from "@/lib/validation";


type SubmittedStatus = { studentId: string; status: string };
const submittedEntrySchema = z.object({ studentId: z.string(), status: z.string() });
const submittedPayloadSchema = z.union([
  z.array(submittedEntrySchema),
  z.record(z.string(), z.string()),
]);

function readSubmittedStatuses(formData: FormData): { entries: SubmittedStatus[]; malformed: boolean } {
  const entries: SubmittedStatus[] = [];
  let malformed = false;
  const encoded = formData.get("statuses");
  if (encoded !== null) {
    if (typeof encoded !== "string") {
      malformed = true;
    } else {
      try {
        const parsed = submittedPayloadSchema.safeParse(JSON.parse(encoded));
        if (!parsed.success) {
          malformed = true;
        } else if (Array.isArray(parsed.data)) {
          entries.push(...parsed.data);
        } else {
          for (const [studentId, status] of Object.entries(parsed.data)) {
            entries.push({ studentId, status });
          }
        }
      } catch {
        malformed = true;
      }
    }
  }

  for (const [key, value] of formData.entries()) {
    const match = /^(?:status[-_])(.+)$/.exec(key);
    if (!match) continue;
    if (typeof value !== "string") {
      malformed = true;
      continue;
    }
    entries.push({ studentId: match[1], status: value });
  }
  return { entries, malformed };
}

export async function saveAttendanceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const classResult = classIdSchema.safeParse(readFormString(formData, "classId"));
  const date = readFormString(formData, "date");
  const parsedDate = parseUtcDate(date);
  if (!classResult.success) return invalidAction("Kelas tidak valid.");
  if (!parsedDate) return invalidAction("Tanggal tidak valid.", { date: ["Gunakan format YYYY-MM-DD."] });

  const submitted = readSubmittedStatuses(formData);
  if (submitted.malformed) return invalidAction("Data kehadiran tidak valid.");

  const classId = classResult.data;
  const ownedClass = await db.class.findFirst({
    where: { id: classId, ownerId: user.id },
    select: { id: true, students: { select: { id: true } } },
  });
  if (!ownedClass) return invalidAction("Kelas tidak ditemukan.");

  const expectedIds = new Set(ownedClass.students.map((student) => student.id));
  const statuses = new Map<string, AttendanceStatus>();
  for (const entry of submitted.entries) {
    if (!expectedIds.has(entry.studentId)) return invalidAction("Data kehadiran tidak valid.");
    if (statuses.has(entry.studentId)) return invalidAction("Setiap siswa harus memiliki satu status.");
    if (!isAttendanceStatus(entry.status)) return invalidAction("Status kehadiran tidak valid.");
    statuses.set(entry.studentId, entry.status);
  }

  try {
    await db.$transaction(async (transaction) => {
      for (const [studentId, status] of statuses) {
        await transaction.attendance.upsert({
          where: { studentId_date: { studentId, date: parsedDate } },
          create: { studentId, date: parsedDate, status },
          update: { status },
        });
      }
    });
    revalidatePath(`/classes/${classId}`);
    return successfulAction("Kehadiran berhasil disimpan.");
  } catch {
    return invalidAction("Kehadiran tidak dapat disimpan. Silakan coba lagi.");
  }
}
