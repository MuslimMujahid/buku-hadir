import Link from "next/link";
import { cn } from "@/components/ui/cn";

/**
 * Buku Hadir wordmark — a coral "stamp" tile with an editorial serif wordmark.
 * Server-safe; wraps in Link when href is provided.
 */
export function BrandMark({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-sm border-2 border-accent-strong bg-accent-strong font-display text-lg font-bold text-white shadow-card"
      >
        BH
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        Buku Hadir
      </span>
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Buku Hadir — beranda">
      {mark}
    </Link>
  ) : (
    mark
  );
}
