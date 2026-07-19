"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verificationCallbackUrl } from "@/components/auth/verification";

type ResendState = { kind: "idle" | "sent" | "error" };

export function ResendVerificationForm() {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ResendState>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setPending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: verificationCallbackUrl(),
      });
      setState(error ? { kind: "error" } : { kind: "sent" });
    } catch {
      setState({ kind: "error" });
    } finally {
      setPending(false);
    }
  }

  if (state.kind === "sent") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-md border border-hadir bg-hadir-soft px-3 py-3 text-sm text-ink"
      >
        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-hadir" />
        <span>
          Tautan verifikasi baru sudah dikirim. Periksa kotak masuk Anda — tautan lama
          tidak berlaku lagi.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@sekolah.id"
          />
        )}
      </Field>
      {state.kind === "error" ? (
        <p role="alert" className="text-sm text-alpa">
          Tautan tidak dapat dikirim. Periksa kembali email Anda, lalu coba lagi.
        </p>
      ) : null}
      <Button type="submit" variant="secondary" loading={pending} className="w-full">
        Kirim tautan verifikasi baru
      </Button>
    </form>
  );
}
