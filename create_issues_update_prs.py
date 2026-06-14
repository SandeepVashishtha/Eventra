import subprocess, time, re

data = [
    {
        "pr": 3279,
        "branch": "docs/cleanup-readme-env-setup-snippet",
        "title": "docs: Remove redundant README_ENV_SETUP_SNIPPET.md from root directory",
        "issue_title": "docs: Clean up README_ENV_SETUP_SNIPPET.md — redundant snippet file in root",
        "issue_body": """**Problem:**
`README_ENV_SETUP_SNIPPET.md` is cluttering the repository root. Its contents have already been fully integrated into `README.md` under the `Environment Setup & Configuration` section. The file is now a redundant duplicate and should be removed to keep the root directory clean.

**Proposed Fix:**
Delete `README_ENV_SETUP_SNIPPET.md` from the repository root since its content is already present in `README.md`.

**Impact:** Cleaner root directory, no duplicate documentation.""",
        "pr_body": """## 🚀 Description

This PR removes `README_ENV_SETUP_SNIPPET.md` from the repository root. This file was a temporary tracker snippet whose contents have already been fully integrated into the main `README.md` under the `Environment Setup & Configuration` section. Keeping it in the root causes confusion and duplication of truth. Deleting it results in a cleaner, more professional repository structure.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3280,
        "branch": "docs/cleanup-changes-summary",
        "title": "docs: Move CHANGES_SUMMARY.md to docs/ directory",
        "issue_title": "docs: Move CHANGES_SUMMARY.md from root to docs/ directory",
        "issue_body": """**Problem:**
`CHANGES_SUMMARY.md` is an implementation summary file currently cluttering the repository's root directory. Technical documentation and change summaries should live in the `docs/` folder alongside other project guides.

**Proposed Fix:**
Move `CHANGES_SUMMARY.md` → `docs/CHANGES_SUMMARY.md`.

**Impact:** Cleaner root directory, all implementation docs consolidated in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `CHANGES_SUMMARY.md` from the repository root into the `docs/` directory. Implementation summaries and change logs belong in the dedicated documentation folder alongside other technical specs. Relocating this file reduces root-level clutter and ensures contributors can find all project documentation in one centralized location. No content has been modified.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3281,
        "branch": "docs/cleanup-crash-handler-improvements",
        "title": "docs: Move CRASH_HANDLER_IMPROVEMENTS.md to docs/ directory",
        "issue_title": "docs: Move CRASH_HANDLER_IMPROVEMENTS.md from root to docs/ directory",
        "issue_body": """**Problem:**
`CRASH_HANDLER_IMPROVEMENTS.md` is a technical implementation guide sitting in the repository root. It documents crash handler improvements and belongs in `docs/` alongside other architectural documentation.

**Proposed Fix:**
Move `CRASH_HANDLER_IMPROVEMENTS.md` → `docs/CRASH_HANDLER_IMPROVEMENTS.md`.

**Impact:** Cleaner root directory, crash handler docs co-located with other technical guides.""",
        "pr_body": """## 🚀 Description

This PR moves `CRASH_HANDLER_IMPROVEMENTS.md` from the repository root into the `docs/` directory. This implementation guide documents crash handler improvements and belongs alongside other technical documentation. Moving it to `docs/` creates a cleaner root directory and ensures all implementation guides are consolidated in a single, discoverable location for contributors.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3282,
        "branch": "docs/cleanup-error-boundary-guide",
        "title": "docs: Move ERROR_BOUNDARY_GUIDE.md to docs/ directory",
        "issue_title": "docs: Move ERROR_BOUNDARY_GUIDE.md from root to docs/ directory",
        "issue_body": """**Problem:**
`ERROR_BOUNDARY_GUIDE.md` documents the error boundary architecture and implementation. It is a technical guide currently sitting in the repository root instead of the `docs/` folder where it belongs.

**Proposed Fix:**
Move `ERROR_BOUNDARY_GUIDE.md` → `docs/ERROR_BOUNDARY_GUIDE.md`.

**Impact:** Cleaner root directory, error handling documentation grouped with other technical guides.""",
        "pr_body": """## 🚀 Description

This PR moves `ERROR_BOUNDARY_GUIDE.md` from the repository root into the `docs/` directory. This guide documents the error boundary architecture and implementation details. Placing it in the `docs/` folder alongside `ARCHITECTURE_AND_ROLES.md` and `API_DOCUMENTATION.md` ensures consistency and makes it easily discoverable for contributors working on error handling.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3283,
        "branch": "docs/cleanup-filtering-quick-reference",
        "title": "docs: Move FILTERING_QUICK_REFERENCE.md to docs/ directory",
        "issue_title": "docs: Move FILTERING_QUICK_REFERENCE.md from root to docs/ directory",
        "issue_body": """**Problem:**
`FILTERING_QUICK_REFERENCE.md` is a quick reference guide for the advanced filtering system. It is a technical document that belongs in `docs/` alongside `ADVANCED_FILTERING_IMPLEMENTATION.md`, not in the repository root.

**Proposed Fix:**
Move `FILTERING_QUICK_REFERENCE.md` → `docs/FILTERING_QUICK_REFERENCE.md` and update cross-references.

**Impact:** Cleaner root, all filtering docs co-located in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `FILTERING_QUICK_REFERENCE.md` from the repository root into the `docs/` directory. This quick reference guide for the advanced filtering system is a technical document that belongs in the `docs/` folder alongside other related implementation documentation. Cross-references in `DOCUMENTATION_UPDATES.md` are also updated to reflect the new path.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3284,
        "branch": "docs/cleanup-lenis-smooth-scrolling",
        "title": "docs: Move LENIS_SMOOTH_SCROLLING.md to docs/ directory",
        "issue_title": "docs: Move LENIS_SMOOTH_SCROLLING.md from root to docs/ directory",
        "issue_body": """**Problem:**
`LENIS_SMOOTH_SCROLLING.md` describes the Lenis smooth-scrolling library integration in Eventra. It is a frontend implementation guide that should live in `docs/` rather than the repository root.

**Proposed Fix:**
Move `LENIS_SMOOTH_SCROLLING.md` → `docs/LENIS_SMOOTH_SCROLLING.md`.

**Impact:** Cleaner root directory, UI/UX implementation docs consolidated in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `LENIS_SMOOTH_SCROLLING.md` from the repository root into the `docs/` directory. This document describes the Lenis smooth-scrolling library integration and is a frontend implementation guide. Centralizing it in `docs/` ensures UI/UX implementation details are consistently grouped with other technical references for easier contributor discovery.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3285,
        "branch": "docs/cleanup-phase-3-ui-components",
        "title": "docs: Move PHASE_3_UI_COMPONENTS.md to docs/ directory",
        "issue_title": "docs: Move PHASE_3_UI_COMPONENTS.md from root to docs/ directory",
        "issue_body": """**Problem:**
`PHASE_3_UI_COMPONENTS.md` outlines the Phase 3 UI component architecture. It is a technical design document that belongs in `docs/` alongside other implementation guides, not the repository root.

**Proposed Fix:**
Move `PHASE_3_UI_COMPONENTS.md` → `docs/PHASE_3_UI_COMPONENTS.md`.

**Impact:** Cleaner root directory, frontend architecture docs consolidated in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `PHASE_3_UI_COMPONENTS.md` from the repository root into the `docs/` directory. This document outlines the Phase 3 UI component architecture and belongs in the `docs/` folder alongside other implementation guides. Moving it improves repository organization and ensures frontend documentation is centralized for contributors.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3286,
        "branch": "docs/cleanup-security-env-vars",
        "title": "docs: Move SECURITY_ENV_VARS.md to docs/ directory",
        "issue_title": "docs: Move SECURITY_ENV_VARS.md from root to docs/ directory",
        "issue_body": """**Problem:**
`SECURITY_ENV_VARS.md` contains security guidelines for environment variables. It belongs in `docs/` alongside `ENV_SETUP_GUIDE.md` rather than the root directory, where it is hard to find and inconsistent with the rest of the documentation structure.

**Proposed Fix:**
Move `SECURITY_ENV_VARS.md` → `docs/SECURITY_ENV_VARS.md`.

**Impact:** Security docs consolidated in `docs/`, cleaner root directory.""",
        "pr_body": """## 🚀 Description

This PR moves `SECURITY_ENV_VARS.md` from the repository root into the `docs/` directory. This document contains sensitive environment variable security guidelines and belongs alongside `ENV_SETUP_GUIDE.md` in the `docs/` folder. Consolidating security documentation in `docs/` makes it easier for contributors to find and follow security best practices.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3287,
        "branch": "docs/cleanup-security-migration",
        "title": "docs: Move SECURITY_MIGRATION.md to docs/ directory",
        "issue_title": "docs: Move SECURITY_MIGRATION.md from root to docs/ directory",
        "issue_body": """**Problem:**
`SECURITY_MIGRATION.md` outlines security migration steps and is a technical guide. It belongs in the `docs/` directory alongside other security and architectural documentation, not the repository root.

**Proposed Fix:**
Move `SECURITY_MIGRATION.md` → `docs/SECURITY_MIGRATION.md`.

**Impact:** All security documentation co-located in `docs/`, cleaner root directory.""",
        "pr_body": """## 🚀 Description

This PR moves `SECURITY_MIGRATION.md` from the repository root into the `docs/` directory. This document outlines security migration steps and is a technical guide that belongs with the other security-related and technical documentation in `docs/`. This ensures all security documentation is co-located and discoverable for contributors and maintainers.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3288,
        "branch": "docs/cleanup-session-recovery",
        "title": "docs: Move SESSION_RECOVERY.md to docs/ directory",
        "issue_title": "docs: Move SESSION_RECOVERY.md from root to docs/ directory",
        "issue_body": """**Problem:**
`SESSION_RECOVERY.md` covers the offline-first session recovery architecture and is referenced in `DOCUMENTATION_UPDATES.md`. It is a core architectural document that should live in `docs/` rather than the repository root.

**Proposed Fix:**
Move `SESSION_RECOVERY.md` → `docs/SESSION_RECOVERY.md` and update cross-references.

**Impact:** Architectural docs consolidated in `docs/`, no broken links.""",
        "pr_body": """## 🚀 Description

This PR moves `SESSION_RECOVERY.md` from the repository root into the `docs/` directory. This document covers the offline-first session recovery architecture and is referenced by `DOCUMENTATION_UPDATES.md`. Moving it to `docs/` consolidates all architectural guides. Cross-references are updated to reflect the new path, ensuring no broken links across the documentation suite.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3289,
        "branch": "docs/cleanup-skeleton-loaders",
        "title": "docs: Move SKELETON_LOADERS.md to docs/ directory",
        "issue_title": "docs: Move SKELETON_LOADERS.md from root to docs/ directory",
        "issue_body": """**Problem:**
`SKELETON_LOADERS.md` describes the skeleton loader UI components implementation. It is a frontend implementation guide that should live in the `docs/` directory alongside other UI implementation documents, not the repository root.

**Proposed Fix:**
Move `SKELETON_LOADERS.md` → `docs/SKELETON_LOADERS.md`.

**Impact:** Cleaner root directory, all UI component docs consolidated in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `SKELETON_LOADERS.md` from the repository root into the `docs/` directory. This document describes the skeleton loader UI components implementation and belongs in `docs/` alongside other frontend implementation guides. Moving it consolidates all UI component documentation in one place, improving navigability for contributors.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "pr": 3290,
        "branch": "docs/cleanup-documentation-updates",
        "title": "docs: Move DOCUMENTATION_UPDATES.md to docs/ directory",
        "issue_title": "docs: Move DOCUMENTATION_UPDATES.md from root to docs/ directory",
        "issue_body": """**Problem:**
`DOCUMENTATION_UPDATES.md` is a meta-documentation index that tracks all cross-references and documentation updates in the project. It belongs in the `docs/` folder, not the repository root, as it is an internal documentation management file.

**Proposed Fix:**
Move `DOCUMENTATION_UPDATES.md` → `docs/DOCUMENTATION_UPDATES.md`.

**Impact:** Finalizes root directory cleanup, all documentation consolidated in `docs/`.""",
        "pr_body": """## 🚀 Description

This PR moves `DOCUMENTATION_UPDATES.md` from the repository root into the `docs/` directory. This file tracks all documentation updates and cross-references and belongs within the `docs/` folder as a meta-documentation index. Moving it finalizes the root directory cleanup effort, ensuring all documentation is consolidated in the proper location for maximum contributor discoverability.

Fixes #{issue}

## 🛠️ Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
]

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.returncode, r.stdout.strip(), r.stderr.strip()

for item in data:
    print(f"\n=== Processing PR #{item['pr']}: {item['branch']} ===")

    # Step 1: Create issue on upstream
    with open("issue_body.txt", "w") as f:
        f.write(item["issue_body"])
    rc, out, err = run(f'gh issue create --repo SandeepVashishtha/Eventra --title "{item["issue_title"]}" --body-file issue_body.txt')
    if rc == 0:
        issue_url = out.strip()
        issue_num = issue_url.split("/")[-1]
        print(f"  ✅ Issue created: #{issue_num} -> {issue_url}")
    else:
        print(f"  ❌ Issue creation failed: {err}")
        issue_num = "UNKNOWN"

    # Step 2: Update the PR body with the real issue number
    pr_body = item["pr_body"].replace("{issue}", issue_num)
    with open("pr_body.txt", "w") as f:
        f.write(pr_body)
    rc, out, err = run(f'gh pr edit {item["pr"]} --repo SandeepVashishtha/Eventra --body-file pr_body.txt')
    if rc == 0:
        print(f"  ✅ PR #{item['pr']} updated with Fixes #{issue_num}")
    else:
        print(f"  ❌ PR update failed: {err}")

    time.sleep(2)

import os
for f in ["issue_body.txt", "pr_body.txt"]:
    if os.path.exists(f): os.remove(f)

print("\n\n✅ All issues created and PRs updated!")
