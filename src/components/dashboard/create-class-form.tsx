"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { createClassAction } from "@/app/actions/classes";
import { initialActionState } from "@/lib/validation";
import { Button, buttonClassName } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CreateClassForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createClassAction,
    initialActionState,
  );

  useEffect(() => {
    const classId = state.data?.classId;
    if (state.status === "success" && classId) {
      router.push(`/classes/${classId}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Nama kelas"
        hint="Contoh: X IPA 1, XII RPL 2, atau 7A."
        errors={state.fieldErrors?.name}
      >
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Nama kelas"
          />
        )}
      </Field>

      {state.status === "error" && !state.fieldErrors && state.message ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-alpa">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/" className={buttonClassName({ variant: "secondary" })}>
          Batal
        </Link>
        <Button type="submit" loading={pending}>
          Buat Kelas
        </Button>
      </div>
    </form>
  );
}
