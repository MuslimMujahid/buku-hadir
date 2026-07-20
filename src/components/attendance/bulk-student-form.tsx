"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRoundPlus, X } from "lucide-react";
import { bulkAddStudentsAction } from "@/app/actions/students";
import { initialActionState } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "./form-message";

type BulkStudentFormProps = {
  classId: string;
  initialNames: string[];
  onExit: () => void;
};

/** Form untuk meninjau dan menambahkan beberapa siswa sekaligus. */
export function BulkStudentForm({ classId, initialNames, onExit }: BulkStudentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [names, setNames] = useState<string[]>(initialNames);
  const [state, formAction, isPending] = useActionState(bulkAddStudentsAction, initialActionState);

  useEffect(() => {
    if (state.status !== "success") return;
    queueMicrotask(() => {
      setNames([]);
      formRef.current?.reset();
      router.refresh();
      onExit();
    });
  }, [state, router, onExit]);
  function updateRow(index: number, value: string) {
    setNames((currentNames) => currentNames.map((name, currentIndex) => (currentIndex === index ? value : name)));
  }

  function removeRow(index: number) {
    setNames((currentNames) => currentNames.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="names" value={names.join("\n")} />

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Tambah banyak siswa</h3>
        <span className="rounded-full bg-sunk px-2.5 py-1 text-xs font-medium text-ink-soft">
          {names.length} nama
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {names.length > 0 ? (
          names.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(event) => updateRow(index, event.target.value)}
                aria-label={`Nama siswa ${index + 1}`}
                autoComplete="off"
                maxLength={120}
                disabled={isPending}
              />
              <Button
                variant="ghost"
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Hapus nama ke-${index + 1}`}
                disabled={isPending}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Daftar masih kosong — tempel nama dari spreadsheet di atas.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button type="button" variant="secondary" onClick={() => { setNames([]); onExit(); }} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" loading={isPending} disabled={names.length === 0 || isPending}>
          <UserRoundPlus className="size-4" aria-hidden="true" />
          Tambah semua
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
