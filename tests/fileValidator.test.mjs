import assert from "node:assert/strict";

import { validateFile, validateImageFile } from "../src/utils/fileValidator.js";

const makeFile = ({ name, type, size }) => ({
  name,
  type,
  size,
});

assert.deepEqual(validateImageFile(null), {
  valid: false,
  error: "No file provided",
});

assert.deepEqual(
  validateImageFile(makeFile({ name: "photo.jpg", type: "image/jpeg", size: 1024 })),
  { valid: true },
);

assert.equal(
  validateImageFile(makeFile({ name: "photo.jpg", type: "image/jpeg", size: 0 })).valid,
  false,
);

assert.match(
  validateImageFile(makeFile({ name: "photo.jpg", type: "text/plain", size: 100 })).error,
  /not allowed/i,
);

assert.match(
  validateImageFile(makeFile({ name: "script.js", type: "image/jpeg", size: 100 })).error,
  /not allowed for security/i,
);

assert.deepEqual(
  validateFile(makeFile({ name: "notes.pdf", type: "application/pdf", size: 2048 }), {
    allowedExtensions: [".pdf"],
  }),
  { valid: true },
);

assert.match(
  validateFile(makeFile({ name: "installer.exe", type: "application/octet-stream", size: 100 }))
    .error,
  /blocked for security/i,
);

console.log("fileValidator tests passed ✓");
