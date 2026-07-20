"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import { cn } from "@/components/ui/cn";

export type ComboboxItem = { id: string; label: string };

export type ComboboxProps = {
  items: ComboboxItem[];
  value?: string;
  onChangeAction: (id: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  id?: string;
  /** Label for the input — must be provided for accessibility. */
  "aria-label": string;
};

/**
 * Combobox dengan pencarian — ketik untuk menyaring, panah untuk navigasi,
 * Enter untuk memilih, Escape untuk menutup.
 */
export function Combobox({
  items,
  value,
  onChangeAction,
  placeholder = "Cari…",
  emptyMessage = "Tidak ditemukan",
  className,
  id,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lower));
  }, [items, query]);

  const selectedLabel = useMemo(
    () => items.find((item) => item.id === value)?.label ?? "",
    [items, value],
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }, []);

  const select = useCallback(
    (id: string) => {
      onChangeAction(id);
      close();
    },
    [onChangeAction, close],
  );

  /* Tutup saat klik di luar. */
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open, close]);

  /* Gulir opsi yang disorot ke dalam viewport. */
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const option = listRef.current.children[activeIndex] as HTMLElement | undefined;
    option?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
        break;
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          select(filtered[activeIndex].id);
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        inputRef.current?.focus();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={id ?? listboxId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listboxId}-listbox`}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          placeholder={open ? placeholder : (selectedLabel || placeholder)}
          value={open ? query : (selectedLabel || "")}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-11 w-full rounded-md border border-line-strong bg-raised pl-10 pr-3 text-base text-ink shadow-none transition-colors",
            "placeholder:text-ink-faint focus:border-accent-strong",
          )}
        />
      </div>

      {open ? (
        <ul
          ref={listRef}
          id={`${listboxId}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-md border border-line bg-raised p-1 shadow-lift"
        >
          {filtered.length === 0 ? (
            <li className="flex min-h-11 items-center px-3 text-sm text-ink-soft">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((item, index) => (
              <li
                key={item.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={item.id === value}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center rounded-sm px-3 text-sm transition-colors",
                  index === activeIndex
                    ? "bg-accent-strong text-white"
                    : item.id === value
                      ? "bg-sunk text-ink font-medium"
                      : "text-ink hover:bg-sunk",
                )}
                onClick={() => select(item.id)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {item.label}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
