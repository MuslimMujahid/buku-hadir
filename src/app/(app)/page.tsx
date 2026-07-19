import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getOwnedClasses } from "@/lib/data";
import { ClassCard } from "@/components/dashboard/class-card";
import { EmptyClassState } from "@/components/dashboard/empty-class-state";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kelas Anda",
};

export default async function DashboardPage() {
  const classes = await getOwnedClasses();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Kelas Anda
          </h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            {classes.length === 0
              ? "Belum ada catatan"
              : `${classes.length} kelas tercatat`}
          </p>
        </div>
        {classes.length > 0 ? (
          <Link href="/classes/new" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            Kelas Baru
          </Link>
        ) : null}
      </div>

      {classes.length === 0 ? (
        <EmptyClassState />
      ) : (
        <ul className="flex flex-col gap-3">
          {classes.map((kelas, index) => (
            <ClassCard key={kelas.id} kelas={kelas} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
