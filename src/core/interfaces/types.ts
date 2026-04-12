// ---------------------------------------------------------------------------
// Result / Error primitives
// ---------------------------------------------------------------------------

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export enum AppError {
  GitOperationFailed = "GIT_OPERATION_FAILED",
  ParseFailed = "PARSE_FAILED",
  FileNotFound = "FILE_NOT_FOUND",
  InvalidRepository = "INVALID_REPOSITORY",
  MergeFailed = "MERGE_FAILED",
}

// ---------------------------------------------------------------------------
// Git domain types
// ---------------------------------------------------------------------------

export interface CommitAuthor {
  name: string;
  email: string;
  timestamp: number;
}

export interface Commit {
  oid: string;
  message: string;
  author: CommitAuthor;
  committer: CommitAuthor;
  parents: string[];
}

export interface Branch {
  name: string;
  current: boolean;
  remote: string | null;
}

export type FileChangeStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "staged"
  | "unmodified";

export interface FileStatus {
  path: string;
  status: FileChangeStatus;
  staged: boolean;
}

// ---------------------------------------------------------------------------
// Diff domain types
// ---------------------------------------------------------------------------

export type DiffLineType = "context" | "added" | "removed";

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  oldPath: string | null;
  status: FileChangeStatus;
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
}

export interface DiffResult {
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
}

export interface LineDiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

// ---------------------------------------------------------------------------
// Merge domain types
// ---------------------------------------------------------------------------

export interface MergeConflict {
  startLine: number;
  endLine: number;
  base: string;
  ours: string;
  theirs: string;
}

export interface MergeResult {
  output: string;
  conflicts: MergeConflict[];
  ok: boolean;
}

export interface MergePreview {
  branch: string;
  files: FileDiff[];
  conflictCount: number;
  canAutoMerge: boolean;
}

// ---------------------------------------------------------------------------
// Structural / parser domain types
// ---------------------------------------------------------------------------

export type Language = "typescript" | "javascript" | "python" | "java" | "rust";

export type EntityKind =
  | "function"
  | "class"
  | "method"
  | "interface"
  | "type"
  | "variable";

export interface Entity {
  name: string;
  kind: EntityKind;
  startLine: number;
  endLine: number;
  startByte: number;
  endByte: number;
  language: Language;
}

export interface SyntaxPosition {
  row: number;
  column: number;
}

export interface SyntaxNode {
  type: string;
  startPosition: SyntaxPosition;
  endPosition: SyntaxPosition;
  startIndex: number;
  endIndex: number;
  text: string;
  children: SyntaxNode[];
  childCount: number;
  isNamed: boolean;
}

export interface SyntaxTree {
  language: Language;
  rootNode: SyntaxNode;
  source: string;
}

// ---------------------------------------------------------------------------
// UI domain types
// ---------------------------------------------------------------------------

export interface FileContent {
  path: string;
  name: string;
  content: string;
  language: Language | null;
}

export interface DiffStats {
  additions: number;
  deletions: number;
}
