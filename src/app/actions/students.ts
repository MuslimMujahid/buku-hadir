"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  classIdSchema,
  fieldErrorsFromZod,
  invalidAction,
  readFormString,
  studentNameSchema,
  successfulAction,
  type ActionState,
} from "@/lib/validation";


export async function addStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const classResult = classIdSchema.safeParse(readFormString(formData, "classId"));
  const nameResult = studentNameSchema.safeParse({ name: readFormString(formData, "name") });
  const fieldErrors: Record<string, string[]> = {};
  if (!classResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(classResult.error));
  if (!nameResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(nameResult.error));
  if (Object.keys(fieldErrors).length > 0 || !classResult.success || !nameResult.success) {
    return invalidAction("Periksa data siswa.", fieldErrors);
  }

  const classId = classResult.data;
  const studentName = nameResult.data.name;
  const ownedClass = await db.class.findFirst({
    where: { id: classId, ownerId: user.id },
    select: { id: true },
  });
  if (!ownedClass) return invalidAction("Kelas tidak ditemukan.");

  try {
    const student = await db.student.create({
      data: { class: { connect: { id: classId } }, name: studentName },
      select: { id: true },
    });
    revalidatePath(`/classes/${classId}`);
    return successfulAction("Siswa berhasil ditambahkan.", { studentId: student.id });
  } catch {
    return invalidAction("Siswa tidak dapat ditambahkan. Silakan coba lagi.");
  }
}
