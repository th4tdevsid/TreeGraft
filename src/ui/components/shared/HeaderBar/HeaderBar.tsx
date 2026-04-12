import type { DiffStats } from "@core/interfaces/types";
import styles from "./HeaderBar.module.css";

interface HeaderBarProps {
  leftFile: string;
  rightFile: string;
  stats: DiffStats;
}

export default function HeaderBar({
  leftFile,
  rightFile,
  stats,
}: HeaderBarProps): JSX.Element {
  return (
    <div className={styles.header}>
      <span className={styles.file} title={leftFile}>
        {leftFile || "—"}
      </span>

      <div className={styles.stats}>
        {stats.additions > 0 && (
          <span className={styles.additions}>+{stats.additions}</span>
        )}
        {stats.deletions > 0 && (
          <span className={styles.deletions}> −{stats.deletions}</span>
        )}
      </div>

      <span className={`${styles.file} ${styles.fileRight}`} title={rightFile}>
        {rightFile || "—"}
      </span>
    </div>
  );
}
