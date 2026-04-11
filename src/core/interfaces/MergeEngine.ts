import type { MergePreview, MergeResult } from './types'

export interface MergeEngine {
  merge(base: string, ours: string, theirs: string): MergeResult
  preview(repoPath: string, branch: string): Promise<MergePreview>
}
