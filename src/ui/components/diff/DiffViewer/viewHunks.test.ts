import { describe, it, expect } from "vitest";
import { computeViewHunks } from "./viewHunks";
import type { PanelRow } from "./buildRows";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ctx(lineNumber: number): PanelRow {
  return { lineNumber, content: "ctx", type: "context" };
}

function added(lineNumber: number): PanelRow {
  return { lineNumber, content: "+line", type: "added" };
}

function removed(lineNumber: number): PanelRow {
  return { lineNumber, content: "-line", type: "removed" };
}

function placeholder(): PanelRow {
  return { lineNumber: null, content: "", type: "placeholder" };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("computeViewHunks", () => {
  it("returns 0 hunks for an all-context row list", () => {
    const rows = [ctx(1), ctx(2), ctx(3)];
    expect(computeViewHunks(rows)).toHaveLength(0);
  });

  it("returns 1 hunk for a single contiguous change block", () => {
    const rows = [ctx(1), removed(2), added(2), ctx(3)];
    const hunks = computeViewHunks(rows);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].startIndex).toBe(1);
    expect(hunks[0].endIndex).toBe(2);
  });

  it("returns 2 hunks for two blocks separated by context", () => {
    const rows = [
      ctx(1),
      removed(2),
      added(2),
      ctx(3),
      ctx(4),
      ctx(5),
      added(6),
      ctx(7),
    ];
    const hunks = computeViewHunks(rows);
    expect(hunks).toHaveLength(2);
    expect(hunks[0].startIndex).toBe(1);
    expect(hunks[0].endIndex).toBe(2);
    expect(hunks[1].startIndex).toBe(6);
    expect(hunks[1].endIndex).toBe(6);
  });

  it("returns 1 hunk when all rows are changed (no context)", () => {
    const rows = [removed(1), added(1), removed(2), added(2)];
    const hunks = computeViewHunks(rows);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].startIndex).toBe(0);
    expect(hunks[0].endIndex).toBe(3);
  });

  it("treats placeholder rows as part of a change block", () => {
    // removed(1) paired with placeholder on the added side
    const rows = [ctx(0), removed(1), placeholder(), ctx(2)];
    const hunks = computeViewHunks(rows);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].startIndex).toBe(1);
    expect(hunks[0].endIndex).toBe(2);
  });

  it("counts alternating changed blocks correctly", () => {
    const rows = [added(1), ctx(2), removed(3), ctx(4), added(5), ctx(6)];
    const hunks = computeViewHunks(rows);
    expect(hunks).toHaveLength(3);
  });
});
