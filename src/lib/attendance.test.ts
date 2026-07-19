import { describe, expect, it } from "vitest";
import {
  aggregateStatusTotals,
  getMonthBounds,
  parseUtcDate,
  parseUtcMonth,
} from "./attendance";

describe("UTC attendance calendar helpers", () => {
  it("accepts leap day only in a leap year", () => {
    expect(parseUtcDate("2024-02-29")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
    expect(parseUtcDate("2023-02-29")).toBeNull();
  });

  it("uses an exclusive boundary across the year transition", () => {
    const bounds = getMonthBounds("2024-12");
    expect(bounds?.start.toISOString()).toBe("2024-12-01T00:00:00.000Z");
    expect(bounds?.endExclusive.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("rejects malformed months", () => {
    expect(parseUtcMonth("2024-00")).toBeNull();
    expect(parseUtcMonth("2024-13")).toBeNull();
    expect(parseUtcMonth("24-01")).toBeNull();
  });
});

describe("attendance status aggregation", () => {
  it("counts every status and preserves zero-valued keys", () => {
    expect(
      aggregateStatusTotals([
        { status: "HADIR" },
        { status: "HADIR" },
        { status: "SAKIT" },
        { status: "IZIN" },
        { status: "ALPA" },
      ]),
    ).toEqual({ HADIR: 2, SAKIT: 1, IZIN: 1, ALPA: 1 });
    expect(aggregateStatusTotals([])).toEqual({ HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 });
  });
});
