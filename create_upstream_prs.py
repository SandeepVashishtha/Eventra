import subprocess
import time

prs = [
    {
        "branch": "docs/cleanup-readme-env-setup-snippet",
        "title": "docs: Remove redundant README_ENV_SETUP_SNIPPET.md from root directory",
        "body": """## 🚀 Description

This PR removes `README_ENV_SETUP_SNIPPET.md` from the repository root. This file was a temporary tracker snippet whose contents have already been fully integrated into the main `README.md` under the `Environment Setup & Configuration` section. Keeping it in the root causes confusion and duplication of truth. Deleting it results in a cleaner, more professional repository structure.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-changes-summary",
        "title": "docs: Move CHANGES_SUMMARY.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `CHANGES_SUMMARY.md` from the repository root into the `docs/` directory. Implementation summaries and change logs belong in the dedicated documentation folder alongside other technical specs. Relocating this file reduces root-level clutter and ensures contributors can find all project documentation in one centralized location. No content has been modified.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-crash-handler-improvements",
        "title": "docs: Move CRASH_HANDLER_IMPROVEMENTS.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `CRASH_HANDLER_IMPROVEMENTS.md` from the repository root into the `docs/` directory. This implementation guide documents crash handler improvements and belongs alongside other technical documentation. Moving it to `docs/` creates a cleaner root directory and ensures all implementation guides are consolidated in a single, discoverable location for contributors.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-error-boundary-guide",
        "title": "docs: Move ERROR_BOUNDARY_GUIDE.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `ERROR_BOUNDARY_GUIDE.md` from the repository root into the `docs/` directory. This guide documents the error boundary architecture and implementation details. Placing it in the `docs/` folder alongside `ARCHITECTURE_AND_ROLES.md` and `API_DOCUMENTATION.md` ensures consistency and makes it easily discoverable for contributors working on error handling.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-filtering-quick-reference",
        "title": "docs: Move FILTERING_QUICK_REFERENCE.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `FILTERING_QUICK_REFERENCE.md` from the repository root into the `docs/` directory. This quick reference guide for the advanced filtering system is a technical document that belongs in the `docs/` folder alongside other related implementation documentation. This change also updates cross-references in `DOCUMENTATION_UPDATES.md` to reflect the new path.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-lenis-smooth-scrolling",
        "title": "docs: Move LENIS_SMOOTH_SCROLLING.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `LENIS_SMOOTH_SCROLLING.md` from the repository root into the `docs/` directory. This document describes the Lenis smooth-scrolling library integration and is a frontend implementation guide. Centralizing it in `docs/` ensures UI/UX implementation details are consistently grouped with other technical references.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-phase-3-ui-components",
        "title": "docs: Move PHASE_3_UI_COMPONENTS.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `PHASE_3_UI_COMPONENTS.md` from the repository root into the `docs/` directory. This document outlines the Phase 3 UI component architecture and belongs in the `docs/` folder alongside other implementation guides. Moving it improves repository organization and ensures frontend documentation is centralized for contributors.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-security-env-vars",
        "title": "docs: Move SECURITY_ENV_VARS.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `SECURITY_ENV_VARS.md` from the repository root into the `docs/` directory. This document contains sensitive environment variable security guidelines and belongs alongside `ENV_SETUP_GUIDE.md` in the `docs/` folder. Consolidating security documentation in `docs/` makes it easier for contributors to find and follow security best practices.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-security-migration",
        "title": "docs: Move SECURITY_MIGRATION.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `SECURITY_MIGRATION.md` from the repository root into the `docs/` directory. This document outlines security migration steps and is a technical guide that belongs with the other security-related and technical documentation in `docs/`. This ensures all security documentation is co-located and discoverable.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-session-recovery",
        "title": "docs: Move SESSION_RECOVERY.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `SESSION_RECOVERY.md` from the repository root into the `docs/` directory. This document covers the offline-first session recovery architecture and is referenced by `DOCUMENTATION_UPDATES.md`. Moving it to `docs/` consolidates all architectural guides and cross-references are updated to reflect the new path.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-skeleton-loaders",
        "title": "docs: Move SKELETON_LOADERS.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `SKELETON_LOADERS.md` from the repository root into the `docs/` directory. This document describes the skeleton loader UI components implementation. It belongs in `docs/` alongside other frontend implementation guides. Moving it consolidates all UI component documentation in one place, improving navigability for contributors.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
    {
        "branch": "docs/cleanup-documentation-updates",
        "title": "docs: Move DOCUMENTATION_UPDATES.md to docs/ directory",
        "body": """## 🚀 Description

This PR moves `DOCUMENTATION_UPDATES.md` from the repository root into the `docs/` directory. This file tracks all documentation updates and cross-references and belongs within the `docs/` folder as a meta-documentation index. Moving it finalizes the root directory cleanup effort, ensuring all documentation is consolidated in the proper location.

Fixes #(issue)

## 🛠️ Type of change
- [x] This change requires a documentation update

## ✅ Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings"""
    },
]

for pr in prs:
    with open("pr_body.txt", "w") as f:
        f.write(pr["body"])
    cmd = f'gh pr create --repo SandeepVashishtha/Eventra --base master --head mihir021:{pr["branch"]} --title "{pr["title"]}" --body-file pr_body.txt'
    print(f"Creating PR for {pr['branch']}...")
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  ✅ Created: {r.stdout.strip()}")
    else:
        print(f"  ❌ Error: {r.stderr.strip()}")
    time.sleep(2)

import os
os.remove("pr_body.txt")
print("\nAll done!")
