import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hackathonFiles = [
  "src/Pages/Hackathons/HackathonCTA.js",
  "src/Pages/Hackathons/HackathonLifecycle.jsx",
  "src/components/hackathons/InteractiveWhiteboard.jsx",
  "src/components/hackathons/TeamWorkspace.jsx",
];

const genericButtonLabelPattern = /aria-label=["']button["']/;
const buttonTagPattern = /<button\b[^>]*>/g;

for (const filePath of hackathonFiles) {
  const source = readFileSync(filePath, "utf8");

  assert.doesNotMatch(
    source,
    genericButtonLabelPattern,
    `${filePath} must not use generic button aria-labels`
  );

  for (const match of source.matchAll(buttonTagPattern)) {
    const buttonTag = match[0];
    const hasTitle = /\btitle=/.test(buttonTag);
    const hasAriaLabel = /\baria-label=/.test(buttonTag);

    assert.ok(
      !hasTitle || hasAriaLabel,
      `${filePath} title-only button needs a descriptive aria-label: ${buttonTag}`
    );
  }
}

console.log("hackathon icon button label tests passed");
