"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, UserRoundPlus } from "lucide-react";
import { addStudentAction } from "@/app/actions/students";
import { initialActionState, parseNameCells } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BulkStudentForm } from "./bulk-student-form";
import { FormMessage } from "./form-message";

/** Form tambah siswa dengan deteksi tempel daftar untuk beralih ke mode bulk. */
export function AddStudentForm({ classId }: { classId: string }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkNames, setBulkNames] = useState<string[]>([]);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(addStudentAction, initialActionState);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    router.refresh();
  }, [state, router]);

  if (mode === "bulk") {
    return <BulkStudentForm classId={classId} initialNames={bulkNames} onExit={() => setMode("single")} />;
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="classId" value={classId} />
      <Field label="Nama siswa baru" errors={state.fieldErrors?.name}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="name"
            placeholder="mis. Siti Rahma"
            autoComplete="off"
            maxLength={120}
            required
            disabled={isPending}
            onPaste={(event) => {
              const text = event.clipboardData.getData("text");
              if (!text) return;
              if (/[\r\n\t]/.test(text)) {
                const parsed = parseNameCells(text);
                if (parsed.length >= 2) {
                  event.preventDefault();
                  setBulkNames(parsed);
                  setMode("bulk");
                }
              }
            }}
          />
        )}
      </Field>
      <p className="flex items-start gap-1.5 text-xs text-ink-soft">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium">Tambahkan sekaligus</span> dengan menyalin daftar nama dari excel/spreadsheet
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button type="submit" loading={isPending}>
          <UserRoundPlus className="size-4" aria-hidden="true" />
          Tambah siswa
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
