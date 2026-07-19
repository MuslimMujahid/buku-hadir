import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateClassForm } from "@/components/dashboard/create-class-form";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kelas Baru",
};

export default function NewClassPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Kembali ke daftar kelas
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Kelas Baru</h1>
        <p className="mt-1 text-ink-soft">
          Beri nama kelas — Anda bisa menambahkan siswa setelah kelas dibuat.
        </p>
      </div>
      <Card>
        <CardBody>
          <CreateClassForm />
        </CardBody>
      </Card>
    </div>
  );
}
