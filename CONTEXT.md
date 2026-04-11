# CONTEXT.md

This file is read by Claude Code at the start of every session.
Read it fully before touching any code.

---

## What is TreeGraft

TreeGraft is a free, local-first Git GUI with structural merge intelligence.
It sees code at the level of functions, classes, and entities — not lines.

Where other Git GUIs show line diffs, TreeGraft shows structural diffs.
Where other tools produce merge conflicts, TreeGraft auto-resolves independent
changes and explains every decision visually.

Files never leave the machine. No server. No telemetry.

**Tagline:** A Git GUI with structural intelligence built in from day one.

---

## Org and Identity

- Orgnaization: CyanTree (cyantree.co.uk)
- Upstream: github.com/cyantree-git/TreeGraft (canonical)

---

## Tech stack

| Concern | Choice |
|---|---|
| Desktop shell | Electron |
| Frontend | React 18 + TypeScript |
| Bundler | Vite + vite-plugin-electron |
| Styling | CSS Modules |
| Git operations | isomorphic-git |
| Structural parsing | web-tree-sitter |
| Line-level diff | diff (npm) |
| Testing | Vitest |
| Packaging | electron-builder |


---

## Architecture — ports and adapters

All computation modules sit behind TypeScript interfaces.
UI never imports from adapters directly — only from interfaces.
One factory file wires the active adapters.

```
src/
  core/
    interfaces/          ← TypeScript contracts, never change
      DiffEngine.ts
      GitRepository.ts
      MergeEngine.ts
      StructuralParser.ts
    adapters/
      js/                ← v1 implementations, ship today
        JsDiffEngine.ts
        IsomorphicGitRepo.ts
        JsMergeEngine.ts
        TreeSitterParser.ts
      wasm/              ← future Rust/WASM drop-ins, empty for now
  config/
    engines.ts           ← ONLY file that changes when swapping adapters
  ui/
    components/          ← React components
      shared/            ← reused from DiffGraft
        SplitPane/
        FloatingNav/
        HeaderBar/
      diff/              ← diff viewer components
      merge/             ← merge editor components
      git/               ← git GUI components
    hooks/
    styles/
  ipc/                   ← Electron main/renderer IPC bridge
  main/                  ← Electron main process
```

**The rule:** `ui/` imports from `core/interfaces/` only.
`config/engines.ts` is the only file that imports from `core/adapters/`.

---

## Coding standards

- No `any` type — use proper TypeScript types everywhere
- All errors as values — use `Result<T, AppError>` pattern, no throwing in
  business logic
- No `console.log` in production paths — use a proper logger
- All new functions need unit tests in Vitest
- CSS Modules for all styling — no inline styles, no global CSS except
  variables
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- `AppError` enum for all error types — never throw raw strings
- All IPC structs use camelCase (serde rename_all camelCase equivalent in TS
  is just standard camelCase naming)

---

## Key interfaces

These are the contracts everything is built on. Never change them without
updating all adapters.

```typescript
// DiffEngine.ts
interface DiffEngine {
  diff(left: string, right: string): DiffResult
  diffLines(left: string, right: string): LineDiffResult
}

// GitRepository.ts
interface GitRepository {
  log(repoPath: string): Promise<Result<Commit[], AppError>>
  diff(repoPath: string, from: string, to: string): Promise<Result<FileDiff[], AppError>>
  stage(repoPath: string, paths: string[]): Promise<Result<void, AppError>>
  commit(repoPath: string, message: string): Promise<Result<string, AppError>>
  branches(repoPath: string): Promise<Result<Branch[], AppError>>
  checkout(repoPath: string, branch: string): Promise<Result<void, AppError>>
  status(repoPath: string): Promise<Result<FileStatus[], AppError>>
}

// MergeEngine.ts
interface MergeEngine {
  merge(base: string, ours: string, theirs: string): MergeResult
  preview(repoPath: string, branch: string): Promise<MergePreview>
}

// StructuralParser.ts
interface StructuralParser {
  parse(code: string, language: Language): Promise<SyntaxTree>
  extractEntities(code: string, language: Language): Promise<Entity[]>
  detectLanguage(filePath: string): Language | null
}
```

---

## Component reuse from DiffGraft

These components are copied from DiffGraft and must not be modified to break
DiffGraft compatibility. Treat them as read-only until a shared component
library is created.

- `SplitPane` — resizable side by side panels with synced scroll
- `FloatingNav` — F7/Shift+F7 navigation between diff hunks
- `HeaderBar` — top bar with file names and action buttons

Key lessons from DiffGraft that apply here:
- `scrollIntoView` is unreliable for sync — use manual `scrollTop`
- `isSyncingRef` + `setTimeout(50ms)` prevents scroll feedback loops
- `ROW_HEIGHT` must be measured at runtime, never hardcoded

---

## v1 scope — what to build now

v1 is a complete Git GUI. Structural merge intelligence comes in v2.

**Build in this order:**

1. File diff viewer — open any two files, side by side, syntax highlighting,
   F7/Shift+F7 navigation. This is the first feature. Reuse SplitPane,
   FloatingNav, HeaderBar from DiffGraft.

2. Commit log + branch graph (DAG)

3. File status and staging with hunk-level control

4. Branch management — create, rename, delete, checkout

5. Committing with message editor and amend support

6. Remote operations — fetch, pull, push

7. Stash management

8. 3-way merge editor — ours / base / theirs, click to accept hunks

9. File history and blame

10. Interactive rebase

11. Command palette (Cmd+K)

12. Submodule support

---

## v1 out of scope

Do not build these in v1. They belong to v2+.

- Entity-level diff (functions, classes)
- Auto-resolve independent changes
- Commutative parent detection
- Merge preview / dry run
- Conflict classification (Text / Syntax / Functional)
- Rename detection via AST hash
- GitHub PR integration
- Branch summary
- Cross-file dependency graph
- MCP server
- CLI interface

---

## Languages supported in v1

Start with these five. Add more in v2+.

- TypeScript / TSX
- JavaScript / JSX
- Python
- Java
- Rust

---

## Error handling pattern

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

enum AppError {
  GitOperationFailed = 'GIT_OPERATION_FAILED',
  ParseFailed = 'PARSE_FAILED',
  FileNotFound = 'FILE_NOT_FOUND',
  InvalidRepository = 'INVALID_REPOSITORY',
  MergeFailed = 'MERGE_FAILED',
}

// Usage
function doSomething(): Result<string, AppError> {
  try {
    return { ok: true, value: 'result' }
  } catch {
    return { ok: false, error: AppError.GitOperationFailed }
  }
}
```

---

## Git workflow

All work happens on feature branches from `th4tdevsid/TreeGraft`.
PRs are raised against `cyantree-git/TreeGraft` main.

```bash
# Start a feature
git checkout -b feat/file-diff-viewer

# Push and raise PR
git push origin feat/file-diff-viewer
# → open PR at github.com/th4tdevsid/TreeGraft
# → target: cyantree-git/TreeGraft main
```

Branch naming: `feat/`, `fix/`, `chore/`, `docs/`

---

## Infrastructure

- Domains: treegraft.io (Porkbun, auto-renew enabled)
- DNS: Cloudflare
- Deployment: Cloudflare Pages (web build)
- Desktop distribution: electron-builder → .dmg / .exe / .AppImage
- CI/CD: GitHub Actions → Cloudflare Pages
- Analytics: Cloudflare Web Analytics
- License: Apache 2.0

---

## Relationship to other CyanTree products

| Product | Status | What it does |
|---|---|---|
| DiffGraft (diffgraft.io) | Live | Browser-based CSV diff, Rust/WASM core |
| TreeGraft (treegraft.io) | In progress | Git GUI with structural merge intelligence |
| TraceDiff | Planned | Distributed trace diff tool |
| th4t.dev | Planned | Developer profile platform |

TreeGraft's diff viewer reuses components from DiffGraft.
In v4, the diff and merge engine will be extracted to a shared Rust/WASM core
used by both DiffGraft and TreeGraft.

---

## Competitive context

TreeGraft is the only Git GUI with structural merge intelligence.

| Tool | Type | Gap |
|---|---|---|
| Difftastic | CLI diff | No GUI, no merge |
| DiffSitter | CLI + MCP | No GUI, no merge |
| Mergiraf | CLI merge driver | No GUI, headless only |
| Weave | CLI merge driver + MCP | No GUI, built for AI agents |
| SemanticDiff | VS Code extension | No standalone GUI, no full Git workflow |
| GitHub Desktop | GUI | No structural diff or merge |
| GitKraken | GUI | No structural diff or merge, paid |
| Sourcetree | GUI | No structural diff or merge, stagnant |

---

*CyanTree Ltd — structural intelligence for developers*
