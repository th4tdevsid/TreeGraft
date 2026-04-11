import type { DiffEngine } from '@core/interfaces/DiffEngine'
import type { GitRepository } from '@core/interfaces/GitRepository'
import type { MergeEngine } from '@core/interfaces/MergeEngine'
import type { StructuralParser } from '@core/interfaces/StructuralParser'
import { IsomorphicGitRepo } from '@core/adapters/js/IsomorphicGitRepo'
import { JsDiffEngine } from '@core/adapters/js/JsDiffEngine'
import { JsMergeEngine } from '@core/adapters/js/JsMergeEngine'
import { TreeSitterParser } from '@core/adapters/js/TreeSitterParser'

export const diffEngine: DiffEngine = new JsDiffEngine()
export const gitRepo: GitRepository = new IsomorphicGitRepo()
export const mergeEngine: MergeEngine = new JsMergeEngine()
export const parser: StructuralParser = new TreeSitterParser()
