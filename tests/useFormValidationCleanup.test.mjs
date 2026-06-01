import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/hooks/useFormValidation.js", "utf8");

assert.match(
  source,
  /const timeoutRef = useRef\(null\)/,
  "useFormValidation should keep the debounce timer in a ref"
);

assert.match(
  source,
  /clearTimeout\(timeoutRef\.current\)/,
  "useFormValidation should clear pending debounce timers"
);

assert.match(
  source,
  /return \(\) => \{\s*mountedRef\.current = false;\s*clearValidationTimer\(\);/s,
  "useFormValidation should clear timers and mark itself unmounted during cleanup"
);

assert.match(
  source,
  /validationRunRef\.current \+= 1/,
  "useFormValidation should invalidate stale validation runs when timers are cleared"
);

assert.match(
  source,
  /if \(!mountedRef\.current \|\| validationRunRef\.current !== validationRun\) return;/,
  "useFormValidation should skip stale or unmounted validation updates"
);

assert.match(
  source,
  /setTimeout\(async \(\) => \{/,
  "useFormValidation should support async validators inside the debounced callback"
);

assert.match(
  source,
  /if \(!shallowEqualObject\(validationRulesRef\.current, validationRules\)\) \{\s*clearValidationTimer\(\);/s,
  "meaningful validation rule changes should cancel pending debounce timers"
);

assert.match(
  source,
  /if \(!shallowEqualObject\(initialStateRef\.current, initialState\)\) \{\s*clearValidationTimer\(\);/s,
  "meaningful initial value changes should cancel pending debounce timers"
);

assert.match(
  source,
  /useEffect\(\(\) => \{\s*optionsRef\.current = \{ debounceMs, validateOnBlur \};\s*clearValidationTimer\(\);/s,
  "validation option changes should cancel pending debounce timers"
);

console.log("useFormValidation cleanup tests passed");
