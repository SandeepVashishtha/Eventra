## Target
**File:** `.github/workflows/ci.yml` (lines 17-68)
**Category:** DevOps | **Level:** Intermediate

## The Vulnerability
The CI pipeline runs `lint`, `typecheck`, `test`, and `build` as 4 separate jobs, each calling `npm ci` independently. While npm caching is enabled per-job, the node_modules directory is not shared between jobs — each job must download and extract npm packages from cache separately, then run its own `npm ci`.

## The Impact
Running `npm ci` is I/O intensive and takes 30-90 seconds per job. With 4 jobs, the total wasted time is 2-6 minutes per CI run just re-installing the same dependencies 4 times. For a project with frequent PRs (typical for Hacktoberfest/GSSoC), this cumulatively wastes hours of CI runner time per month, slows down CI feedback for contributors, and wastes GitHub Actions minutes.

## Suggested Fix
Merge lint, typecheck, and test into a single job (they can run sequentially after one `npm ci`), then have the build job depend on that job's cached node_modules via GitHub Actions' `actions/cache`. Alternatively, use a matrix strategy to share the node_modules via a workspace-level cache key.
