import { cn } from "@/components/ui/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  const isInvalid =
    invalid === true ||
    props["aria-invalid"] === true ||
    props["aria-invalid"] === "true";
  return (
    <input
      aria-invalid={isInvalid || undefined}
      className={cn(
        "h-11 w-full rounded-md border bg-raised px-3 text-base text-ink shadow-none transition-colors",
        "placeholder:text-ink-faint focus:border-accent-strong",
        isInvalid ? "border-alpa" : "border-line-strong",
        className,
      )}
      {...props}
    />
  );
}
