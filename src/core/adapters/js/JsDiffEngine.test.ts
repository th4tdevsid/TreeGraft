import { describe, it, expect } from "vitest";
import { JsDiffEngine } from "./JsDiffEngine";

const engine = new JsDiffEngine();

// ---------------------------------------------------------------------------
// diffLines
// ---------------------------------------------------------------------------

describe("JsDiffEngine.diffLines", () => {
  it("returns empty result for two empty strings", () => {
    const result = engine.diffLines("", "");
    expect(result.lines).toHaveLength(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  it("returns only context lines for identical files", () => {
    const text = "line1\nline2\nline3\n";
    const result = engine.diffLines(text, text);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
    expect(result.lines.every((l) => l.type === "context")).toBe(true);
  });

  it("marks all lines removed when right is empty", () => {
    const result = engine.diffLines("a\nb\n", "");
    const removed = result.lines.filter((l) => l.type === "removed");
    expect(removed).toHaveLength(2);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(2);
  });

  it("marks all lines added when left is empty", () => {
    const result = engine.diffLines("", "x\ny\n");
    const added = result.lines.filter((l) => l.type === "added");
    expect(added).toHaveLength(2);
    expect(result.additions).toBe(2);
    expect(result.deletions).toBe(0);
  });

  it("correctly identifies one changed line among context", () => {
    const left = "line1\nline2\nline3\n";
    const right = "line1\nchanged\nline3\n";
    const result = engine.diffLines(left, right);

    const removed = result.lines.filter((l) => l.type === "removed");
    const added = result.lines.filter((l) => l.type === "added");

    expect(removed).toHaveLength(1);
    expect(removed[0].content).toBe("line2");
    expect(added).toHaveLength(1);
    expect(added[0].content).toBe("changed");
  });

  it("removed lines carry oldLineNumber and null newLineNumber", () => {
    const result = engine.diffLines("only\n", "");
    const removed = result.lines.find((l) => l.type === "removed");
    expect(removed?.oldLineNumber).toBe(1);
    expect(removed?.newLineNumber).toBeNull();
  });

  it("added lines carry null oldLineNumber and newLineNumber", () => {
    const result = engine.diffLines("", "only\n");
    const added = result.lines.find((l) => l.type === "added");
    expect(added?.oldLineNumber).toBeNull();
    expect(added?.newLineNumber).toBe(1);
  });

  it("context lines carry sequential oldLineNumber and newLineNumber", () => {
    const text = "a\nb\nc\n";
    const result = engine.diffLines(text, text);
    expect(result.lines[0].oldLineNumber).toBe(1);
    expect(result.lines[0].newLineNumber).toBe(1);
    expect(result.lines[2].oldLineNumber).toBe(3);
    expect(result.lines[2].newLineNumber).toBe(3);
  });

  it("handles completely different files", () => {
    const result = engine.diffLines("aaa\nbbb\n", "xxx\nyyy\n");
    expect(result.deletions).toBe(2);
    expect(result.additions).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// diff (hunk-based)
// ---------------------------------------------------------------------------

describe("JsDiffEngine.diff", () => {
  it("returns no hunks for two empty strings", () => {
    const result = engine.diff("", "");
    expect(result.hunks).toHaveLength(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  it("returns no hunks for identical files", () => {
    const text = "a\nb\nc\n";
    const result = engine.diff(text, text);
    expect(result.hunks).toHaveLength(0);
  });

  it("produces a hunk with correct stats for one changed line", () => {
    const left = "a\nb\nc\n";
    const right = "a\nx\nc\n";
    const result = engine.diff(left, right);
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
    expect(result.hunks).toHaveLength(1);
  });

  it("hunk lines include context, added, and removed types", () => {
    const left = "ctx\nold\nctx\n";
    const right = "ctx\nnew\nctx\n";
    const { hunks } = engine.diff(left, right);
    const types = hunks[0].lines.map((l) => l.type);
    expect(types).toContain("context");
    expect(types).toContain("removed");
    expect(types).toContain("added");
  });

  it("hunk header follows @@ format", () => {
    const left = "a\nb\nc\n";
    const right = "a\nx\nc\n";
    const { hunks } = engine.diff(left, right);
    expect(hunks[0].header).toMatch(/^@@\s+-\d+,\d+\s+\+\d+,\d+\s+@@/);
  });
});
