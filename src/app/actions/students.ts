"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  bulkStudentNamesSchema,
  classIdSchema,
  fieldErrorsFromZod,
  invalidAction,
  parseNameCells,
  readFormString,
  studentIdSchema,
  studentNameSchema,
  successfulAction,
  type ActionState,
} from "@/lib/validation";


export async function renameStudentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const classResult = classIdSchema.safeParse(readFormString(formData, "classId"));
  const studentIdResult = studentIdSchema.safeParse(readFormString(formData, "studentId"));
  const nameResult = studentNameSchema.safeParse({ name: readFormString(formData, "name") });
  const fieldErrors: Record<string, string[]> = {};
  if (!classResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(classResult.error));
  if (!studentIdResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(studentIdResult.error));
  if (!nameResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(nameResult.error));
  if (Object.keys(fieldErrors).length > 0 || !classResult.success || !studentIdResult.success || !nameResult.success) {
    return invalidAction("Periksa data siswa.", fieldErrors);
  }

  const student = await db.student.findFirst({
    where: { id: studentIdResult.data, class: { id: classResult.data, ownerId: user.id } },
    select: { id: true },
  });
  if (!student) return invalidAction("Siswa tidak ditemukan.");

  try {
    await db.student.update({ where: { id: student.id }, data: { name: nameResult.data.name } });
    revalidatePath(`/classes/${classResult.data}`);
    return successfulAction("Nama siswa diperbarui.");
  } catch {
    return invalidAction("Nama siswa tidak dapat diperbarui. Silakan coba lagi.");
  }
}

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

/** Tambah banyak siswa sekaligus dari daftar nama (hasil salin dari spreadsheet). */
export async function bulkAddStudentsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const classResult = classIdSchema.safeParse(readFormString(formData, "classId"));
  const namesInput = parseNameCells(readFormString(formData, "names"));
  const namesResult = bulkStudentNamesSchema.safeParse(namesInput);
  const fieldErrors: Record<string, string[]> = {};

  if (!classResult.success) Object.assign(fieldErrors, fieldErrorsFromZod(classResult.error));
  if (!namesResult.success) {
    const namesErrors = fieldErrorsFromZod(namesResult.error);
    const firstNamesMessage =
      Object.values(namesErrors).flat()[0] ?? namesResult.error.issues[0]?.message;
    if (firstNamesMessage) fieldErrors.names = [firstNamesMessage];
  }
  if (!classResult.success || !namesResult.success) {
    return invalidAction("Periksa daftar nama.", fieldErrors);
  }

  const ownedClass = await db.class.findFirst({
    where: { id: classResult.data, ownerId: user.id },
    select: { id: true },
  });
  if (!ownedClass) return invalidAction("Kelas tidak ditemukan.");

  try {
    await db.student.createMany({
      data: namesResult.data.map((name) => ({ classId: classResult.data, name })),
    });
    revalidatePath(`/classes/${classResult.data}`);
    return successfulAction(`${namesResult.data.length} siswa berhasil ditambahkan.`);
  } catch {
    return invalidAction("Siswa tidak dapat ditambahkan. Silakan coba lagi.");
  }
}
