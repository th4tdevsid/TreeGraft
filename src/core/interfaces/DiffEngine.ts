import type { DiffResult, LineDiffResult } from "./types";

export interface DiffEngine {
  diff(left: string, right: string): DiffResult;
  diffLines(left: string, right: string): LineDiffResult;
}
