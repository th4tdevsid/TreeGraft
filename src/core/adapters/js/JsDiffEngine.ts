import type { DiffEngine } from '@core/interfaces/DiffEngine'
import type { DiffResult, LineDiffResult } from '@core/interfaces/types'

export class JsDiffEngine implements DiffEngine {
  diff(_left: string, _right: string): DiffResult {
    throw new Error('Not implemented')
  }

  diffLines(_left: string, _right: string): LineDiffResult {
    throw new Error('Not implemented')
  }
}
