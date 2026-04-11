## Roadmap

### v1 — Core Git GUI (IntelliJ parity + structural merge)
Target: months 1-4

#### Repository & Navigation
- Open any local Git repository by path
- Recent repositories list
- Repository status overview (ahead/behind, clean/dirty)
- Commit log with visual branch graph (DAG)
- Commit details: author, date, message, changed files
- Search and filter commits by message, author, date, file
- Compare any two commits
- Cherry pick a commit
- Revert a commit
- Create a tag on a commit

#### Branches
- List all local and remote branches
- Create, rename, delete branches (local and remote)
- Checkout a branch
- Compare two branches
- Mark which branch is HEAD

#### Remote Operations
- Fetch
- Pull (merge and rebase options)
- Push
- Add and remove remotes
- Manage tracking relationships

#### Stash
- Create stash with message
- Apply, pop, drop stash
- View stash diff

#### Diff and History
- Side by side diff view
- Inline diff view
- Syntax highlighting per language
- Word-level diff highlighting
- View diff for any commit
- View diff between any two branches or commits
- Full file history
- Blame view — who changed which line, when
- Navigate to commit that introduced any line

#### Staging and Committing
- Stage and unstage individual files
- Stage and unstage individual hunks
- Discard changes (file and hunk level)
- Commit with message
- Amend last commit
- Commit message history

#### Merge
- Merge any branch into current
- Abort merge in progress
- Merge commit message editing
- 3-way merge editor (ours / base / theirs)
- Accept ours / theirs / both per hunk
- Manual editing in merge editor
- Syntax highlighting in merge editor
- Mark file as resolved
- Show resolved vs remaining conflict count

#### Structural Merge Intelligence
- Auto-resolve import conflicts: Java, TypeScript, Python, Rust, Go
- Semantic conflict detection: flag methods touched by
  both branches even when Git reports no conflict
- Syntax validation of resolved output
- Corpus test harness per language

#### Rebase
- Rebase current branch onto any other
- Interactive rebase: reorder, squash, edit, drop commits
- Abort and continue rebase after conflict resolution

#### Submodules
- Show submodule status
- Update and init submodules

#### UI
- Keyboard shortcuts for all primary actions
- Command palette
- Dark and light theme
- Resizable panels
- File tree and flat list view of changes
- Jump to file from diff view
- Open file in default editor

---

### v2 — GitHub Integration + Journal
Target: months 4-7

#### GitHub Integration
- Pull request creation and review
- PR status in commit log
- CI/CD status per commit
- Issues integration

#### TreeGraft Journal
- Log every AI development session via MCP
- Store per session: prompt, AI response,
  files changed, commit SHA, branch, timestamp
- Local SQLite — never synced without explicit opt-in
- Visual dashboard: prompt → response → commit
- Search journal by file, date, branch, keyword
- Branch summary before merge:
  Plain English summary of what each branch did
  since divergence, including AI-flagged risks

#### Merge Preview
- Pre-merge hotspot detection
- Flag methods touched by both branches
  even when Git reports clean merge
- Overall merge complexity score

---

### v3 — Semantic PR Review + Diagrams
Target: months 7-10

#### Semantic PR Review
- Classify every changed file by type:
    formatting_only   → collapsed by default
    import_change     → auto-resolved if clean
    comment_change    → collapsed
    logic_change      → highlighted, shown first
    signature_change  → flagged high priority
    new_method        → flagged for attention
    deleted_method    → flagged for attention
- Surface real changes, collapse formatting noise
- Offline PR review:
    sync PRs before commute
    write review comments offline
    post review when back online

#### Auto-Generated Architecture Diagrams
- Generate system diagram on every commit
- Powered by tree-sitter — derived from code
- Stored in Git Notes — travels with repo
- Mermaid plain text format — diffs cleanly
- C4 model: system context, container, component levels
- Timeline slider — watch architecture evolve commit by commit
- Click any relationship → see the prompt that created it
- Never manually maintained

---

### v4 — MCP + CLI + Platform
Target: months 10-14

#### CLI
treegraft diff <branch-a> <branch-b>
treegraft conflicts
treegraft resolve --auto
treegraft hotspots <source> <target>
treegraft summary <branch> --since-divergence
treegraft diagram show
treegraft diagram diff HEAD~10..HEAD
treegraft journal search <query>

#### MCP Server
- resolve_conflict() — structural merge via MCP
- get_semantic_hotspots() — catch conflicts Git misses
- log_session() — journal logging from Claude Code
- preview_merge() — hotspot map before merging
- Processes locally, returns only the signal
- Compatible with Claude Code, Cursor, any MCP client
- Reduces token usage 100-200x vs reading files into context

#### Distribution
- Homebrew: brew install treegraft
- cargo install treegraft
- GitHub Action for CI/CD pipeline integration

---

### Out of Scope
- SSH key management
- Git LFS
- Multiple repositories open simultaneously
- Cloud sync of journal data without explicit opt-in
- IDE plugin (treegraft is standalone by design)
```

---

## GitHub Project Board Structure

Create this at:
```
github.com/orgs/cyantree-git/projects/new
```

Project name: **TreeGraft Roadmap**

---

### Board View — Columns
```
Backlog | v1 | v2 | v3 | v4 | Done
```

---

### Issues to Create

Create these issues and assign to columns:

---

**v1 Column**
```
#1   feat: repository open + recent list
#2   feat: commit log with branch graph (DAG)
#3   feat: branch management (create, delete, checkout)
#4   feat: remote operations (fetch, pull, push)
#5   feat: stash management
#6   feat: side by side diff viewer
#7   feat: file history and blame view
#8   feat: staging and committing with hunk support
#9   feat: 3-way merge editor
#10  feat: structural merge — Java import auto-resolve
#11  feat: structural merge — TypeScript import auto-resolve
#12  feat: structural merge — Python import auto-resolve
#13  feat: structural merge — Rust use statement auto-resolve
#14  feat: structural merge — Go import auto-resolve
#15  feat: semantic conflict detection (method-level)
#16  feat: interactive rebase
#17  feat: submodule support
#18  feat: command palette
#19  feat: dark and light theme
#20  feat: corpus test harness for all 5 languages
```

---

**v2 Column**
```
#21  feat: GitHub PR creation and review
#22  feat: CI/CD status in commit log
#23  feat: TreeGraft Journal — MCP session logging
#24  feat: TreeGraft Journal — visual dashboard
#25  feat: TreeGraft Journal — branch summary
#26  feat: merge preview — hotspot detection
```

---

**v3 Column**
```
#27  feat: semantic PR review — file classification
#28  feat: semantic PR review — formatting noise filter
#29  feat: offline PR review — sync and queue
#30  feat: auto-generated architecture diagrams
#31  feat: diagram timeline slider
#32  feat: diagram stored in Git Notes
```

---

**v4 Column**
```
#33  feat: CLI interface — all core commands
#34  feat: MCP server — resolve_conflict tool
#35  feat: MCP server — get_semantic_hotspots tool
#36  feat: MCP server — log_session tool
#37  feat: Homebrew distribution
#38  feat: GitHub Action for CI pipeline
```

---

**Backlog Column**
```
#39  research: tree-sitter grammar coverage per language
#40  research: Git Notes sync reliability
#41  research: offline PR review storage format
#42  chore: corpus test fixtures — Java (20 scenarios)
#43  chore: corpus test fixtures — TypeScript (15 scenarios)
#44  chore: corpus test fixtures — Python (15 scenarios)
#45  chore: corpus test fixtures — Rust (10 scenarios)
#46  chore: corpus test fixtures — Go (10 scenarios)
```

---

### Labels to Create
```
v1              blue        — version 1 scope
v2              purple      — version 2 scope
v3              orange      — version 3 scope
v4              red         — version 4 scope
good-first-issue green      — beginner friendly
help-wanted     yellow      — any contributor welcome
rust            brown       — requires Rust knowledge
frontend        cyan        — React/TypeScript only
structural      dark blue   — tree-sitter/AST work
corpus          grey        — test fixture work
```

---

### Milestones to Create
```
v1.0 — Core Git GUI
  Due: month 4
  Issues: #1-20

v2.0 — GitHub + Journal
  Due: month 7
  Issues: #21-26

v3.0 — Semantic Review + Diagrams
  Due: month 10
  Issues: #27-32

v4.0 — MCP + CLI + Platform
  Due: month 14
  Issues: #33-38
```

---

### Good First Issues to Add Immediately

These are safe for first-time contributors once v1 ships:
```
#50  good-first-issue: add keyboard shortcut reference panel
#51  good-first-issue: show file size in diff viewer header
#52  good-first-issue: improve error message for invalid CSV
#53  good-first-issue: add copy to clipboard for diff output
#54  good-first-issue: add noise column pattern for audit fields
