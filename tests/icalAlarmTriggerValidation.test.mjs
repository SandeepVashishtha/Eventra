import assert from "node:assert/strict";

// #14629: invalid reminder values must not produce a malformed iCalendar
// VALARM TRIGGER such as -PT-15M or -PTNaNM. The reminder should be disabled
// instead.

globalThis.Blob = class {
  constructor(parts) {
    this.text = async () => parts.map((p) => String(p)).join("");
  }
};
globalThis.URL = {
  createObjectURL: (blob) => blob,
  revokeObjectURL: () => {},
};

const { generateIcsFileBlobUrl } = await import(
  "../src/utils/calendarUrlUtils.js"
);

const event = {
  id: "evt-123",
  title: "GSSoC Meetup",
  description: "Networking",
  date: "2026-05-28",
  time: "10:00",
  durationMinutes: 60,
  location: "Zoom",
};

async function icsFor(reminder) {
  const blob = generateIcsFileBlobUrl(event, undefined, reminder);
  return await blob.text();
}

const valid = await icsFor(15);
assert.ok(valid.includes("TRIGGER:-PT15M"), "valid reminder emits -PT15M");
assert.ok(valid.includes("BEGIN:VALARM"), "valid reminder includes VALARM");

for (const bad of [-15, "-15", "abc", NaN, 0, "", null, undefined, 15.7, -0]) {
  const out = await icsFor(bad);
  assert.ok(
    !out.includes("VALARM"),
    `reminder ${JSON.stringify(bad)} must NOT emit a VALARM (got: ${out.includes("VALARM") ? "present" : "absent"})`,
  );
  assert.ok(
    !out.includes("-PT-"),
    `reminder ${JSON.stringify(bad)} must not produce -PT- (malformed negative)`,
  );
  assert.ok(
    !out.includes("PTNaN"),
    `reminder ${JSON.stringify(bad)} must not produce PTNaN`,
  );
}

// default (no reminder arg) — no VALARM
const none = await icsFor();
assert.ok(!none.includes("VALARM"), "omitted reminder must not emit VALARM");

console.log("iCalendar VALARM trigger validation tests passed");
