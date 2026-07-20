import { z } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  data?: Record<string, string>;
};

export const initialActionState: ActionState = { status: "idle" };

export const classNameSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas wajib diisi.").max(120, "Nama kelas terlalu panjang."),
});

export const studentNameSchema = z.object({
  name: z.string().trim().min(1, "Nama siswa wajib diisi.").max(120, "Nama siswa terlalu panjang."),
});

export const classIdSchema = z.string().trim().min(1, "Kelas tidak valid.");

export const studentIdSchema = z.string().trim().min(1, "Siswa tidak valid.");

export function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, unknown>;
  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(flattened)) {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages.filter((message): message is string => typeof message === "string");
    }
  }
  return fieldErrors;
}

export function invalidAction(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionState {
  const result: ActionState = { status: "error", message };
  if (fieldErrors && Object.keys(fieldErrors).length > 0) result.fieldErrors = fieldErrors;
  return result;
}

export function successfulAction(
  message: string,
  data?: Record<string, string>,
): ActionState {
  const result: ActionState = { status: "success", message };
  if (data && Object.keys(data).length > 0) result.data = data;
  return result;
}
/** Memecah daftar nama dari salinan spreadsheet menjadi sel nama yang rapi. */
export function parseNameCells(input: string): string[] {
  return input
    .split(/(?:\r?\n|\t)+/)
    .map((token) => token.trim().replace(/[ \t]+/g, " "))
    .filter((token) => token.length > 0);
}

/** Memvalidasi daftar nama siswa untuk penambahan secara massal. */
export const bulkStudentNamesSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Nama siswa wajib diisi.")
      .max(120, "Nama siswa terlalu panjang."),
  )
  .min(1, "Tambahkan minimal satu nama.")
  .max(500, "Maksimal 500 nama sekaligus.");
