"use client";

import { useId } from "react";
import { cn } from "@/components/ui/cn";

type FieldProps = {
  label: string;
  hint?: string;
  /** Validation messages (e.g. from ActionState.fieldErrors). */
  errors?: string[];
  className?: string;
  children: (fieldProps: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
};

/**
 * Label + control + hint/error wrapper. Wires id/aria-describedby/aria-invalid
 * onto the control via render prop so every form stays accessible by default.
 */
export function Field({ label, hint, errors, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasErrors = errors !== undefined && errors.length > 0;
  const describedBy = hasErrors || hint ? messageId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": hasErrors || undefined,
      })}
      {hasErrors ? (
        <p id={messageId} role="alert" className="text-sm text-alpa">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
