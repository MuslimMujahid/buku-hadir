"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

type StudentLite = { id: string; name: string };

type StudentMenuProps = {
  student: StudentLite;
  onRenameAction: () => void;
  onRemoveAction: () => void;
};

export function StudentMenu({ student, onRenameAction, onRemoveAction }: StudentMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="md"
        className="size-11 shrink-0 p-0"
        aria-label={`Menu untuk ${student.name}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        <EllipsisVertical className="size-4" aria-hidden="true" />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 min-w-36 rounded-md border border-line bg-raised p-1 shadow-lift"
        >
          <button
            type="button"
            role="menuitem"
            className={cn(
              "flex min-h-11 w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-ink transition-colors",
              "hover:bg-sunk focus-visible:bg-sunk focus-visible:outline-none",
            )}
            onClick={() => {
              setOpen(false);
              onRenameAction();
            }}
          >
            <Pencil className="size-4 shrink-0" aria-hidden="true" />
            Ubah nama
          </button>
          <button
            type="button"
            role="menuitem"
            className={cn(
              "flex min-h-11 w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors",
              "text-alpa hover:bg-sunk focus-visible:bg-sunk focus-visible:outline-none",
            )}
            onClick={() => {
              setOpen(false);
              onRemoveAction();
            }}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden="true" />
            Hapus
          </button>
        </div>
      ) : null}
    </div>
  );
}
