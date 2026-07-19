import type { ActionState } from "@/lib/validation";
import { cn } from "@/components/ui/cn";

/**
 * Umpan balik hasil server action: error disiarkan assertive (role=alert),
 * sukses lewat live region sopan. Mengembalikan null bila tidak ada pesan.
 */
export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (!state.message) return null;
  if (state.status === "error") {
    return (
      <p role="alert" className={cn("text-sm text-alpa", className)}>
        {state.message}
      </p>
    );
  }
  return (
    <p aria-live="polite" className={cn("text-sm text-hadir", className)}>
      {state.message}
    </p>
  );
}
