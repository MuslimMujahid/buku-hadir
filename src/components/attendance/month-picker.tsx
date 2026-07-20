"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { BULAN_PENDEK, formatBulan } from "./format";

const MONTHS_IN_YEAR = 12;

type MonthPickerProps = {
  month: string;
  onSelectAction: (month: string) => void;
  className?: string;
};

/** Pemilih bulan rekap berbentuk popover dengan nama bulan berbahasa Indonesia. */
export function MonthPicker({ month, onSelectAction, className }: MonthPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const calendarId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(() => Number(month.slice(0, 4)));


  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function selectMonth(nextMonth: string) {
    setIsOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    onSelectAction(nextMonth);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block w-full", className)}>
      <Button
        variant="secondary"
        size="lg"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={calendarId}
        aria-label={`Pilih bulan rekap, ${formatBulan(month)}`}
        className="w-full justify-between"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="min-w-0 truncate text-left">{formatBulan(month)}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/30 p-4 sm:absolute sm:inset-auto sm:left-0 sm:top-[calc(100%+0.5rem)] sm:block sm:w-[min(22rem,calc(100vw-2rem))] sm:bg-transparent sm:p-0"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            id={calendarId}
            role="dialog"
            aria-modal="true"
            aria-label={`Pilih bulan tahun ${visibleYear}`}
            className="mx-auto mt-auto w-full rounded-lg border border-line bg-raised p-3 shadow-card sm:mt-0 sm:w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="md"
                aria-label="Tahun sebelumnya"
                className="w-11 shrink-0 px-0"
                onClick={() => setVisibleYear((year) => year - 1)}
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </Button>
              <p className="text-center font-display text-base font-semibold text-ink">{visibleYear}</p>
              <Button
                variant="ghost"
                size="md"
                aria-label="Tahun berikutnya"
                className="w-11 shrink-0 px-0"
                onClick={() => setVisibleYear((year) => year + 1)}
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </Button>
            </div>

            <div role="grid" aria-label={`Bulan pada tahun ${visibleYear}`} className="grid grid-cols-3 gap-2">
              {BULAN_PENDEK.map((shortName, monthIndex) => {
                const monthValue = `${visibleYear}-${String(monthIndex + 1).padStart(2, "0")}`;
                const isSelected = monthValue === month;
                const monthLabel = formatBulan(monthValue);

                return (
                  <div
                    key={monthValue}
                    role="gridcell"
                    aria-selected={isSelected}
                    className="min-w-0"
                  >
                    <button
                      type="button"
                      aria-label={monthLabel}
                      aria-current={isSelected ? "date" : undefined}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex h-11 w-full items-center justify-center rounded-md border border-transparent px-2 font-mono text-sm text-ink transition-colors hover:border-line-strong hover:bg-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong",
                        isSelected && "border-accent-strong bg-accent-soft font-semibold text-accent-deep",
                      )}
                      onClick={() => selectMonth(monthValue)}
                    >
                      {shortName}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="sr-only">
              Pilih salah satu dari {MONTHS_IN_YEAR} bulan pada tahun {visibleYear}.
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
