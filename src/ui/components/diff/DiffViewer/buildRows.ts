import type { DiffLine } from "@core/interfaces/types";
import { computeIntraLineDiff, type CharRange } from "./intraLineDiff";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RowType = "context" | "added" | "removed" | "placeholder";

export interface PanelRow {
  lineNumber: number | null;
  content: string;
  type: RowType;
  /**
   * Present when this is one side of an intra-line (word-level) diff.
   * The ranges index into `content`. Ranges with type "removed" / "added"
   * receive a full-intensity highlight; "unchanged" ranges are unstyled.
   * When absent the whole line gets a full-intensity background.
   */
  charRanges?: CharRange[];
}

// Re-export for consumers that only import from buildRows
export type { CharRange };

export interface SideBySideRows {
  left: PanelRow[];
  right: PanelRow[];
}

// ---------------------------------------------------------------------------
// buildRows
//
// Converts a flat LineDiffResult.lines array into aligned left/right panel
// rows. Removed and added lines within each change block are paired so the
// panels stay vertically aligned — the shorter side gets placeholder rows.
//
// For each paired (removed + added) row, character-level diff is computed.
// If the two lines are similar enough (≥ 30% unchanged chars), charRanges
// is attached and the UI renders intra-line highlights instead of a full
// background.
// ---------------------------------------------------------------------------

export function buildRows(lines: DiffLine[]): SideBySideRows {
  const left: PanelRow[] = [];
  const right: PanelRow[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.type === "context") {
      left.push({
        lineNumber: line.oldLineNumber,
        content: line.content,
        type: "context",
      });
      right.push({
        lineNumber: line.newLineNumber,
        content: line.content,
        type: "context",
      });
      i++;
      continue;
    }

    // Collect a contiguous block of removed and/or added lines
    const removed: DiffLine[] = [];
    const added: DiffLine[] = [];

    while (i < lines.length && lines[i].type !== "context") {
      if (lines[i].type === "removed") removed.push(lines[i]);
      else if (lines[i].type === "added") added.push(lines[i]);
      i++;
    }

    // Pair them up; pad the shorter side with placeholders.
    // When both sides have a line at the same index, attempt intra-line diff.
    const maxLen = Math.max(removed.length, added.length);
    for (let j = 0; j < maxLen; j++) {
      const removedLine = j < removed.length ? removed[j] : null;
      const addedLine = j < added.length ? added[j] : null;

      const intra =
        removedLine !== null && addedLine !== null
          ? computeIntraLineDiff(removedLine.content, addedLine.content)
          : null;

      if (removedLine !== null) {
        left.push({
          lineNumber: removedLine.oldLineNumber,
          content: removedLine.content,
          type: "removed",
          ...(intra !== null ? { charRanges: intra.left } : {}),
        });
      } else {
        left.push({ lineNumber: null, content: "", type: "placeholder" });
      }

      if (addedLine !== null) {
        right.push({
          lineNumber: addedLine.newLineNumber,
          content: addedLine.content,
          type: "added",
          ...(intra !== null ? { charRanges: intra.right } : {}),
        });
      } else {
        right.push({ lineNumber: null, content: "", type: "placeholder" });
      }
    }
  }

  return { left, right };
}
