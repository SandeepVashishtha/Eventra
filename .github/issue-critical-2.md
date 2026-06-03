## Summary
The codebase has six separate validation files doing overlapping work and six storage wrappers, yet 140+ components bypass all wrappers and access localStorage directly. This creates maintenance debt, inconsistent behavior, and security gaps.

## Evidence
**Six validation files with overlap:**
| File | Lines | Purpose |
|------|-------|---------|
| `src/validation.js` | 464 | Sync validators + async wrappers |
| `src/utils/asyncValidators.js` | 364 | Separate async validators |
| `src/utils/validationApi.js` | 260 | API validation wrappers |
| `src/utils/eventFormValidation.js` | 103 | Event form validation |
| `src/utils/fileValidator.js` | 122 | File upload validation |
| `src/utils/eventUtils.js` | — | Contains validation logic |

**Critical duplication:** `validateUsernameAvailable` and `validateEmailAvailable` exist in BOTH `validation.js` AND `asyncValidators.js`. The `asyncValidators.js` versions use raw `fetch()` while `validation.js` goes through the resilient `validationApi.js` layer with retry/timeout. Half the async validation calls bypass error handling.

**Seven storage wrappers, all bypassed:**
| File | Purpose |
|------|---------|
| `src/utils/safeStorage.js` | Safe localStorage/sessionStorage |
| `src/utils/secureStorage.js` | AES-GCM encrypted storage |
| `src/utils/storage/storageManager.js` | Expiry + validation |
| `src/utils/storage/storageKeys.js` | Key constants |
| `src/utils/storage/storageValidators.js` | Value validators |
| `src/hooks/useLocalStorage.js` | React hook |
| `src/hooks/useSessionStorage.js` | React hook |

Yet grep finds **140+ direct `localStorage.getItem()` / `setItem()` calls** across the codebase bypassing all wrappers.

## Suggested Fix (1200-1800+ lines)
- Merge `asyncValidators.js` into `validation.js` (asyncValidators uses raw fetch — delete it)
- Create `src/validation/index.js` barrel with composed validators
- Deprecate `eventFormValidation.js` in favor of central validators
- Create unified `src/storage/` module with factory pattern for IndexedDB/localStorage/sessionStorage/secureStorage
- Migrate all 140+ raw localStorage calls to the unified layer
- Add runtime adapter routing by key prefix
