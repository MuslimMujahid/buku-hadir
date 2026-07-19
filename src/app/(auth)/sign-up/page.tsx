import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Mulai buku kehadiran Anda
        </h1>
        <p className="mt-2 text-ink-soft">
          Satu akun untuk semua kelas yang Anda ampu.
        </p>
      </div>
      <Card>
        <CardBody>
          <SignUpForm />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-ink-soft">
        Sudah punya akun?{" "}
        <Link href="/sign-in" className="font-medium text-accent-strong underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
