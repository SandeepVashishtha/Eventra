import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scrollToTopButtonSource = readFileSync("src/components/ScrollToTopButton.jsx", "utf8");
const backToTopSource = readFileSync("src/components/common/BackToTop.jsx", "utf8");
const hackathonPageSource = readFileSync("src/Pages/Hackathons/HackathonPage.js", "utf8");

assert.match(
  scrollToTopButtonSource,
  /bottom-\[calc\(1rem\+var\(--safe-area-bottom\)\)\] left-\[calc\(1rem\+var\(--safe-area-left\)\)\] sm:bottom-24 sm:left-6/,
  "ScrollToTopButton should use safe-area aware mobile placement when the chatbot is open"
);

assert.match(
  scrollToTopButtonSource,
  /bottom-\[calc\(1rem\+var\(--safe-area-bottom\)\)\] right-\[calc\(1rem\+var\(--safe-area-right\)\)\] sm:bottom-24 sm:right-6/,
  "ScrollToTopButton should use safe-area aware mobile placement when the chatbot is closed"
);

assert.match(
  backToTopSource,
  /bottom-\[calc\(1rem\+var\(--safe-area-bottom\)\)\] right-\[calc\(1rem\+var\(--safe-area-right\)\)\] z-50 sm:bottom-6 sm:right-6/,
  "BackToTop should keep clear of the mobile browser chrome"
);

assert.match(
  backToTopSource,
  /w-11 h-11 sm:w-12 sm:h-12/,
  "BackToTop should stay compact on mobile"
);

assert.match(
  hackathonPageSource,
  /<BackToTopButton positionClass=\{positionClass\} \/>/,
  "HackathonPage should pass its responsive position class to the shared back-to-top button"
);

console.log("back-to-top mobile positioning tests passed");