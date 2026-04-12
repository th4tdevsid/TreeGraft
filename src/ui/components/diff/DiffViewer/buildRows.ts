import type { DiffLine } from "@core/interfaces/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RowType = "context" | "added" | "removed" | "placeholder";

export interface PanelRow {
  lineNumber: number | null;
  content: string;
  type: RowType;
}

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

    // Pair them up; pad the shorter side with placeholders
    const maxLen = Math.max(removed.length, added.length);
    for (let j = 0; j < maxLen; j++) {
      if (j < removed.length) {
        left.push({
          lineNumber: removed[j].oldLineNumber,
          content: removed[j].content,
          type: "removed",
        });
      } else {
        left.push({ lineNumber: null, content: "", type: "placeholder" });
      }

      if (j < added.length) {
        right.push({
          lineNumber: added[j].newLineNumber,
          content: added[j].content,
          type: "added",
        });
      } else {
        right.push({ lineNumber: null, content: "", type: "placeholder" });
      }
    }
  }

  return { left, right };
}
