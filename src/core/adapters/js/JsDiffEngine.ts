import * as Diff from 'diff';
import type { DiffEngine } from '@core/interfaces/DiffEngine';
import type { DiffHunk, DiffLine, DiffResult, LineDiffResult } from '@core/interfaces/types';

export class JsDiffEngine implements DiffEngine {
  diff(left: string, right: string): DiffResult {
    const patch = Diff.structuredPatch('', '', left, right, '', '', { context: 3 });

    let additions = 0;
    let deletions = 0;

    const hunks: DiffHunk[] = patch.hunks.map(hunk => {
      let oldLine = hunk.oldStart;
      let newLine = hunk.newStart;
      const lines: DiffLine[] = [];

      for (const rawLine of hunk.lines) {
        // Skip "no newline at end of file" markers
        if (rawLine.startsWith('\\')) continue;

        const prefix = rawLine[0];
        const content = rawLine.slice(1);

        if (prefix === '+') {
          additions++;
          lines.push({ type: 'added', content, oldLineNumber: null, newLineNumber: newLine++ });
        } else if (prefix === '-') {
          deletions++;
          lines.push({ type: 'removed', content, oldLineNumber: oldLine++, newLineNumber: null });
        } else {
          lines.push({ type: 'context', content, oldLineNumber: oldLine++, newLineNumber: newLine++ });
        }
      }

      return {
        header: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
        oldStart: hunk.oldStart,
        oldLines: hunk.oldLines,
        newStart: hunk.newStart,
        newLines: hunk.newLines,
        lines,
      };
    });

    return { hunks, additions, deletions };
  }

  diffLines(left: string, right: string): LineDiffResult {
    const changes = Diff.diffLines(left, right);

    let oldLineNum = 1;
    let newLineNum = 1;
    let additions = 0;
    let deletions = 0;
    const lines: DiffLine[] = [];

    for (const change of changes) {
      const rawLines = change.value.split('\n');
      // diffLines includes trailing newlines; the split produces a trailing empty string
      if (rawLines.at(-1) === '') rawLines.pop();

      if (change.added === true) {
        for (const content of rawLines) {
          lines.push({ type: 'added', content, oldLineNumber: null, newLineNumber: newLineNum++ });
          additions++;
        }
      } else if (change.removed === true) {
        for (const content of rawLines) {
          lines.push({ type: 'removed', content, oldLineNumber: oldLineNum++, newLineNumber: null });
          deletions++;
        }
      } else {
        for (const content of rawLines) {
          lines.push({ type: 'context', content, oldLineNumber: oldLineNum++, newLineNumber: newLineNum++ });
        }
      }
    }

    return { lines, additions, deletions };
  }
}
