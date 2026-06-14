import { strict as assert } from "node:assert";

import {
  createSessionBackup,
  downloadSessionBackup,
  getSessionBackupFilename,
  parseSessionBackupJson,
  resolveImportedSessions,
  SESSION_BACKUP_VERSION,
  stringifySessionBackup,
  validateSessionBackup,
} from "../src/utils/sessionExportImport.js";
import { createRecoverySession } from "../src/utils/multiSessionRecovery.js";

const now = new Date("2026-06-05T12:00:00.000Z");

console.log("sessionExportImport tests starting...");

const sessionA = createRecoverySession({
  sessionId: "session-a",
  name: "Event Draft - Tech Meetup",
  type: "event-creation",
  draftData: { title: "Tech Meetup" },
  source: "local",
  now,
});
const sessionB = createRecoverySession({
  sessionId: "session-b",
  name: "Profile Update Draft",
  type: "profile-edit",
  draftData: { displayName: "Ada" },
  source: "cloud",
  now,
});

assert.equal(getSessionBackupFilename(now), "session-backup-2026-06-05.json");

const single = createSessionBackup([sessionA], now);
assert.equal(single.version, SESSION_BACKUP_VERSION);
assert.equal(single.exportedAt, "2026-06-05T12:00:00.000Z");
assert.equal(single.count, 1);
assert.equal(single.sessions[0].name, "Event Draft - Tech Meetup");
assert.deepEqual(single.sessions[0].draftData, { title: "Tech Meetup" });

const multi = JSON.parse(stringifySessionBackup([sessionA, sessionB], now));
assert.equal(multi.count, 2);
assert.deepEqual(
  multi.sessions.map((session) => session.sessionId),
  ["session-a", "session-b"],
);

const parsed = parseSessionBackupJson(JSON.stringify(multi));
assert.equal(parsed.ok, true);
assert.equal(parsed.sessions.length, 2);

assert.equal(parseSessionBackupJson("{bad json").error, "Backup file is not valid JSON.");
assert.equal(validateSessionBackup(null).error, "Backup must be a JSON object.");
assert.equal(
  validateSessionBackup({ version: "9.0", exportedAt: now.toISOString(), sessions: [] }).error,
  "Unsupported session backup version.",
);
assert.equal(
  validateSessionBackup({ version: SESSION_BACKUP_VERSION, exportedAt: "bad", sessions: [] }).error,
  "Backup export timestamp is missing or invalid.",
);
assert.equal(
  parseSessionBackupJson("x".repeat(1024 * 1024 + 2)).error,
  "Backup file is too large.",
);

const existing = [sessionA];
const importedDuplicate = {
  ...sessionA,
  name: "Imported Duplicate",
  draftData: { title: "Imported" },
};

const skipped = resolveImportedSessions({
  existingSessions: existing,
  importedSessions: [importedDuplicate, sessionB],
  strategy: "skip",
});
assert.equal(skipped.restored.length, 1);
assert.equal(skipped.skipped.length, 1);
assert.equal(skipped.sessions.length, 2);
assert.equal(skipped.sessions.find((session) => session.sessionId === "session-a").name, sessionA.name);

const replaced = resolveImportedSessions({
  existingSessions: existing,
  importedSessions: [importedDuplicate],
  strategy: "replace",
});
assert.equal(replaced.replaced.length, 1);
assert.equal(replaced.sessions[0].name, "Imported Duplicate");

const keptBoth = resolveImportedSessions({
  existingSessions: existing,
  importedSessions: [importedDuplicate],
  strategy: "keep-both",
});
assert.equal(keptBoth.renamed.length, 1);
assert.equal(keptBoth.sessions.length, 2);
assert.ok(keptBoth.sessions.some((session) => session.name.includes("(Imported)")));

let blobContent = "";
let downloadName = "";
let clicked = false;
let revoked = "";
globalThis.Blob = class {
  constructor(parts) {
    const content = parts.join("");
    this.size = content.length;
    if (content.includes('"version"') && content.includes('"sessions"')) {
      blobContent = content;
    }
  }
};
globalThis.window = {
  URL: {
    createObjectURL() {
      return "blob:backup";
    },
    revokeObjectURL(url) {
      revoked = url;
    },
  },
};
globalThis.document = {
  body: {
    appendChild() {},
    removeChild() {},
  },
  createElement() {
    return {
      href: "",
      style: {},
      setAttribute(key, value) {
        if (key === "download") downloadName = value;
      },
      click() {
        clicked = true;
      },
    };
  },
};

const download = downloadSessionBackup({
  sessions: [sessionA],
  filename: "session-backup.json",
  now,
});
assert.equal(download.count, 1);
assert.equal(downloadName, "session-backup.json");
assert.equal(clicked, true);
assert.equal(revoked, "blob:backup");
const downloadedBackup = JSON.parse(blobContent);
assert.equal(downloadedBackup.version, SESSION_BACKUP_VERSION);
assert.equal(downloadedBackup.count, 1);
assert.equal(downloadedBackup.sessions[0].sessionId, "session-a");

console.log("sessionExportImport tests passed");
