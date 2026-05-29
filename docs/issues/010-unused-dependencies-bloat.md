# Issue #010: Unused dependencies bloating production bundle

**Tags:** `refactor`, `performance`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** `package.json`

---

## Description

Two npm dependencies listed in `package.json` are not imported anywhere in the source code:

1. **`react-hot-toast`** (listed at line 26) — The codebase uses `react-toastify` (line 32) for all toast notifications. `react-hot-toast` is completely unused.
2. **`aos` (Animate on Scroll)** (listed at line 11) — The codebase uses `framer-motion` for all animations and `react-intersection-observer` for scroll detection. `aos` is not imported anywhere.

### Estimated Bundle Impact

| Library | Approximate size (gzipped) |
|---------|---------------------------|
| `react-hot-toast` | ~8 KB |
| `aos` (includes CSS) | ~10 KB |
| **Total** | **~18 KB** |

While 18 KB may seem small, removing unused dependencies:
- Reduces `node_modules` size for CI/CD pipelines
- Eliminates potential security vulnerabilities from unused packages
- Reduces `npm install` time
- Simplifies dependency audit/management

### Source Code Scan

A grep for `react-hot-toast` across all files in `src/` returns zero results:

```
rg "react-hot-toast" src/  -- no results
```

A grep for `aos` imports in `src/` returns zero results:

```
rg "from 'aos'" src/  -- no results
rg "from \"aos\"" src/  -- no results
rg "require.*aos" src/  -- no results
rg "import.*aos" src/  -- no results
```

All toast usage in the codebase uses `react-toastify`:
```javascript
import { toast } from "react-toastify";
```

## Proposed Fix

1. Run `npm uninstall react-hot-toach aos` (or `npm uninstall react-hot-toast` then `npm uninstall aos`)
2. Verify the application builds and runs without errors
3. Verify all toast notifications still work
4. Verify all scroll animations still work

### Commands

```bash
npm uninstall react-hot-toast
npm uninstall aos
npm install  # Regenerate package-lock.json
```

### Verification Steps

1. **Build check**: `npm run build` completes without errors
2. **Runtime check**: `npm start` runs without import errors
3. **Toast check**: Trigger a toast notification (e.g., submit a form) — it should appear via `react-toastify`
4. **Animation check**: Navigate through the app — all animations should work via `framer-motion`
5. **Bundle size check**: Compare build output size before and after:
   ```bash
   npx source-map-explorer build/static/js/*.js  # Before and after
   ```

## Acceptance Criteria

- [ ] `react-hot-toast` removed from `package.json` and `node_modules`
- [ ] `aos` removed from `package.json` and `node_modules`
- [ ] `npm run build` succeeds
- [ ] `npm start` runs without errors
- [ ] All toast notifications display correctly (using `react-toastify`)
- [ ] All scroll and entry animations work correctly (using `framer-motion`)
- [ ] No `ERR_MODULE_NOT_FOUND` or similar import errors
- [ ] `package-lock.json` is updated

## Additional Notes

- Before removing, do a final thorough search: `rg -r "react-hot-toast" . --include "*.{js,jsx,ts,tsx}"` from project root
- Also check for dynamic imports: `rg "react-hot-toast" . --include "*.json"` (check .json imports too)
- The `aos` library CSS file (`aos/dist/aos.css`) should also be checked — if it's imported anywhere via CSS, it won't show in JS imports
