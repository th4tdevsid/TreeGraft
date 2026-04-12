import * as Diff from "diff";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CharRange {
  start: number;
  end: number; // exclusive
  type: "added" | "removed" | "unchanged";
}

export interface IntraLineDiff {
  /** Ranges over the left (removed) line content */
  left: CharRange[];
  /** Ranges over the right (added) line content */
  right: CharRange[];
}

// ---------------------------------------------------------------------------
// computeIntraLineDiff
//
// Computes character-level diff between a removed and an added line.
// Returns null when the two lines are too different (similarity < 30%) —
// in that case the caller should fall back to a full-line highlight.
//
// Similarity is measured as:
//   unchangedChars / max(left.length, right.length)
// ---------------------------------------------------------------------------

export function computeIntraLineDiff(
  left: string,
  right: string,
): IntraLineDiff | null {
  // Empty lines on both sides — nothing to diff
  if (left.length === 0 && right.length === 0) {
    return { left: [], right: [] };
  }

  const changes = Diff.diffChars(left, right);

  let leftPos = 0;
  let rightPos = 0;
  let unchangedChars = 0;

  const leftRanges: CharRange[] = [];
  const rightRanges: CharRange[] = [];

  for (const change of changes) {
    const len = change.value.length;

    if (change.removed === true) {
      leftRanges.push({ start: leftPos, end: leftPos + len, type: "removed" });
      leftPos += len;
    } else if (change.added === true) {
      rightRanges.push({
        start: rightPos,
        end: rightPos + len,
        type: "added",
      });
      rightPos += len;
    } else {
      // unchanged — present on both sides
      unchangedChars += len;
      leftRanges.push({
        start: leftPos,
        end: leftPos + len,
        type: "unchanged",
      });
      rightRanges.push({
        start: rightPos,
        end: rightPos + len,
        type: "unchanged",
      });
      leftPos += len;
      rightPos += len;
    }
  }

  // Similarity check: if less than 30% of chars are unchanged, fall back to
  // full-line highlight (the lines are too different for intra-line diff to
  // be meaningful).
  const total = Math.max(left.length, right.length);
  const similarity = total > 0 ? unchangedChars / total : 0;
  if (similarity < 0.3) return null;

  return { left: leftRanges, right: rightRanges };
}
