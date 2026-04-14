import type { PanelRow } from "./buildRows";

// ---------------------------------------------------------------------------
// ViewHunk
//
// A visual change block — a group of contiguous non-context rows separated
// by context rows. This is what FloatingNav uses for navigation and counting.
//
// Distinct from DiffHunk (the core interface type) which is produced by
// structuredPatch() and may merge nearby change blocks when they fall within
// the context window.
// ---------------------------------------------------------------------------

export interface ViewHunk {
  /** Row index of the first non-context row in this change block */
  startIndex: number;
  /** Row index of the last non-context row in this change block */
  endIndex: number;
}

// ---------------------------------------------------------------------------
// computeViewHunks
//
// Scans a panel row array and groups contiguous non-context rows into hunks.
// "placeholder" rows (padding on the shorter side of a change block) are
// treated as part of the block, not as separators.
// ---------------------------------------------------------------------------

export function computeViewHunks(rows: PanelRow[]): ViewHunk[] {
  const hunks: ViewHunk[] = [];
  let i = 0;

  while (i < rows.length) {
    if (rows[i].type === "context") {
      i++;
      continue;
    }

    // Start of a change block: advance until we hit a context row
    const startIndex = i;
    while (i < rows.length && rows[i].type !== "context") {
      i++;
    }

    hunks.push({ startIndex, endIndex: i - 1 });
  }

  return hunks;
}
