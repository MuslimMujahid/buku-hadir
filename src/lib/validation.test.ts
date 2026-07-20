import { describe, expect, it } from "vitest";
import { parseNameCells } from "./validation";

describe("parseNameCells", () => {
  it("parses a vertical newline list", () => {
    expect(parseNameCells("Siti\nBudi\nAndi")).toEqual(["Siti", "Budi", "Andi"]);
  });

  it("parses Windows CRLF separators", () => {
    expect(parseNameCells("Siti\r\nBudi")).toEqual(["Siti", "Budi"]);
  });

  it("parses a horizontal tab row", () => {
    expect(parseNameCells("Siti\tBudi\tAndi")).toEqual(["Siti", "Budi", "Andi"]);
  });

  it("parses mixed newline and tab separators", () => {
    expect(parseNameCells("Siti\nBudi\tAndi")).toEqual(["Siti", "Budi", "Andi"]);
  });

  it("drops trailing, leading, and empty tokens", () => {
    expect(parseNameCells("\nSiti\n\nBudi\n")).toEqual(["Siti", "Budi"]);
  });

  it("collapses internal whitespace", () => {
    expect(parseNameCells("Siti   Rahma")).toEqual(["Siti Rahma"]);
  });

  it("keeps a single name without a separator", () => {
    expect(parseNameCells("Siti Rahma")).toEqual(["Siti Rahma"]);
    expect(parseNameCells("Siti Rahma")).toHaveLength(1);
  });

  it("returns an empty list for empty input", () => {
    expect(parseNameCells("")).toEqual([]);
    expect(parseNameCells(" \t ")).toEqual([]);
  });
});
