import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import type { FileContent, DiffHunk, SyntaxTree } from '@core/interfaces/types';
import { diffEngine, parser } from '@config/engines';
import SplitPane, { type SplitPaneHandle } from '@ui/components/shared/SplitPane';
import FloatingNav from '@ui/components/shared/FloatingNav';
import HeaderBar from '@ui/components/shared/HeaderBar';
import { buildRows, type PanelRow } from './buildRows';
import { tokenizeFile, type Token } from './tokenize';
import styles from './DiffViewer.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiffViewerProps {
  leftFile?: FileContent;
  rightFile?: FileContent;
}

// ---------------------------------------------------------------------------
// Line rendering helpers
// ---------------------------------------------------------------------------

const ROW_TYPE_CLASS: Record<string, string> = {
  context: '',
  added: styles.lineAdded ?? '',
  removed: styles.lineRemoved ?? '',
  placeholder: styles.linePlaceholder ?? '',
};

function renderTokens(tokens: Token[]): JSX.Element[] {
  return tokens.map((tok, i) =>
    tok.cssClass
      ? <span key={i} className={styles[tok.cssClass]}>{tok.text}</span>
      : <span key={i}>{tok.text}</span>,
  );
}

function DiffLine({
  row,
  tokens,
  lineNumberWidth,
}: {
  row: PanelRow;
  tokens: Token[] | null;
  lineNumberWidth: number;
}): JSX.Element {
  const rowClass = [styles.line, ROW_TYPE_CLASS[row.type]].filter(Boolean).join(' ');
  const lineNumStyle: React.CSSProperties = { width: lineNumberWidth };

  return (
    <div className={rowClass}>
      <span className={styles.lineNumber} style={lineNumStyle}>
        {row.lineNumber ?? ''}
      </span>
      <span className={styles.lineContent}>
        {tokens ? renderTokens(tokens) : row.content}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel content
// ---------------------------------------------------------------------------

function PanelContent({
  rows,
  tokenMap,
  lineNumberWidth,
  probeRef,
}: {
  rows: PanelRow[];
  tokenMap: Map<number, Token[]> | null;
  lineNumberWidth: number;
  probeRef?: React.RefObject<HTMLDivElement>;
}): JSX.Element {
  return (
    <div className={styles.panelContent}>
      {/* Hidden probe used to measure row height at runtime */}
      {probeRef !== undefined && (
        <div ref={probeRef} className={styles.rowProbe} aria-hidden="true">
          &nbsp;
        </div>
      )}
      {rows.map((row, idx) => {
        const tokens =
          tokenMap !== null && row.lineNumber !== null
            ? (tokenMap.get(row.lineNumber - 1) ?? null)
            : null;

        return (
          <DiffLine
            key={idx}
            row={row}
            tokens={tokens}
            lineNumberWidth={lineNumberWidth}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / drop target
// ---------------------------------------------------------------------------

interface DropZoneProps {
  side: 'left' | 'right';
  onDrop: (side: 'left' | 'right', file: FileContent) => void;
}

function DropZone({ side, onDrop }: DropZoneProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;

      void file.text().then(content => {
        const electronFile = file as File & { path?: string };
        const filePath = electronFile.path ?? file.name;
        onDrop(side, {
          path: filePath,
          name: file.name,
          content,
          language: parser.detectLanguage(file.name),
        });
      });
    },
    [side, onDrop],
  );

  return (
    <div
      className={[styles.dropZone, isDragOver ? styles.dropZoneOver : ''].join(' ')}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <span className={styles.dropHint}>Drop a file here or click Open</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DiffViewer({ leftFile, rightFile }: DiffViewerProps): JSX.Element {
  const splitPaneRef = useRef<SplitPaneHandle>(null);
  const rowProbeRef = useRef<HTMLDivElement>(null);
  const rowHeightRef = useRef<number>(0);

  // Measure row height once after first render
  useEffect(() => {
    if (rowProbeRef.current && rowHeightRef.current === 0) {
      rowHeightRef.current = rowProbeRef.current.offsetHeight;
    }
  });

  // State for file drops (drag-and-drop overrides the prop)
  const [droppedLeft, setDroppedLeft] = useState<FileContent | null>(null);
  const [droppedRight, setDroppedRight] = useState<FileContent | null>(null);

  // Clear dropped files when props change
  useEffect(() => { setDroppedLeft(null); }, [leftFile]);
  useEffect(() => { setDroppedRight(null); }, [rightFile]);

  const handleDrop = useCallback(
    (side: 'left' | 'right', file: FileContent) => {
      if (side === 'left') setDroppedLeft(file);
      else setDroppedRight(file);
    },
    [],
  );

  const effectiveLeft = droppedLeft ?? leftFile ?? null;
  const effectiveRight = droppedRight ?? rightFile ?? null;

  // ---------------------------------------------------------------------------
  // Diff computation (memoised)
  // ---------------------------------------------------------------------------

  const diffResult = useMemo(() => {
    if (!effectiveLeft || !effectiveRight) return null;
    return diffEngine.diffLines(effectiveLeft.content, effectiveRight.content);
  }, [effectiveLeft, effectiveRight]);

  const hunkResult = useMemo(() => {
    if (!effectiveLeft || !effectiveRight) return null;
    return diffEngine.diff(effectiveLeft.content, effectiveRight.content);
  }, [effectiveLeft, effectiveRight]);

  const { left: leftRows, right: rightRows } = useMemo(
    () => (diffResult ? buildRows(diffResult.lines) : { left: [], right: [] }),
    [diffResult],
  );

  // ---------------------------------------------------------------------------
  // Syntax highlight (async, best-effort)
  // ---------------------------------------------------------------------------

  const [leftTokenMap, setLeftTokenMap] = useState<Map<number, Token[]> | null>(null);
  const [rightTokenMap, setRightTokenMap] = useState<Map<number, Token[]> | null>(null);

  useEffect(() => {
    setLeftTokenMap(null);
    if (!effectiveLeft?.language) return;

    let cancelled = false;
    parser
      .parse(effectiveLeft.content, effectiveLeft.language)
      .then((tree: SyntaxTree) => {
        if (!cancelled) setLeftTokenMap(tokenizeFile(tree));
      })
      .catch(() => { /* gracefully degrade to plain text */ });

    return () => { cancelled = true; };
  }, [effectiveLeft]);

  useEffect(() => {
    setRightTokenMap(null);
    if (!effectiveRight?.language) return;

    let cancelled = false;
    parser
      .parse(effectiveRight.content, effectiveRight.language)
      .then((tree: SyntaxTree) => {
        if (!cancelled) setRightTokenMap(tokenizeFile(tree));
      })
      .catch(() => { /* gracefully degrade to plain text */ });

    return () => { cancelled = true; };
  }, [effectiveRight]);

  // ---------------------------------------------------------------------------
  // Hunk navigation
  // ---------------------------------------------------------------------------

  const hunks: DiffHunk[] = hunkResult?.hunks ?? [];

  const handleNavigate = useCallback(
    (index: number) => {
      if (!splitPaneRef.current || hunks.length === 0) return;
      const hunk = hunks[index];
      if (!hunk) return;

      // Find row index in leftRows where lineNumber === hunk.oldStart
      const rowIndex = leftRows.findIndex(r => r.lineNumber === hunk.oldStart);
      if (rowIndex < 0) return;

      const rh = rowHeightRef.current;
      if (rh > 0) {
        splitPaneRef.current.scrollTo(rowIndex * rh);
      }
    },
    [hunks, leftRows],
  );

  // ---------------------------------------------------------------------------
  // Line number gutter width
  // ---------------------------------------------------------------------------

  const maxLineNumber = Math.max(
    effectiveLeft?.content.split('\n').length ?? 1,
    effectiveRight?.content.split('\n').length ?? 1,
  );
  const lineNumberWidth = String(maxLineNumber).length * 9 + 16;

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = {
    additions: hunkResult?.additions ?? 0,
    deletions: hunkResult?.deletions ?? 0,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const leftHasContent = effectiveLeft !== null;
  const rightHasContent = effectiveRight !== null;
  const hasBoth = leftHasContent && rightHasContent;

  return (
    <div className={styles.container}>
      <HeaderBar
        leftFile={effectiveLeft?.name ?? ''}
        rightFile={effectiveRight?.name ?? ''}
        stats={stats}
      />

      <div className={styles.content}>
        <SplitPane
          ref={splitPaneRef}
          syncScroll={hasBoth}
          leftContent={
            leftHasContent ? (
              <PanelContent
                rows={leftRows}
                tokenMap={leftTokenMap}
                lineNumberWidth={lineNumberWidth}
                probeRef={rowProbeRef}
              />
            ) : (
              <DropZone side="left" onDrop={handleDrop} />
            )
          }
          rightContent={
            rightHasContent ? (
              <PanelContent
                rows={rightRows}
                tokenMap={rightTokenMap}
                lineNumberWidth={lineNumberWidth}
              />
            ) : (
              <DropZone side="right" onDrop={handleDrop} />
            )
          }
        />
      </div>

      {hasBoth && (
        <FloatingNav hunks={hunks} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
