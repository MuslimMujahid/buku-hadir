import { cn } from "@/components/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-strong text-white shadow-card hover:bg-accent-deep active:bg-accent-deep",
  secondary:
    "border border-line-strong bg-raised text-ink shadow-card hover:bg-sunk active:bg-sunk",
  ghost: "text-ink-soft hover:bg-sunk hover:text-ink active:bg-sunk",
};

/* Every size keeps a ≥44px touch target. */
const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

/** Shared class recipe so Link-based CTAs match Button exactly. */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
