"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  classNameSchema,
  fieldErrorsFromZod,
  invalidAction,
  readFormString,
  successfulAction,
  type ActionState,
} from "@/lib/validation";


export async function createClassAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = classNameSchema.safeParse({ name: readFormString(formData, "name") });
  if (!parsed.success) return invalidAction("Periksa nama kelas.", fieldErrorsFromZod(parsed.error));

  try {
    const klass = await db.class.create({
      data: { name: parsed.data.name, ownerId: user.id },
      select: { id: true },
    });
    revalidatePath("/");
    return successfulAction("Kelas berhasil dibuat.", { classId: klass.id });
  } catch {
    return invalidAction("Kelas tidak dapat dibuat. Silakan coba lagi.");
  }
}
