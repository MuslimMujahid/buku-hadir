import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

export function EmptyClassState() {
  return (
    <div className="rounded-lg border-2 border-dashed border-line-strong bg-raised px-6 py-12 text-center">
      <NotebookPen
        aria-hidden="true"
        className="mx-auto size-8 text-accent-strong"
      />
      <h2 className="mt-4 font-display text-xl font-semibold text-ink">
        Belum ada kelas
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
        Buat kelas pertama Anda, tambahkan siswa, lalu mulai catat kehadiran
        setiap hari.
      </p>
      <Link
        href="/classes/new"
        className={buttonClassName({ size: "lg", className: "mt-6" })}
      >
        Buat Kelas Pertama
      </Link>
    </div>
  );
}
