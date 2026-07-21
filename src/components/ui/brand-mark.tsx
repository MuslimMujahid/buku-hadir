import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";

/**
 * Buku Hadir wordmark with the supplied brand artwork.
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
      <Image
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className="size-10 rounded-sm"
      />
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
