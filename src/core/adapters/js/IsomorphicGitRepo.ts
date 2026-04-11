import type { GitRepository } from '@core/interfaces/GitRepository'
import type {
  AppError,
  Branch,
  Commit,
  FileDiff,
  FileStatus,
  Result,
} from '@core/interfaces/types'

export class IsomorphicGitRepo implements GitRepository {
  log(_repoPath: string): Promise<Result<Commit[], AppError>> {
    throw new Error('Not implemented')
  }

  diff(
    _repoPath: string,
    _from: string,
    _to: string,
  ): Promise<Result<FileDiff[], AppError>> {
    throw new Error('Not implemented')
  }

  stage(_repoPath: string, _paths: string[]): Promise<Result<void, AppError>> {
    throw new Error('Not implemented')
  }

  commit(_repoPath: string, _message: string): Promise<Result<string, AppError>> {
    throw new Error('Not implemented')
  }

  branches(_repoPath: string): Promise<Result<Branch[], AppError>> {
    throw new Error('Not implemented')
  }

  checkout(_repoPath: string, _branch: string): Promise<Result<void, AppError>> {
    throw new Error('Not implemented')
  }

  status(_repoPath: string): Promise<Result<FileStatus[], AppError>> {
    throw new Error('Not implemented')
  }
}
