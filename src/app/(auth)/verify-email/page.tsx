import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, CircleCheck, Inbox } from "lucide-react";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verifikasi Email",
};

const errorMessages: Record<string, string> = {
  TOKEN_EXPIRED:
    "Tautan verifikasi sudah kedaluwarsa. Minta tautan baru melalui formulir di bawah ini.",
  INVALID_TOKEN:
    "Tautan verifikasi tidak valid. Minta tautan baru melalui formulir di bawah ini.",
  USER_NOT_FOUND: "Akun untuk tautan ini tidak ditemukan. Coba daftar ulang.",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = firstValue(params.error);
  const verified = firstValue(params.verified) === "1";

  return (
    <div className="flex flex-col gap-6">
      {errorCode ? (
        <>
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-semibold text-ink">
              <CircleAlert aria-hidden="true" className="size-7 shrink-0 text-alpa" />
              Verifikasi gagal
            </h1>
            <p className="mt-2 text-ink-soft">
              {errorMessages[errorCode] ??
                "Tautan verifikasi tidak dapat diproses. Minta tautan baru di bawah ini."}
            </p>
          </div>
          <Card>
            <CardBody>
              <ResendVerificationForm />
            </CardBody>
          </Card>
        </>
      ) : verified ? (
        <>
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-semibold text-ink">
              <CircleCheck aria-hidden="true" className="size-7 shrink-0 text-hadir" />
              Email terverifikasi
            </h1>
            <p className="mt-2 text-ink-soft">
              Alamat email Anda sudah dikonfirmasi. Sekarang Anda bisa masuk dan mulai
              mencatat kehadiran.
            </p>
          </div>
          <Link href="/sign-in" className={buttonClassName({ size: "lg" })}>
            Masuk ke Buku Hadir
          </Link>
        </>
      ) : (
        <>
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-semibold text-ink">
              <Inbox aria-hidden="true" className="size-7 shrink-0 text-izin" />
              Periksa kotak masuk Anda
            </h1>
            <p className="mt-2 text-ink-soft">
              Kami mengirim tautan verifikasi ke alamat email Anda. Buka tautan itu
              untuk mengaktifkan akun — tautan berlaku terbatas.
            </p>
          </div>
          <Card>
            <CardBody className="flex flex-col gap-4">
              <p className="text-sm text-ink-soft">
                Tidak menerima email? Periksa folder spam, atau kirim ulang tautannya:
              </p>
              <ResendVerificationForm />
            </CardBody>
          </Card>
        </>
      )}
      <p className="text-center text-sm text-ink-soft">
        <Link href="/sign-in" className="font-medium text-accent-strong underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
