// src/data/whatsNewEntries.js

/**
 * Structured "What's New" release notes.
 * Add a new entry at the TOP of the array whenever a new version ships.
 * Keep entries user-facing and readable — not raw commit messages.
 *
 * type: "new" | "improved" | "fixed"
 */

export const whatsNewEntries = [
  {
    version: "1.0.0",
    date: "2026-07-01",
    items: [
      {
        type: "fixed",
        text: "Fixed event registration incorrectly limiting sign-ups when an event was meant to have unlimited capacity.",
      },
      {
        type: "fixed",
        text: "Fixed a rate-limiting bug where repeatedly blocked requests could accidentally lock a user out permanently.",
      },
      {
        type: "fixed",
        text: "Fixed a rare timing issue that could cause background tasks to expire before they finished processing.",
      },
    ],
  },
];

export const getLatestVersion = () => whatsNewEntries[0]?.version ?? null;