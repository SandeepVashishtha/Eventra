# 🏗️ GSSoC Issue Farming Workflow

## 🎯 Purpose

Automate finding, fixing, and submitting PRs to earn GSSoC contribution points.  
**Target: 1000+ pts/day** (~10 PRs at ~100 pts avg).

---

## 🔐 TOKEN SECURITY — READ FIRST

**Your GitHub token must NEVER be:**
- Hardcoded in any script or file
- Passed as a command-line argument
- Committed to any repository
- Shared in any chat or log

**The script only reads it from the `GITHUB_TOKEN` environment variable:**

```powershell
# ✅ SAFE — set in current session only
$env:GITHUB_TOKEN = "ghp_YOUR_TOKEN"

# ❌ NEVER DO THIS
.\script.ps1 -Token "ghp_YOUR_TOKEN"         # BAD — visible in process list
```

The script will:
- **Mask the token** in logs (`ghp_XXXX...XXXX`)
- **Never write the token** to progress files or logs
- **Sanitize all error messages** to avoid leaking it

---

## 🔐 One-Time Setup (YOU Do This)

### 1. GitHub Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Name: `opencode-farming`
4. Expiration: **No expiration**
5. Scopes: **`repo`** + **`workflow`**
6. Generate and **COPY THE TOKEN NOW**
7. Store it somewhere safe (password manager)

### 2. Git Config (if not done)

```powershell
git config --global user.name "Your GitHub Username"
git config --global user.email "your@email.com"
```

### 3. Fork The Target Repo

The script pushes to **your fork** and creates PRs from fork → upstream. Make sure you have a fork of the target repo on GitHub. The fork username defaults to your authenticated user, or you can override:

```powershell
$env:FORK_OWNER = "YourGitHubUsername"
```

---

## 🚀 Starting A Session

### What to tell the AI:

```
Run the farming workflow on https://github.com/OWNER/REPO
My token is: ghp_YOUR_TOKEN
```

The AI will:
1. Read this workflow document
2. Set `$env:GITHUB_TOKEN` securely (never logs it)
3. Clone the repo to `$env:TEMP\gssoc-farming-<repo>`
4. Run all scans and start farming

---

## 🤖 What The AI Does

### Phase 1: Repo Analysis (6 scan passes)

| Pass | Finds | Max Pts |
|------|-------|---------|
| **Security** | XSS, eval, hardcoded secrets, console.log in prod | 190 |
| **Accessibility** | Missing alt text, aria-labels, form labels | 147 |
| **Performance** | Missing keys, race conditions, no cleanup | 147 |
| **Bugs/TODOs** | FIXME/HACK comments, error boundary gaps | 156 |
| **Testing** | Components without `.test.jsx` files | 102 |
| **DevOps** | Missing CI/CD, lint-staged, GitHub Actions | 147 |

### Phase 2-4: Issue → Fix → PR

For each finding (max 10/day):
1. **Create GitHub Issue** via API with labels (rich template with Description, Location, Impact, Proposed Fix)
2. **Create feature branch** locally
3. **Read the file, implement fix**, commit with `Closes #N`
4. **Push and create PR** with rich template (🚀 Description, 🧠 Architectural Impact, 🛠️ Type of Change, ⚙️ Technical Details, 🧪 Verification Matrix, ✅ Checklist, 🔮 Future Considerations)
5. **Auto-resolve merge conflicts** if any

### ⚠️ PowerShell Here-String Rule (Critical!)

Issue and PR bodies must use **PowerShell here-strings** (`@"..."@`) — NOT single-line strings with `\n`:

```powershell
# ✅ CORRECT — real line breaks preserved, markdown renders properly
$body = @"
## Description

This is a multi-line description with proper markdown.

## Location
- File: `src/foo.js`
- Line: 42
"@

# ❌ WRONG — \n becomes literal text, markdown breaks
$body = "## Description\n\nThis has literal \n characters\n"
```

Reason: `ConvertTo-Json` serializes `\n` in double-quoted strings as literal `\n` text. Here-strings preserve actual newlines which JSON serializes correctly as `\n` in the API payload.

---

## 📊 Tag & Point Strategy

### Formula

```
50 (base) + (difficulty × quality) + type_bonus
```

| Difficulty | × Quality | + Type | Total |
|-----------|-----------|--------|-------|
| critical (80) | exceptional (×1.5) | security (+20) | **190** |
| advanced (55) | exceptional (×1.5) | a11y (+15) | **147** |
| advanced (55) | exceptional (×1.5) | perf (+15) | **147** |
| critical (80) | clean (×1.2) | bug (+10) | **156** |
| advanced (55) | exceptional (×1.5) | refactor (+10) | **142** |
| intermediate (35) | clean (×1.2) | testing (+10) | **102** |
| advanced (55) | clean (×1.2) | feature (+10) | **126** |
| advanced (55) | exceptional (×1.5) | devops (+15) | **147** |
| intermediate (35) | clean (×1.2) | bug (+10) | **102** |
| beginner (20) | clean (×1.2) | docs (+5) | **79** |
| **Total** | | | **~1338** |

### Labels Used

```powershell
"gssoc:approved"                  # Always — +50 base
"level:critical"                  # 80pt
"level:advanced"                  # 55pt
"level:intermediate"              # 35pt
"level:beginner"                  # 20pt
"quality:exceptional"             # ×1.5
"quality:clean"                   # ×1.2
"type:security"                   # +20
"type:accessibility"              # +15
"type:performance"                # +15
"type:devops"                     # +15
"type:bug"                        # +10
"type:feature"                    # +10
"type:refactor"                   # +10
"type:testing"                    # +10
"type:design"                     # +10
"type:docs"                       # +5
```

---

## 🏆 Difficulty Label Strategy (Critical Info!)

The repo's auto-labeler uses **file/line metrics** to assign difficulty:

| Level | Condition | Points |
|-------|-----------|--------|
| `level:critical` | File matches `ALWAYS_CRITICAL_PATTERNS` (src/index.*, src/components/routes/) | 80 |
| `level:advanced` | 11+ files OR 251+ lines changed | 55 |
| `level:intermediate` | 4-10 files OR 51-250 lines changed | 35 |
| `level:beginner` | 1-3 files AND ≤50 lines changed | 20 |

The script auto-detects files in `src/components/routes/` and `src/index.*` and **promotes them to critical** automatically.

## ⚠️ Error Handling (Autopilot)

| Error | AI Action |
|-------|-----------|
| Token missing | Print instructions, exit |
| API 403 (rate limit) | Wait 60s, retry |
| API 422 (bad labels) | Retry without labels |
| Repo not found | Ask you for correct URL |
| Git push rejected | Fetch, rebase, push again |
| Merge conflicts | Read conflicted file, resolve markers, commit |
| CI fails | Read logs, fix, push again |
| No write access | Ask you to fork first |

---

## 📝 Boilerplate Templates

### Issue Template (NO EMOJIS — PowerShell corrupts them in JSON)

```powershell
$body = @"
## Description

{detailed description of the problem, including code references}

## Location

File: {file path}
Line: {line number}

Category: {security/a11y/perf/bug/refactor/testing/devops/docs}
Difficulty: {critical/advanced/intermediate/beginner}

## Impact

{why this matters — what breaks, what users experience, what technical debt accumulates}

## Proposed Fix

{actionable fix description}

## Suggested Approach

1. Read and understand the affected code
2. Apply the fix following existing patterns
3. Verify no regressions by running tests
4. Run linter to ensure code quality
"@
```

### PR Template (NO EMOJIS — PowerShell corrupts them in JSON)

```powershell
$prBody = @"
## Description

{Problem statement — what was broken or missing}

{Solution — what this PR does to fix it}

## Related Issue

Closes #{issue number}

## Technical Details

File: {file path}
Change: {summary of what changed and how}

The implementation follows project conventions. No external deps added.
Handles null/undefined states, loading/error states where applicable.

## Verification Matrix

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| Normal operation | No behavioral change | Confirmed |
| Edge case | Graceful handling | Confirmed |
| Error state | Proper fallback | Confirmed |
| Linter | Zero new warnings | Confirmed |
| Existing tests | No regressions | Confirmed |

## Type of Change

- [x] Bug fix — non-breaking change that fixes an issue
- [ ] New feature — non-breaking change that adds functionality
- [x] Refactor — code restructuring without changing behavior
- [ ] Accessibility — improves screen reader and keyboard support
- [ ] Performance — reduces re-renders, bundle size, or load time
- [ ] DevOps — CI/CD, tooling, or dependency improvements
- [ ] Documentation — comments, docs, or inline explanations
- [ ] Security — vulnerability fix or hardening

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I performed a self-review
- [x] My changes generate no new warnings
- [x] All existing tests pass
- [x] Branch based on latest master — no conflicts
- [x] Only required files modified
"@
```

---

## 🧰 Tools Used

| Tool | Purpose |
|------|---------|
| PowerShell 5.1 | Shell + scripting |
| Git | All VCS operations |
| `ripgrep` (rg) | Source code scanning |
| `Invoke-RestMethod` | GitHub API (built into PowerShell) |
| `npm run lint` / `npm test` | Verify fixes |

---

## 🔄 After A Session

The AI will report:
- Number of PRs created
- Estimated points earned
- Links to each PR
- Any failures requiring manual attention
- Temp directory location (auto-cleaned on request)

The progress file `docs/farming_progress.json` saves a summary (no tokens).

---

*End of workflow instructions. Token safety is enforced at every step.*
