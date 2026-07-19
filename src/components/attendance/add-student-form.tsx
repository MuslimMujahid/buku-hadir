"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserRoundPlus } from "lucide-react";
import { addStudentAction } from "@/app/actions/students";
import { initialActionState } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormMessage } from "./form-message";

/** Form tambah siswa — aksi nyata addStudentAction, reset otomatis saat sukses. */
export function AddStudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(addStudentAction, initialActionState);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    router.refresh();
  }, [state, router]);

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
          />
        )}
      </Field>
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
