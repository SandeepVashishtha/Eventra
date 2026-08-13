import assert from "node:assert/strict";
import { REQUIRED_FIELDS, validateHostHackathonForm } from "../src/utils/hostHackathonValidation.js";

const TODAY = "2026-07-03";
const TOMORROW = "2026-07-04";
const DAY_AFTER = "2026-07-05";
const YESTERDAY = "2026-07-02";

const validData = {
  hackathonName: "My Hackathon",
  organizerName: "My Org",
  email: "me@example.com",
  location: "Online",
  startDate: TOMORROW,
  endDate: DAY_AFTER,
  description: "A description that is long enough to pass validation.",
};

// A fully valid submission has no errors
assert.deepEqual(validateHostHackathonForm(validData, TODAY), {});

// Every required field is flagged
const emptyErrors = validateHostHackathonForm({}, TODAY);
for (const field of REQUIRED_FIELDS) {
  assert.ok(emptyErrors[field], `expected an error for required field "${field}"`);
}
assert.equal(emptyErrors.hackathonName, "hackathon Name is required!");
assert.equal(emptyErrors.organizerName, "organizer Name is required!");

// Length bounds: hackathonName / organizerName / location (3-100), description (20-2000)
assert.equal(
  validateHostHackathonForm({ ...validData, hackathonName: "ab" }, TODAY).hackathonName,
  "Hackathon Name must be between 3 and 100 characters long!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, organizerName: "ab" }, TODAY).organizerName,
  "Organizer Name must be between 3 and 100 characters long!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, location: "ab" }, TODAY).location,
  "Location must be between 3 and 100 characters long!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, description: "too short" }, TODAY).description,
  "Description must be between 20 and 2000 characters long!"
);

// Email regex (stricter TLD requirement)
assert.equal(
  validateHostHackathonForm({ ...validData, email: "not-an-email" }, TODAY).email,
  "Please enter a valid email address!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, email: "a@b.c" }, TODAY).email,
  "Please enter a valid email address!"
);
assert.equal(validateHostHackathonForm({ ...validData, email: "a@b.co" }, TODAY).email, undefined);

// Website is optional but validated when present
assert.equal(validateHostHackathonForm({ ...validData, website: "" }, TODAY).website, undefined);
assert.equal(
  validateHostHackathonForm({ ...validData, website: "not a url" }, TODAY).website,
  "Please enter a valid URL!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, website: "https://example.com" }, TODAY).website,
  undefined
);

// Date-range logic: startDate cannot be in the past
assert.equal(
  validateHostHackathonForm({ ...validData, startDate: YESTERDAY }, TODAY).startDate,
  "Start date cannot be in the past!"
);
assert.equal(validateHostHackathonForm({ ...validData, startDate: TODAY }, TODAY).startDate, undefined);

// Date-range logic: endDate cannot be before startDate
assert.equal(
  validateHostHackathonForm({ ...validData, startDate: DAY_AFTER, endDate: TOMORROW }, TODAY).endDate,
  "End date cannot be before start date!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, startDate: TOMORROW, endDate: TOMORROW }, TODAY).endDate,
  undefined
);

// Participant limit is optional but must be >= 1 when present
assert.equal(validateHostHackathonForm({ ...validData, participantLimit: "" }, TODAY).participantLimit, undefined);
assert.equal(
  validateHostHackathonForm({ ...validData, participantLimit: "0" }, TODAY).participantLimit,
  "Participant limit must be at least 1!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, participantLimit: "-5" }, TODAY).participantLimit,
  "Participant limit must be at least 1!"
);
assert.equal(
  validateHostHackathonForm({ ...validData, participantLimit: "50" }, TODAY).participantLimit,
  undefined
);

console.log("hostHackathonValidation tests passed ✓");
