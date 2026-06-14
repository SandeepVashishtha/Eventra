import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sourcePath = "src/components/common/BackToTopButton.jsx";
const source = readFileSync(sourcePath, "utf8");

assert.match(
  source,
  /const BackToTopButton = \(\{ threshold = 300, positionClass = "bottom-6 right-6" \}\)/,
  "BackToTopButton must preserve its public props and defaults"
);

assert.match(
  source,
  /window\.scrollY > threshold/,
  "BackToTopButton visibility must still depend on scrollY exceeding threshold"
);

assert.match(
  source,
  /window\.addEventListener\("scroll", handleScroll\)/,
  "BackToTopButton must still listen for scroll events"
);

assert.match(
  source,
  /window\.removeEventListener\("scroll", handleScroll\)/,
  "BackToTopButton must clean up its scroll listener"
);

assert.match(
  source,
  /window\.scrollTo\(\{[\s\S]*top: 0,[\s\S]*behavior: "smooth"[\s\S]*\}\)/,
  "BackToTopButton click behavior must still smooth-scroll to the top"
);

assert.match(
  source,
  /aria-label="Back to top"/,
  "BackToTopButton must keep its accessible label"
);

assert.match(
  source,
  /title="Back to top"/,
  "BackToTopButton must keep its visible tooltip text"
);

assert.match(
  source,
  /opacity-0 translate-y-10 pointer-events-none/,
  "BackToTopButton must remain hidden and non-interactive below the threshold"
);

assert.match(
  source,
  /opacity-100 translate-y-0/,
  "BackToTopButton must remain visible above the threshold"
);

assert.doesNotMatch(
  source,
  /\/\*[\s\S]*?\*\//,
  "BackToTopButton should not accumulate large block comments"
);

assert.doesNotMatch(
  source,
  /\/\/\s*(TODO|FIXME|console\.log|old|deprecated|unused)/i,
  "BackToTopButton should not keep obsolete maintenance comments"
);

console.log("back-to-top button integrity tests passed");
