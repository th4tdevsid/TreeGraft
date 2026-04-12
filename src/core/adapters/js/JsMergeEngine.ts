import type { MergeEngine } from '@core/interfaces/MergeEngine';
import type { MergePreview, MergeResult } from '@core/interfaces/types';

export class JsMergeEngine implements MergeEngine {
  merge(_base: string, _ours: string, _theirs: string): MergeResult {
    throw new Error('Not implemented');
  }

  preview(_repoPath: string, _branch: string): Promise<MergePreview> {
    throw new Error('Not implemented');
  }
}
