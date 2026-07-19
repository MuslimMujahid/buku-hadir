import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Keadaan kosong yang mengarahkan pengguna: judul + penjelasan + aksi
 * lanjutan lewat children — tidak sekadar "tidak ada data".
 */
export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-line-strong bg-raised px-5 py-8 text-center",
        className,
      )}
    >
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sunk text-ink-faint">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-display text-lg text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
