import { describe, it, expect } from "vitest";
import { computeIntraLineDiff } from "./intraLineDiff";

describe("computeIntraLineDiff", () => {
  // ---------------------------------------------------------------------------
  // Single token added in the middle
  // ---------------------------------------------------------------------------

  it("marks only the inserted token as added when a token is added mid-line", () => {
    const left = "import { join } from 'path';";
    const right = "import { join, resolve } from 'path';";

    const result = computeIntraLineDiff(left, right);
    expect(result).not.toBeNull();

    // Left side: everything is unchanged (nothing was removed from left)
    const leftChanged = result!.left.filter((r) => r.type !== "unchanged");
    expect(leftChanged).toHaveLength(0);

    // Right side: the comma and "resolve" should appear in added ranges
    // (Myers diff may split or shift adjacent spaces differently)
    const rightAdded = result!.right.filter((r) => r.type === "added");
    expect(rightAdded.length).toBeGreaterThanOrEqual(1);
    const addedText = rightAdded
      .map((r) => right.slice(r.start, r.end))
      .join("");
    expect(addedText).toContain(",");
    expect(addedText).toContain("resolve");
  });

  // ---------------------------------------------------------------------------
  // Single token removed
  // ---------------------------------------------------------------------------

  it("marks only the removed token as removed when a token is deleted mid-line", () => {
    const left = "import { join, resolve } from 'path';";
    const right = "import { join } from 'path';";

    const result = computeIntraLineDiff(left, right);
    expect(result).not.toBeNull();

    // Left side: the comma and "resolve" should appear in removed ranges
    const leftRemoved = result!.left.filter((r) => r.type === "removed");
    expect(leftRemoved.length).toBeGreaterThanOrEqual(1);
    const removedText = leftRemoved
      .map((r) => left.slice(r.start, r.end))
      .join("");
    expect(removedText).toContain(",");
    expect(removedText).toContain("resolve");

    // Right side: everything is unchanged
    const rightChanged = result!.right.filter((r) => r.type !== "unchanged");
    expect(rightChanged).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // Multiple tokens changed
  // ---------------------------------------------------------------------------

  it("marks multiple changed tokens correctly", () => {
    const left = "const x = foo() + bar();";
    const right = "const y = baz() + qux();";

    const result = computeIntraLineDiff(left, right);
    expect(result).not.toBeNull();

    // "x" → "y" and "foo" → "baz" and "bar" → "qux" — at least two changed regions
    const leftRemoved = result!.left.filter((r) => r.type === "removed");
    const rightAdded = result!.right.filter((r) => r.type === "added");
    expect(leftRemoved.length).toBeGreaterThanOrEqual(2);
    expect(rightAdded.length).toBeGreaterThanOrEqual(2);

    // Unchanged prefix "const " should be present on both sides
    const leftUnchanged = result!.left.filter((r) => r.type === "unchanged");
    expect(leftUnchanged.length).toBeGreaterThan(0);
    expect(left.slice(leftUnchanged[0].start, leftUnchanged[0].end)).toBe(
      "const ",
    );
  });

  // ---------------------------------------------------------------------------
  // Fully replaced line — low similarity, should NOT get intra-line diff
  // ---------------------------------------------------------------------------

  it("returns null when lines are too different (similarity < 30%)", () => {
    const left = "aaaaaaaaaa";
    const right = "zzzzzzzzzz";

    const result = computeIntraLineDiff(left, right);
    expect(result).toBeNull();
  });

  it("returns null for completely unrelated lines", () => {
    const left = "export default function hello() {";
    const right = "  const x = 42;";

    const result = computeIntraLineDiff(left, right);
    expect(result).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("returns empty range arrays for two identical lines", () => {
    const line = "function foo() { return 42; }";
    const result = computeIntraLineDiff(line, line);
    expect(result).not.toBeNull();
    const leftChanged = result!.left.filter((r) => r.type !== "unchanged");
    const rightChanged = result!.right.filter((r) => r.type !== "unchanged");
    expect(leftChanged).toHaveLength(0);
    expect(rightChanged).toHaveLength(0);
  });

  it("returns non-null for two empty strings", () => {
    const result = computeIntraLineDiff("", "");
    expect(result).not.toBeNull();
    expect(result!.left).toHaveLength(0);
    expect(result!.right).toHaveLength(0);
  });

  it("ranges cover the full content without gaps or overlaps", () => {
    const left = "const foo = bar();";
    const right = "const foo = baz();";

    const result = computeIntraLineDiff(left, right);
    expect(result).not.toBeNull();

    // Left ranges should exactly cover [0, left.length)
    let pos = 0;
    for (const range of result!.left) {
      expect(range.start).toBe(pos);
      pos = range.end;
    }
    expect(pos).toBe(left.length);

    // Right ranges should exactly cover [0, right.length)
    pos = 0;
    for (const range of result!.right) {
      expect(range.start).toBe(pos);
      pos = range.end;
    }
    expect(pos).toBe(right.length);
  });
});
