"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verificationCallbackUrl } from "@/components/auth/verification";

type SignUpError = { message: string; showSignInLink?: boolean } | null;

export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SignUpError>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setPending(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: verificationCallbackUrl(),
      });
      if (!signUpError) {
        router.push("/verify-email?sent=1");
        return;
      }
      if (
        signUpError.code === "USER_ALREADY_EXISTS" ||
        signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        setError({ message: "Email ini sudah terdaftar.", showSignInLink: true });
      } else if (signUpError.code === "PASSWORD_TOO_SHORT") {
        setError({ message: "Kata sandi terlalu pendek. Gunakan minimal 8 karakter." });
      } else {
        setError({ message: "Pendaftaran gagal. Silakan coba lagi." });
      }
    } catch {
      setError({ message: "Koneksi bermasalah. Silakan coba lagi." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nama lengkap">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Nama Anda"
          />
        )}
      </Field>
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
      <Field label="Kata sandi" hint="Minimal 8 karakter.">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Buat kata sandi"
          />
        )}
      </Field>

      {error ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-alpa">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {error.message}{" "}
            {error.showSignInLink ? (
              <Link href="/sign-in" className="font-medium text-accent-strong underline">
                Masuk di sini
              </Link>
            ) : null}
          </span>
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Daftar
      </Button>
    </form>
  );
}
