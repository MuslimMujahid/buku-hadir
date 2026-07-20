"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type IncompleteAttendanceDialogProps = {
  count: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function IncompleteAttendanceDialog({
  count,
  isPending,
  onClose,
  onConfirm,
}: IncompleteAttendanceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="simpan-sebagian-absensi"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-raised p-5 text-ink shadow-lift backdrop:bg-black/30"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 id="simpan-sebagian-absensi" className="font-display text-xl text-ink">
            Simpan sebagian absensi?
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {count} siswa belum ditandai. Status siswa yang sudah ditandai dapat disimpan sekarang.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="button" onClick={onConfirm} loading={isPending}>
            Simpan sebagian
          </Button>
        </div>
      </div>
    </dialog>
  );
}
