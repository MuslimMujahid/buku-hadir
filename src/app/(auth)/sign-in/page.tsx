import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Selamat datang kembali
        </h1>
        <p className="mt-2 text-ink-soft">
          Masuk untuk melanjutkan catatan kehadiran Anda.
        </p>
      </div>
      <Card>
        <CardBody>
          <SignInForm />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-ink-soft">
        Baru di Buku Hadir?{" "}
        <Link href="/sign-up" className="font-medium text-accent-strong underline">
          Buat akun
        </Link>
      </p>
    </div>
  );
}
