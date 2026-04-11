# TreeGraft Roadmap

> A Git GUI with structural intelligence built in from day one.

TreeGraft sees structure where other tools see text. Every version builds on this
core thesis: diffs, merges, and history should be understood at the level of
functions, classes, and entities — not lines.

---

## v1 — Complete Git GUI

**Goal:** A fast, polished Git GUI that earns a place in the developer's daily
workflow. Structural intelligence is present from day one in the diff viewer and
merge editor, but v1 is about getting the Git fundamentals right.

> First feature to build: file diff viewer — open any two files, side by side,
> syntax highlighting, F7/Shift+F7 navigation. Reuses SplitPane, FloatingNav,
> and HeaderBar from DiffGraft.

### Git workflow
- Commit log with branch graph (DAG visualisation)
- Branch management — create, rename, delete, checkout, remote tracking
- Staging and committing with hunk-level control
- Amend support
- Remote operations — fetch, pull, push, SSH + HTTPS auth
- Stash management — stash, pop, apply, drop, stash diff viewer
- File history and blame view
- Interactive rebase — drag to reorder, pick/squash/fixup/drop/edit
- Submodule support

### Diff and merge
- File diff viewer — side by side, syntax highlighting, F7/Shift+F7 navigation
- 3-way merge editor — ours / base / theirs panels, click to accept hunks
- Line-level fallback diff for unsupported file types

### UI
- Command palette (Cmd+K) — all Git actions searchable, keyboard-first
- Dark and light theme with system preference detection
- Drag and drop repository opening

### Stack
- Electron + React + TypeScript
- `isomorphic-git` for Git operations
- `web-tree-sitter` for parsing
- `diff` npm for line-level diffing
- Ports-and-adapters architecture — all diff/merge/parse logic behind
  TypeScript interfaces, swappable to WASM in a future version

---

## v2 — Structural Merge Intelligence

**Goal:** No Git GUI has this. v2 is where TreeGraft becomes the reason
developers switch. Every feature in this version is uncontested in the market.

### Structural diff
- Entity-level diff — show changes as added/modified/deleted/renamed
  functions and classes, not just lines
- Rename detection via AST structural hash — a renamed function is not a
  delete and an add
- Format + content separation — one branch reformatted, other changed logic,
  keep both without false conflicts

### Structural merge
- Merge preview — dry-run a merge before executing, show how many conflicts
  would be auto-resolved and how many remain
- Auto-resolve independent changes — two branches edited different functions,
  resolve automatically, show the user what was resolved and why
- Commutative parent detection — class fields, HTML attributes, JSON keys are
  order-independent, merge without conflict (based on Mergiraf's model)
- Duplicate key detection — catch JSON and YAML duplicate keys that Git's
  line-based merge silently introduces
- Conflict classification — label every conflict as Text, Syntax, or
  Functional (ConGra taxonomy) so the user can triage fast
- Visual explanation of auto-resolves — every automatic resolution is shown
  with a reason, not just silently applied

### GitHub integration
- PR creation from TreeGraft
- PR diff viewer with structural highlighting
- Branch summary — plain English description of what changed on a branch,
  entity-level not line-level

---

## v3 — Deep Intelligence

**Goal:** Capabilities that would take competitors years to build. Defensible
moat through cross-file understanding.

- Move and edit detection — detect code moved to a new location on one branch
  and edited on the other, replay the edits at the new location (the hardest
  merge problem, only Mergiraf solves this today and only in CLI)
- Cross-file dependency graph — track what calls what across files, built from
  tree-sitter AST walks
- Impact and blast radius analysis — before merging, show which other functions
  are affected by changes via BFS through the dependency graph
- Semantic PR review — filter formatting noise from PRs, show only meaningful
  semantic changes
- Offline PR review — sync PRs before commuting, review without a connection,
  cache diffs locally
- Auto-generated architecture diagrams — Mermaid diagrams generated from the
  tree-sitter AST, stored in Git Notes, updated on commit

---

## v4 — Ecosystem

**Goal:** Make TreeGraft the structural intelligence layer for the whole
developer ecosystem — terminal, CI, and AI agents.

- CLI interface — all TreeGraft capabilities from the terminal, scriptable,
  CI/CD ready
- MCP server — expose structural diff and merge tools to Claude Code and other
  AI coding agents (modelled on Weave's 15-tool MCP server)
- Homebrew distribution — `brew install treegraft`
- GitHub Action — run structural merge analysis in CI, block merges with
  functional conflicts, report auto-resolvable conflicts
- TreeGraft Journal — log AI coding sessions via MCP, what changed, why, and
  by which agent, stored in Git Notes
- Rust core extraction — extract the diff and merge engine to a shared
  Rust/WASM core, shared with DiffGraft, this is when the rewrite makes sense

---

## Competitive context

| Tool | Type | What it does |
|---|---|---|
| Difftastic | CLI | AST-aware diff, 60+ languages, no merge |
| DiffSitter | CLI + MCP | AST navigation, no merge, no GUI |
| Mergiraf | CLI merge driver | Structural merge, headless, no GUI |
| Weave | CLI merge driver + MCP | Entity-level merge, multi-agent CRDT, no GUI |
| SemanticDiff | VS Code + GitHub extension | Structural diff in editor, no standalone GUI |

None of these tools have a GUI. TreeGraft makes structural intelligence
accessible to every developer, not just those comfortable with CLI configuration.

---

## Architecture principles

These apply to every version.

- TypeScript owns all rendering and UI logic
- Ports-and-adapters: all computation modules sit behind TypeScript interfaces
- `src/core/interfaces/` — contracts that never change
- `src/core/adapters/js/` — JS implementations shipping today
- `src/core/adapters/wasm/` — WASM drop-in replacements, future
- `src/config/engines.ts` — the single file that wires active adapters
- UI imports from `interfaces/` only, never directly from `adapters/`
- Local-first: files never leave the machine
- No server uploads, ever
- Apache 2.0 license

---

*Part of the CyanTree suite — structural intelligence for developers.*
*cyantree.co.uk*
