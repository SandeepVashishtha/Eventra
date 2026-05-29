# Issue #004: Duplicate "Additional Information" field in EventRegistration form

**Tags:** `bug`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** `src/Pages/Events/EventRegistration.js`

---

## Description

The "Additional Information" textarea is rendered **twice** in the EventRegistration form due to a copy-paste error. Both sections bind to `formData.additionalInfo`, but the second instance visually overrides the first, creating a confusing duplicate input experience.

### Affected Lines

In `src/Pages/Events/EventRegistration.js`, the duplicate sections are:

**First instance (lines 801-826):**
```jsx
{/* Additional Info */}
<div>
  <label htmlFor="additionalInfo">Additional Information (Optional)</label>
  <textarea
    id="additionalInfo"
    name="additionalInfo"
    value={formData.additionalInfo}
    onChange={handleChange}
    maxLength={MAX_NOTES_CHARS}
    rows="4"
    ...
  />
  <div className="flex justify-end text-xs mt-1 text-gray-400 dark:text-gray-500">
    <span>...{formData.additionalInfo?.length || 0} / {MAX_NOTES_CHARS} characters</span>
  </div>
</div>
```

**Second instance (lines 827-859):**
```jsx
{/* Additional Info */}
<div>
  <label htmlFor="additionalInfo">Additional Information (Optional)</label>
  <textarea
    id="additionalInfo"
    name="additionalInfo"
    value={formData.additionalInfo}
    onChange={handleChange}
    rows="4"
    maxLength={500}
    ...
  />
  <div className="mt-2 flex justify-end">
    <span>...{formData.additionalInfo.length} / 500 characters</span>
  </div>
</div>
```

### Key Differences Between the Two

| Feature | First instance | Second instance |
|---------|---------------|-----------------|
| `maxLength` | Uses variable `MAX_NOTES_CHARS` | Hardcoded `500` |
| Character count display | Right-aligned text-xs | Bottom-right with color change at 400 |
| Null safety for `.length` | Uses `formData.additionalInfo?.length \|\| 0` | Uses `formData.additionalInfo.length` (unsafe) |
| Color indicator | Pulse animation near limit | Red text after 400 chars |

### Impact

- Users see two identical "Additional Information" sections, which is confusing
- The `htmlFor`/`id` attributes are duplicated, violating HTML spec and causing `getElementById` to only find the first one
- Both bind to the same state, so typing in one reflects in the other, but tab order is confusing
- The second instance's character counter can throw an error if `formData.additionalInfo` is `undefined` (no null guard)

## Proposed Fix

Remove the second instance (lines 827-859) and keep the first instance (lines 801-826). Optionally, incorporate the best features from each:

- Keep the `MAX_NOTES_CHARS` variable (from first instance) for maintainability
- Keep the color-change-at-threshold logic (from second instance)
- Keep the null-safe `?.length || 0` pattern (from first instance)
- Keep the `maxLength` constraint (both have it, but variable is better)

### Before (after removal)

```jsx
{/* Additional Info */}
<div>
  <label
    htmlFor="additionalInfo"
    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
  >
    Additional Information (Optional)
  </label>
  <textarea
    id="additionalInfo"
    name="additionalInfo"
    value={formData.additionalInfo}
    onChange={handleChange}
    maxLength={MAX_NOTES_CHARS}
    rows="4"
    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
    placeholder="Any special requirements or questions?"
  />
  <div className="flex justify-end text-xs mt-1 text-gray-400 dark:text-gray-500">
    <span className={(formData.additionalInfo?.length || 0) >= MAX_NOTES_CHARS - 20 ? "text-red-500 font-medium animate-pulse" : ""}>
      {formData.additionalInfo?.length || 0} / {MAX_NOTES_CHARS} characters
    </span>
  </div>
</div>
```

## Acceptance Criteria

- [ ] Only one "Additional Information" textarea appears in the form
- [ ] The textarea correctly tracks character count against `MAX_NOTES_CHARS`
- [ ] The character counter shows red/pulse animation when approaching the limit
- [ ] The `htmlFor`/`id` attributes are unique in the DOM
- [ ] No null/undefined errors when `formData.additionalInfo` is empty or unset
- [ ] Form submission still works correctly
