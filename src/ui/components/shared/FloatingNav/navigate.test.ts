import { describe, it, expect } from "vitest";
import { navigate } from "./navigate";

describe("navigate", () => {
  it("advances by one on next", () => {
    expect(navigate(0, 5, "next")).toBe(1);
    expect(navigate(3, 5, "next")).toBe(4);
  });

  it("wraps from last to first on next", () => {
    expect(navigate(4, 5, "next")).toBe(0);
  });

  it("retreats by one on prev", () => {
    expect(navigate(4, 5, "prev")).toBe(3);
    expect(navigate(1, 5, "prev")).toBe(0);
  });

  it("wraps from first to last on prev", () => {
    expect(navigate(0, 5, "prev")).toBe(4);
  });

  it("returns 0 when total is 0 (next)", () => {
    expect(navigate(0, 0, "next")).toBe(0);
  });

  it("returns 0 when total is 0 (prev)", () => {
    expect(navigate(0, 0, "prev")).toBe(0);
  });

  it("handles single-element list (next stays at 0)", () => {
    expect(navigate(0, 1, "next")).toBe(0);
  });

  it("handles single-element list (prev stays at 0)", () => {
    expect(navigate(0, 1, "prev")).toBe(0);
  });
});
