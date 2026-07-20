"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { removeStudentAction } from "@/app/actions/students";
import { initialActionState } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { FormMessage } from "./form-message";

type RemoveStudentDialogProps = {
  classId: string;
  student: { id: string; name: string };
  onClose: () => void;
};

export function RemoveStudentDialog({ classId, student, onClose }: RemoveStudentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(removeStudentAction, initialActionState);

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
      aria-labelledby="hapus-siswa"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-raised p-5 text-ink shadow-lift backdrop:bg-black/30"
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <h2 id="hapus-siswa" className="font-display text-xl text-ink">
            Hapus siswa
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Siswa <span className="font-medium text-ink">{student.name}</span> akan dihapus beserta seluruh catatan
            kehadirannya. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <input type="hidden" name="classId" value={classId} />
        <input type="hidden" name="studentId" value={student.id} />
        <FormMessage state={state} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" loading={isPending} className="bg-alpa text-white hover:bg-alpa/90 active:bg-alpa">
            Hapus
          </Button>
        </div>
      </form>
    </dialog>
  );
}
