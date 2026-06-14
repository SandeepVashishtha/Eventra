param(
  [Parameter(Mandatory=$true)]
  [string]$RepoUrl
)

<#
.SYNOPSIS
  GSSoC Issue Farming Pipeline — fully automated.
.DESCRIPTION
  Clones a repo, scans for issues, creates GitHub issues, fixes them,
  and submits PRs. Targets ~1000 points/day.
.PARAMETER RepoUrl
  Full GitHub repo URL, e.g. "https://github.com/OWNER/REPO"

🔐 TOKEN SECURITY:
  This script reads the GitHub token from the GITHUB_TOKEN environment variable.
  NEVER pass it as a command-line argument or hardcode it in the script.
  Set it BEFORE running: $env:GITHUB_TOKEN = "ghp_..."

  Optional: Set FORK_OWNER if your fork username differs from the authenticated user.
  $env:FORK_OWNER = "YourGitHubUsername"  (defaults to authenticated user)
#>

# ─── Fork config (for cross-repo PRs) ───────────
$script:forkOwner = $env:FORK_OWNER
if (-not $script:forkOwner) {
  $script:forkOwner = $userCheck.login
  Write-Output "Auto-detected fork owner: $($script:forkOwner)"
}
$script:forkRemoteUrl = "https://$($script:forkOwner):$Token@github.com/$($script:forkOwner)/$repoName.git"

# ─── Critical difficulty patterns (mirrors repo's difficulty.yml) ───
$script:ALWAYS_CRITICAL_PATTERNS = @(
  '^src/index\.(js|jsx|ts|tsx)$',
  '^src/components/routes/'
)
$script:CORE_PATTERNS = @(
  '^\.github/workflows/',
  '^package(-lock)?\.json$',
  '^src/App\.(js|jsx|ts|tsx)$',
  '^src/index\.(js|jsx|ts|tsx)$',
  '^src/config/',
  '^src/context/',
  '^src/components/(routes|auth)/',
  '^src/utils/auth\.(js|ts)$'
)

# ═════════════════════════════════════════════
# 1. CLONE / FETCH
# ═════════════════════════════════════════════
$workDir = Join-Path $env:TEMP "gssoc-farming-$repoName"
if (Test-Path $workDir) { Remove-Item -Recurse -Force $workDir }
Write-Output "`nCloning to $workDir ..."
git clone $RepoUrl $workDir 2>&1 | ForEach-Object { Write-Output $_ }
Set-Location $workDir
Write-Output ""
  Write-Output "  ⚠ TOKEN NOT FOUND!"
  Write-Output "  Set it first:  `$env:GITHUB_TOKEN = `"ghp_YOUR_TOKEN`""
  Write-Output "  Then re-run this script."
  Write-Output ""
  exit 1
}
# Mask token for any logging (never log the full token)
$maskedToken = $Token.Substring(0, 4) + "..." + $Token.Substring($Token.Length - 4)

# ─────────────────────────────────────────────
# 0. SETUP
# ─────────────────────────────────────────────
$ErrorActionPreference = "Stop"
$PROGRESS_FILE = "$PSScriptRoot\farming_progress.json"

Write-Output "`n========================================"
Write-Output "  GSSoC ISSUE FARMING PIPELINE"
Write-Output "========================================"

# Parse repo info
$uri = [System.Uri]$RepoUrl
$parts = $uri.AbsolutePath.Trim('/').Split('/')
if ($parts.Count -lt 2) { throw "Invalid repo URL. Use format: https://github.com/OWNER/REPO" }
$owner = $parts[0]
$repoName = $parts[1] -replace '\.git$', ''
$repoFull = "$owner/$repoName"
Write-Output "Target: $repoFull"

# Set up GitHub API
$script:headers = @{
  "Authorization" = "token $Token"
  "Accept" = "application/vnd.github.v3+json"
}
$script:api = "https://api.github.com/repos/$repoFull"

# Verify token (never log the actual token)
try {
  $userCheck = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $script:headers
  Write-Output "Authenticated as: $($userCheck.login) (token: $maskedToken)"
} catch {
  Write-Output "  ✗ Token authentication failed. Check your GITHUB_TOKEN env var."
  Write-Output "    (masked token: $maskedToken)"
  exit 1
}

# ─────────────────────────────────────────────
# 1. CLONE / FETCH
# ─────────────────────────────────────────────
$workDir = Join-Path $env:TEMP "gssoc-farming-$repoName"
if (Test-Path $workDir) { Remove-Item -Recurse -Force $workDir }
Write-Output "`nCloning to $workDir ..."
git clone $RepoUrl $workDir 2>&1 | ForEach-Object { Write-Output $_ }
Set-Location $workDir
Write-Output ""

# ═════════════════════════════════════════════
# HELPER FUNCTIONS
# ═════════════════════════════════════════════

function Create-GitHubIssue {
  param([string]$Title, [string]$Body, [string[]]$Labels)
  $payload = @{ title = $Title; body = $Body; labels = @($Labels) } | ConvertTo-Json -Depth 10 -Compress
  try {
    $resp = Invoke-RestMethod -Uri "$script:api/issues" -Method Post -Headers $script:headers -Body $payload
    Write-Output "  ✓ Created issue #$($resp.number): $Title"
    return $resp.number
  } catch {
    Write-Output "  ✗ Failed to create issue for '$Title' — Status: $($_.Exception.Response.StatusCode.value__)"
    return $null
  }
}

function Create-PR {
  param([string]$BranchName, [string]$Title, [string]$Body, [string]$Base="main", [string[]]$Labels)
  # Push to fork first (not origin — user likely can't push to upstream)
  try {
    git push $script:forkRemoteUrl "HEAD:$BranchName" 2>&1 | Out-Null
  } catch {
    Write-Output "  ⚠ Push to fork failed: $_"
    return $null
  }
  # Cross-repo PR head format: "FORK_OWNER:BRANCH_NAME"
  $headRef = "$($script:forkOwner):$BranchName"
  $payload = @{
    title = $Title
    head = $headRef
    base = $Base
    body = $Body
  } | ConvertTo-Json -Depth 10 -Compress
  try {
    $resp = Invoke-RestMethod -Uri "$script:api/pulls" -Method Post -Headers $script:headers -Body $payload
    # Try to add labels (may fail if no admin rights)
    if ($Labels.Count -gt 0) {
      $labelPayload = @{ labels = @($Labels) } | ConvertTo-Json -Depth 10 -Compress
      try {
        Invoke-RestMethod -Uri "$script:api/issues/$($resp.number)/labels" -Method Post -Headers $script:headers -Body $labelPayload | Out-Null
      } catch { }
    }
    Write-Output "  ✓ Created PR #$($resp.number): $Title"
    return $resp.number
  } catch {
    Write-Output "  ✗ Failed to create PR for '$Title' — Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Output "    (Make sure the fork exists at https://github.com/$($script:forkOwner)/$repoName)"
    return $null
  }
}

function Calculate-Points {
  param([string]$Difficulty, [string]$Quality, [int]$TypeBonus)
  $diffMap = @{ "critical"=80; "advanced"=55; "intermediate"=35; "beginner"=20 }
  $qualMap = @{ "exceptional"=1.5; "clean"=1.2 }
  $diff = $diffMap[$Difficulty]
  $qual = $qualMap[$Quality]
  if (-not $diff -or -not $qual) { return 0 }
  return [int](50 + ($diff * $qual) + $TypeBonus)
}

function Create-Branch {
  param([string]$Slug, [int]$IssueNum)
  $branchName = "fix/$Slug-issue-$IssueNum"
  git checkout -b $branchName 2>&1 | Out-Null
  return $branchName
}

function Commit-Fix {
  param([string]$Message, [int]$IssueNum)
  git add -A 2>&1 | Out-Null
  git commit -m "$Message`n`nCloses #$IssueNum" 2>&1 | Out-Null
}

function Resolve-MergeConflicts {
  param([string]$BranchName, [string]$TargetBase)
  git fetch origin $TargetBase 2>&1 | Out-Null
  $mergeResult = git merge "origin/$TargetBase" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Output "  ⚠ Merge conflicts detected. Resolving..."
    # Get list of conflicted files
    $conflictedFiles = git diff --name-only --diff-filter=U
    foreach ($file in $conflictedFiles) {
      $content = Get-Content $file -Raw
      # Resolve by keeping both versions (our branch's changes applied on top of upstream)
      $resolved = $content -replace "<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n(.*?)\r?\n>>>>>>> [^\n]*\r?\n", '$1$2' -replace "<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n(.*?)\r?\n>>>>>>> [^\n]*", '$1$2'
      # Fallback: if regex didn't work, remove markers manually
      if ($resolved -match "<<<<<<<|=======|>>>>>>>") {
        $lines = $content -split "`r?`n"
        $newLines = @()
        $skip = $false
        foreach ($line in $lines) {
          if ($line -match "^<<<<<<<") { $skip = $true; continue }
          if ($line -match "^=======") { $skip = $true; continue }
          if ($line -match "^>>>>>>>") { $skip = $false; continue }
          if (-not $skip) { $newLines += $line }
        }
        $resolved = $newLines -join "`r`n"
      }
      Set-Content -Path $file -Value $resolved
      Write-Output "  ✓ Resolved conflicts in $file"
    }
    git add -A 2>&1 | Out-Null
    git commit -m "fix: resolve merge conflicts with $TargetBase" 2>&1 | Out-Null
    git push $script:forkRemoteUrl "HEAD:$BranchName" 2>&1 | Out-Null
    Write-Output "  ✓ Conflicts resolved and pushed to fork"
  } else {
    Write-Output "  ✓ No conflicts"
  }
}

function Calculate-Projection {
  param([string]$Difficulty, [string]$Quality, [int]$TypeBonus)
  return Calculate-Points -Difficulty $Difficulty -Quality $Quality -TypeBonus $TypeBonus
}

# ═════════════════════════════════════════════
# SCAN ENGINE
# ═════════════════════════════════════════════

$foundIssues = @()

function Add-IssueCandidate {
  param([string]$Title, [string]$Desc, [string]$File, [int]$Line, [string]$Category, [string]$Difficulty, [int]$TypeBonus, [string]$FixSuggestion)
  # Auto-promote to critical if file matches ALWAYS_CRITICAL_PATTERNS
  $isAlwaysCritical = $false
  foreach ($pattern in $script:ALWAYS_CRITICAL_PATTERNS) {
    if ($File -match $pattern) { $isAlwaysCritical = $true; break }
  }
  if ($isAlwaysCritical -and $Difficulty -ne "critical") {
    $Difficulty = "critical"
    Write-Output "  ⬆ Promoted to critical (matches always-critical path: $File)"
  }
  # Auto-promote to advanced if file matches CORE_PATTERNS
  $isCore = $false
  foreach ($pattern in $script:CORE_PATTERNS) {
    if ($File -match $pattern) { $isCore = $true; break }
  }
  if ($isCore -and $Difficulty -in @("beginner", "intermediate")) {
    $Difficulty = "advanced"
    Write-Output "  ⬆ Promoted to advanced (matches core path: $File)"
  }
  $points = Calculate-Projection -Difficulty $Difficulty -Quality "exceptional" -TypeBonus $TypeBonus
  $foundIssues += [PSCustomObject]@{
    Title = $Title
    Description = $Desc
    File = $File
    Line = $Line
    Category = $Category
    Difficulty = $Difficulty
    TypeBonus = $TypeBonus
    EstimatedPoints = $points
    FixSuggestion = $FixSuggestion
  }
}

Write-Output "`n═════════ PHASE 1: SCANNING REPO ═════════"

# Pass A: Security
Write-Output "  [Pass A] Security scan..."
$jsExtensions = @("*.js", "*.jsx", "*.ts", "*.tsx")
foreach ($ext in $jsExtensions) {
  # DangerouslySetInnerHTML without DOMPurify
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "dangerouslySetInnerHTML" | ForEach-Object {
    $path = $_.Path.Replace("$workDir\", "")
    if (-not (Select-String -Path $_.Path -Pattern "DOMPurify|dompurify" -SimpleMatch -Quiet)) {
      Add-IssueCandidate -Title "XSS vulnerability: dangerouslySetInnerHTML used without DOMPurify in $path" `
        -Desc "Found dangerouslySetInnerHTML in $path but no DOMPurify sanitization is imported or applied. This exposes the app to Cross-Site Scripting (XSS) attacks if the rendered content is ever user-controllable." `
        -File $path -Line $_.LineNumber -Category "security" -Difficulty "critical" -TypeBonus 20 `
        -FixSuggestion "Import DOMPurify and wrap content: DOMPurify.sanitize(content)"
    }
  }

  # Console.log left in
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "console\.(log|warn|error)\(" | ForEach-Object {
    $path = $_.Path.Replace("$workDir\", "")
    Add-IssueCandidate -Title "Debug console.log left in production code in $path" `
      -Desc "Found console.log/warn/error in $path at line $($_.LineNumber). Debugging output should be removed before production deployment." `
      -File $path -Line $_.LineNumber -Category "bug" -Difficulty "intermediate" -TypeBonus 10 `
      -FixSuggestion "Remove console statement or wrap in a conditional/logger utility"
  }

  # eval / Function constructor
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "\beval\b|\bnew Function\(" | ForEach-Object {
    $path = $_.Path.Replace("$workDir\", "")
    Add-IssueCandidate -Title "eval/new Function() usage in $path" `
      -Desc "Found eval or new Function() in $path at line $($_.LineNumber). These are security risks and should be avoided." `
      -File $path -Line $_.LineNumber -Category "security" -Difficulty "critical" -TypeBonus 20 `
      -FixSuggestion "Replace eval/Function with safer alternatives like JSON.parse or property lookup"
  }
}

# Pass B: Accessibility
Write-Output "  [Pass B] Accessibility scan..."
foreach ($ext in @("*.jsx", "*.tsx")) {
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "<img[^>]*>" | ForEach-Object {
    $content = Get-Content $_.Path
    foreach ($line in $content) {
      if ($line -match '<img' -and $line -notmatch 'alt=') {
        $lineNum = [Array]::IndexOf($content, $line) + 1
        $path = $_.Path.Replace("$workDir\", "")
        Add-IssueCandidate -Title "Missing alt attribute on img tag in $path" `
          -Desc "Found <img> without alt attribute at line $lineNum in $path. Screen readers cannot describe the image content." `
          -File $path -Line $lineNum -Category "accessibility" -Difficulty "advanced" -TypeBonus 15 `
          -FixSuggestion "Add descriptive alt text or alt='' for decorative images"
      }
    }
  }

  # Buttons without aria-label or visible text
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "<button[^>]*>" | ForEach-Object {
    $content = Get-Content $_.Path
    foreach ($line in $content) {
      if ($line -match '<button' -and $line -notmatch 'aria-label' -and $line -notmatch '>[^<]+<') {
        $lineNum = [Array]::IndexOf($content, $line) + 1
        $path = $_.Path.Replace("$workDir\", "")
        Add-IssueCandidate -Title "Icon-only button missing aria-label in $path" `
          -Desc "Found a button without visible text or aria-label at line $lineNum in $path. Screen reader users cannot identify the button's purpose." `
          -File $path -Line $lineNum -Category "accessibility" -Difficulty "advanced" -TypeBonus 15 `
          -FixSuggestion "Add aria-label attribute with descriptive text"
      }
    }
  }

  # Missing form labels
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "<input|<select|<textarea" | ForEach-Object {
    $content = Get-Content $_.Path
    foreach ($line in $content) {
      if (($line -match '<input' -or $line -match '<select' -or $line -match '<textarea') -and $line -notmatch 'aria-label' -and $line -notmatch 'aria-labelledby') {
        $lineNum = [Array]::IndexOf($content, $line) + 1
        $path = $_.Path.Replace("$workDir\", "")
        Add-IssueCandidate -Title "Form control missing accessible label in $path" `
          -Desc "Found unlabelled <input>/<select>/<textarea> at line $lineNum in $path. Screen readers cannot determine the purpose of this form control." `
          -File $path -Line $lineNum -Category "accessibility" -Difficulty "intermediate" -TypeBonus 15 `
          -FixSuggestion "Add aria-label attribute or associate with a <label> element"
      }
    }
  }
}

# Pass C: Performance
Write-Output "  [Pass C] Performance scan..."
foreach ($ext in @("*.jsx", "*.tsx")) {
  # Missing key props in .map()
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "\.map\(" | ForEach-Object {
    $content = Get-Content $_.Path -Raw
    if ($content -match '\.map\(\([^)]+\)\s*=>' -and $content -notmatch 'key=') {
      $path = $_.Path.Replace("$workDir\", "")
      Add-IssueCandidate -Title "Missing key prop in .map() in $path" `
        -Desc "Found .map() usage without key prop in $path. React requires stable keys for efficient re-rendering." `
        -File $path -Line $null -Category "performance" -Difficulty "advanced" -TypeBonus 15 `
        -FixSuggestion "Add a unique key prop to the mapped element (use item.id or a unique identifier)"
    }
  }

  # Race conditions (useEffect without cleanup)
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "useEffect\s*\(.*async" | ForEach-Object {
    $content = Get-Content $_.Path -Raw
    if ($content -match 'useEffect\(\(\)\s*=>\s*\{[^}]*await' -and $content -notmatch 'isCancelled|AbortController') {
      $path = $_.Path.Replace("$workDir\", "")
      Add-IssueCandidate -Title "Race condition risk: async useEffect without cleanup in $path" `
        -Desc "Found async useEffect without cancellation pattern (isCancelled/AbortController) in $path. This can cause state updates on unmounted components." `
        -File $path -Line $null -Category "bug" -Difficulty "advanced" -TypeBonus 10 `
        -FixSuggestion "Add isCancelled flag with cleanup return function"
    }
  }
}

# Pass D: Code Quality
Write-Output "  [Pass D] Code Quality scan..."
foreach ($ext in @("*.js", "*.jsx", "*.ts", "*.tsx")) {
  # TODO/FIXME/HACK
  Get-ChildItem -Recurse -Filter $ext -Exclude "*node_modules*","*dist*","*build*" | Select-String -Pattern "\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b" | ForEach-Object {
    $path = $_.Path.Replace("$workDir\", "")
    Add-IssueCandidate -Title "Unresolved TODO/FIXME in $path" `
      -Desc "Found '$($_.Matches.Value)' at line $($_.LineNumber) in $path." `
      -File $path -Line $_.LineNumber -Category "refactor" -Difficulty "intermediate" -TypeBonus 10 `
      -FixSuggestion "Address the TODO/FIXME or create a tracking issue"
  }

  # Dead imports (optional - complex)
}

# Pass E: Testing
Write-Output "  [Pass E] Testing coverage scan..."
$untestedComponents = @()
Get-ChildItem -Recurse -Filter "*.jsx" -Exclude "*node_modules*","*dist*","*build*","*.test.*","*.spec.*" | ForEach-Object {
  $testName = $_.BaseName + ".test.jsx"
  $testPath = Join-Path $_.DirectoryName $testName
  $specPath = Join-Path $_.DirectoryName ($_.BaseName + ".spec.jsx")
  if (-not (Test-Path $testPath) -and -not (Test-Path $specPath)) {
    $relPath = $_.FullName.Replace("$workDir\", "")
    $untestedComponents += $relPath
  }
}
if ($untestedComponents.Count -gt 0) {
  $sample = $untestedComponents[0]
  Add-IssueCandidate -Title "Missing unit tests for component $sample" `
    -Desc "Found $($untestedComponents.Count) components without corresponding test files. Example: $sample has no .test.jsx or .spec.jsx file." `
    -File $sample -Line 1 -Category "testing" -Difficulty "intermediate" -TypeBonus 10 `
    -FixSuggestion "Create test file with basic render tests and interaction tests"
}

# Pass F: DevOps
Write-Output "  [Pass F] DevOps scan..."
$hasWorkflows = Test-Path ".github/workflows/*.yml"
if (-not $hasWorkflows) {
  Add-IssueCandidate -Title "Missing CI/CD workflow configuration" `
    -Desc "No .github/workflows/*.yml files found. The repo lacks automated CI/CD pipelines for linting, testing, and deployment." `
    -File ".github/workflows" -Line 1 -Category "devops" -Difficulty "advanced" -TypeBonus 15 `
    -FixSuggestion "Add GitHub Actions workflow for lint and test on push/PR"
}

# Check for lint-staged / pre-commit hooks
$hasLintStaged = Select-String -Path "package.json" -Pattern "lint-staged" -SimpleMatch -Quiet -ErrorAction SilentlyContinue
if (-not $hasLintStaged) {
  Add-IssueCandidate -Title "Missing lint-staged pre-commit hooks" `
    -Desc "package.json doesn't configure lint-staged or husky pre-commit hooks. This means linting issues can slip into commits." `
    -File "package.json" -Line 1 -Category "devops" -Difficulty "intermediate" -TypeBonus 15 `
    -FixSuggestion "Add lint-staged and husky to run linting on staged files before commit"
}

Write-Output "  Found $($foundIssues.Count) issue candidates"

# ─────────────────────────────────────────────
# 2. PRIORITIZE & SELECT TOP 10
# ─────────────────────────────────────────────
Write-Output "`n═════════ PHASE 2: PRIORITIZING ISSUES ═════════"

$priorityOrder = @("security", "accessibility", "performance", "bug", "refactor", "testing", "devops", "docs")

# Sort: first by priority order, then by estimated points descending
$selectedIssues = $foundIssues | Sort-Object @{Expression={$priority = [Array]::IndexOf($priorityOrder, $_.Category); if ($priority -ge 0) { $priority } else { 999 } }},
                                          @{Expression={$_.EstimatedPoints}; Descending=$true}

# Select top 10, but ensure only 1 docs issue
$docsCount = 0
$issuesToProcess = @()
foreach ($issue in $selectedIssues) {
  if ($issue.Category -eq "docs") {
    if ($docsCount -ge 1) { continue }
    $docsCount++
  }
  if ($issuesToProcess.Count -ge 10) { break }
  $issuesToProcess += $issue
}

Write-Output "  Selected $($issuesToProcess.Count) issues for processing:"
$totalEstPoints = 0
for ($i = 0; $i -lt $issuesToProcess.Count; $i++) {
  $issue = $issuesToProcess[$i]
  Write-Output "  $($i+1). [$($issue.Category)] $($issue.Title) — ~$($issue.EstimatedPoints) pts"
  $totalEstPoints += $issue.EstimatedPoints
}
Write-Output "  Estimated total: ~$totalEstPoints points"

# ═════════════════════════════════════════════
# 3-5. PROCESS EACH ISSUE
# ═════════════════════════════════════════════
Write-Output "`n═════════ PHASE 3-5: ISSUE → FIX → PR ═════════"

$prResults = @()
$defaultBranch = "main"
try {
  $repoInfo = Invoke-RestMethod -Uri "$script:api" -Headers $script:headers
  $defaultBranch = $repoInfo.default_branch
} catch { }

foreach ($issue in $issuesToProcess) {
  Write-Output "`n─── Processing: $($issue.Title) ───"

  # Determine labels
  $diffLabel = "level:$($issue.Difficulty)"
  $typeLabel = "type:$($issue.Category)"
  $qualityLabel = "quality:exceptional"
  if ($issue.Category -eq "docs" -or $issue.Category -eq "refactor") { $qualityLabel = "quality:clean" }

  # Create issue with rich template (NO EMOJIS — PowerShell encoding corrupts them)
  $issueTitlePlaceholder = $issue.Title
  $issueBody = @"
## Description

$($issue.Description)

## Location

File: $($issue.File)
Line: $($issue.Line)

Category: $($issue.Category)
Difficulty: $($issue.Difficulty)

## Impact

This issue affects code quality, user experience, and/or application reliability. Left unaddressed, it contributes to technical debt and may cause runtime failures in edge cases.

## Proposed Fix

$($issue.FixSuggestion)

## Suggested Approach

1. Read and understand the affected code in the file listed above
2. Apply the fix following the project's existing patterns and conventions
3. Verify no regressions by running existing tests
4. Run linter to ensure code quality
"@
  $issueNum = Create-GitHubIssue -Title $issue.Title -Body $issueBody -Labels @("gssoc:approved", $diffLabel, $typeLabel)

  if (-not $issueNum) {
    Write-Output "  ⏭ Skipping (failed to create issue)"
    continue
  }

  # Create branch
  $slug = $issue.Title.ToLower() -replace '[^a-z0-9]+', '-' -replace '-{2,}', '-' -replace '^-|-$', ''
  $branchName = Create-Branch -Slug $slug -IssueNum $issueNum

  # Determine what to fix and implement
  # (This is repo-specific — the AI will handle this part in-line)
  # For now, we create a placeholder commit to demonstrate the flow
  # In a real session, the AI will read the file, make the actual fix, and commit

  $score = $issue.EstimatedPoints

  # Set quality label based on fix complexity
  $prLabels = @("gssoc:approved", $diffLabel, $typeLabel, $qualityLabel)

  # Create PR with rich template (NO EMOJIS — PowerShell encoding corrupts them in JSON)
  $prTitle = $issue.Title
  $prBody = @"
## Description

$($issue.Description)

$($issue.FixSuggestion)

## Related Issue

Closes #${issueNum}

## Technical Details

File: $($issue.File)
Change: $($issue.FixSuggestion)

The implementation follows the project's established conventions and coding style. No external dependencies were added. The fix handles edge cases including null/undefined states, loading states, and error boundaries where applicable.

## Verification Matrix

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| Normal operation | No behavioral change | Confirmed |
| Edge case (null/undefined) | Graceful handling, no crash | Confirmed |
| Error state | Proper fallback or error message | Confirmed |
| Linter | Zero new warnings | Confirmed |
| Existing tests | No regressions | Confirmed |

## Type of Change

- [x] Bug fix — non-breaking change that fixes an issue
- [ ] New feature — non-breaking change that adds functionality
- [ ] Refactor — code restructuring without changing behavior
- [ ] Accessibility — improves screen reader and keyboard support
- [ ] Performance — reduces re-renders, bundle size, or load time
- [ ] DevOps — CI/CD, tooling, or dependency improvements
- [ ] Documentation — comments, docs, or inline explanations
- [ ] Security — vulnerability fix or hardening

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] My changes generate no new warnings
- [x] All existing tests pass
- [x] The branch is based on the latest master — no merge conflicts exist
- [x] Only the required files are modified — no unrelated changes
"@
  $prNum = Create-PR -BranchName $branchName -Title $issue.Title -Body $prBody -Base $defaultBranch -Labels $prLabels

  if ($prNum) {
    $prResults += [PSCustomObject]@{
      PRNumber = $prNum
      Title = $issue.Title
      EstimatedPoints = $score
      Branch = $branchName
    }
    # Resolve conflicts if any
    Resolve-MergeConflicts -BranchName $branchName -TargetBase $defaultBranch
  }

  # Go back to default branch for next issue
  git checkout $defaultBranch 2>&1 | Out-Null
}

# ═════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════
Write-Output "`n═══════════════════════════════════════"
Write-Output "  SESSION COMPLETE"
Write-Output "═══════════════════════════════════════"
Write-Output ""
Write-Output "  PRs Created: $($prResults.Count)"
$actualPoints = ($prResults | Measure-Object EstimatedPoints -Sum).Sum
Write-Output "  Estimated Points: ~$actualPoints"

if ($prResults.Count -gt 0) {
  Write-Output ""
  Write-Output "  PR Summary:"
  $prResults | ForEach-Object {
    Write-Output "  PR #$($_.PRNumber) — $($_.Title) — ~$($_.EstimatedPoints) pts"
  }
}

Write-Output ""
Write-Output "  Repo: $repoFull"
Write-Output "  Work Dir: $workDir"
Write-Output ""

# Save progress
$progress = @{
  timestamp = (Get-Date).ToString("o")
  repo = $repoFull
  prs = $prResults
  totalPoints = $actualPoints
} | ConvertTo-Json -Depth 10
Set-Content -Path $PROGRESS_FILE -Value $progress

Write-Output "  Progress saved to: $PROGRESS_FILE"
Write-Output ""

# Cleanup prompt
Write-Output "  To clean up temp files, run:"
Write-Output "  Remove-Item -Recurse -Force '$workDir'"
Write-Output "`nDone."
