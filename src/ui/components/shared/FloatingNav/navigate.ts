/**
 * Pure navigation logic — advance or retreat a hunk index with wrap-around.
 * Extracted so it can be unit-tested without a DOM.
 */
export type NavDirection = "next" | "prev";

export function navigate(
  current: number,
  total: number,
  direction: NavDirection,
): number {
  if (total === 0) return 0;
  if (direction === "next") return (current + 1) % total;
  return (current - 1 + total) % total;
}
