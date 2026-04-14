import { useState, useEffect, useCallback } from "react";
import { navigate } from "./navigate";
import styles from "./FloatingNav.module.css";

/** Minimal hunk descriptor — row indices into a panel row array. */
export interface NavHunk {
  startIndex: number;
  endIndex: number;
}

interface FloatingNavProps {
  hunks: NavHunk[];
  onNavigate: (index: number) => void;
}

export default function FloatingNav({
  hunks,
  onNavigate,
}: FloatingNavProps): JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first hunk when hunk list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [hunks]);

  const go = useCallback(
    (direction: "next" | "prev") => {
      if (hunks.length === 0) return;
      const next = navigate(currentIndex, hunks.length, direction);
      setCurrentIndex(next);
      onNavigate(next);
    },
    [currentIndex, hunks.length, onNavigate],
  );

  // Keyboard handler — F7 / Shift+F7
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "F7") return;
      e.preventDefault();
      go(e.shiftKey ? "prev" : "next");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  if (hunks.length === 0) return null;

  return (
    <div className={styles.nav} role="navigation" aria-label="Diff navigation">
      <button
        className={styles.button}
        onClick={() => go("prev")}
        aria-label="Previous change (Shift+F7)"
        title="Shift+F7"
      >
        ↑
      </button>

      <span className={styles.count}>
        {currentIndex + 1} of {hunks.length} change
        {hunks.length !== 1 ? "s" : ""}
      </span>

      <button
        className={styles.button}
        onClick={() => go("next")}
        aria-label="Next change (F7)"
        title="F7"
      >
        ↓
      </button>
    </div>
  );
}
