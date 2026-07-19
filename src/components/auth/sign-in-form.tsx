"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verificationCallbackUrl } from "@/components/auth/verification";

type SignInError =
  | { kind: "credentials" | "general"; message: string }
  | { kind: "unverified" }
  | null;

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SignInError>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResent(false);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setPending(true);
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (!signInError) {
        router.push("/");
        router.refresh();
        return;
      }
      if (signInError.code === "EMAIL_NOT_VERIFIED") {
        setError({ kind: "unverified" });
      } else if (signInError.code === "INVALID_EMAIL_OR_PASSWORD") {
        setError({ kind: "credentials", message: "Email atau kata sandi salah." });
      } else {
        setError({ kind: "general", message: "Tidak dapat masuk. Silakan coba lagi." });
      }
    } catch {
      setError({ kind: "general", message: "Koneksi bermasalah. Silakan coba lagi." });
    } finally {
      setPending(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: verificationCallbackUrl(),
      });
      if (!resendError) setResent(true);
    } finally {
      setResending(false);
    }
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@sekolah.id"
          />
        )}
      </Field>
      <Field label="Kata sandi">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Kata sandi Anda"
          />
        )}
      </Field>

      {error?.kind === "unverified" ? (
        <div
          role="alert"
          className="rounded-md border border-sakit bg-sakit-soft px-3 py-3 text-sm text-ink"
        >
          <p className="flex items-start gap-2">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sakit" />
            <span>
              Email ini belum terverifikasi. Buka tautan yang kami kirim ke kotak masuk
              Anda, atau kirim ulang tautannya.
            </span>
          </p>
          <div className="mt-3">
            {resent ? (
              <p className="font-medium text-hadir">Tautan baru sudah dikirim.</p>
            ) : (
              <Button
                variant="secondary"
                onClick={handleResend}
                loading={resending}
              >
                Kirim ulang tautan verifikasi
              </Button>
            )}
          </div>
        </div>
      ) : error ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-alpa">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error.message}</span>
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Masuk
      </Button>
    </form>
  );
}
