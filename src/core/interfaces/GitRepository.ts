import type {
  AppError,
  Branch,
  Commit,
  FileDiff,
  FileStatus,
  Result,
} from "./types";

export interface GitRepository {
  log(repoPath: string): Promise<Result<Commit[], AppError>>;
  diff(
    repoPath: string,
    from: string,
    to: string,
  ): Promise<Result<FileDiff[], AppError>>;
  stage(repoPath: string, paths: string[]): Promise<Result<void, AppError>>;
  commit(repoPath: string, message: string): Promise<Result<string, AppError>>;
  branches(repoPath: string): Promise<Result<Branch[], AppError>>;
  checkout(repoPath: string, branch: string): Promise<Result<void, AppError>>;
  status(repoPath: string): Promise<Result<FileStatus[], AppError>>;
}
