import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hackathonFiles = [
  "src/Pages/Hackathons/HackathonCard.js",
  "src/Pages/Hackathons/HackathonPage.js",
  "src/Pages/Hackathons/HostHackathon.js",
  "src/Pages/Hackathons/components/TeamMatchmaking.jsx",
];

for (const filePath of hackathonFiles) {
  const source = readFileSync(filePath, "utf8");

  assert.doesNotMatch(
    source,
    /aria-label=["']button["']/,
    `${filePath} must not use generic button aria-labels`
  );
}

console.log("hackathon aria-label tests passed");
