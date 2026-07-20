"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { renameStudentAction } from "@/app/actions/students";
import { initialActionState } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormMessage } from "./form-message";

type RenameStudentDialogProps = {
  classId: string;
  student: { id: string; name: string };
  onClose: () => void;
};

export function RenameStudentDialog({ classId, student, onClose }: RenameStudentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(renameStudentAction, initialActionState);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;
    router.refresh();
    onClose();
  }, [state, router, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="ubah-nama-siswa"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-raised p-5 text-ink shadow-lift backdrop:bg-black/30"
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <h2 id="ubah-nama-siswa" className="font-display text-xl text-ink">
            Ubah nama siswa
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Perbarui nama siswa yang tampil di kelas ini.</p>
        </div>
        <input type="hidden" name="classId" value={classId} />
        <input type="hidden" name="studentId" value={student.id} />
        <Field label="Nama siswa" errors={state.fieldErrors?.name}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              name="name"
              defaultValue={student.name}
              maxLength={120}
              autoComplete="off"
              required
              disabled={isPending}
              autoFocus
            />
          )}
        </Field>
        <FormMessage state={state} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" loading={isPending}>
            Simpan
          </Button>
        </div>
      </form>
    </dialog>
  );
}
