import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readSource = (path) => readFileSync(path, "utf8");

const eventRegistration = readSource("src/Pages/Events/EventRegistration.js");
const submitProject = readSource("src/Pages/Projects/SubmitProject.js");
const hostHackathon = readSource("src/Pages/Hackathons/HostHackathon.js");
const feedbackPage = readSource("src/Pages/Feedback/FeedbackPage.js");
const formInput = readSource("src/components/common/FormInput.jsx");

for (const field of ["fullName", "email", "phone"]) {
  assert.match(
    eventRegistration,
    new RegExp(`aria-describedby=\\{errors\\.${field} && touched\\.${field} \\? "${field}-error"`),
    `EventRegistration ${field} must reference its validation message`
  );
  assert.match(
    eventRegistration,
    new RegExp(`id="${field}-error"[\\s\\S]*role="alert"[\\s\\S]*aria-live="polite"`),
    `EventRegistration ${field} error must have an alert/live message id`
  );
}

assert.match(
  submitProject,
  /id=\{field\.name\}[\s\S]*aria-invalid=\{errors\[field\.name\] \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\[field\.name\] \? `\$\{field\.name\}-error` : undefined\}/,
  "SubmitProject generated fields must connect controls to generated error IDs"
);
assert.match(
  submitProject,
  /id=\{`\$\{field\.name\}-error`\}[\s\S]*role="alert"[\s\S]*aria-live="polite"/,
  "SubmitProject generated errors must expose stable IDs and live alert semantics"
);
assert.match(
  submitProject,
  /id="description"[\s\S]*aria-invalid=\{errors\.description \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\.description \? "description-error" : undefined\}/,
  "SubmitProject description textarea must reference its error"
);

assert.match(
  hostHackathon,
  /id=\{field\.name\}[\s\S]*aria-invalid=\{errors\[field\.name\] \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\[field\.name\] \? `\$\{field\.name\}-error` : undefined\}/,
  "HostHackathon generated fields must connect controls to generated error IDs"
);
assert.match(
  hostHackathon,
  /id=\{name\}[\s\S]*aria-invalid=\{errors\[name\] \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\[name\] \? `\$\{name\}-error` : undefined\}/,
  "HostHackathon date fields must reference their generated error IDs"
);
assert.match(
  hostHackathon,
  /id="description"[\s\S]*aria-invalid=\{errors\.description \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\.description \? "description-error" : undefined\}/,
  "HostHackathon description textarea must reference its error"
);

assert.match(
  feedbackPage,
  /const errorId = `\$\{id\}-error`/,
  "Feedback floating controls must derive stable validation message IDs"
);
assert.match(
  feedbackPage,
  /aria-invalid=\{error \? "true" : "false"\}[\s\S]*aria-describedby=\{error \? errorId : undefined\}/,
  "Feedback floating controls must connect invalid controls to error text"
);
assert.match(
  feedbackPage,
  /id="message"[\s\S]*aria-invalid=\{errors\.message \? "true" : "false"\}[\s\S]*aria-describedby=\{errors\.message \? "message-error" : undefined\}/,
  "Feedback message textarea must reference its error"
);
assert.match(
  feedbackPage,
  /id="message-error"[\s\S]*role="alert"[\s\S]*aria-live="polite"/,
  "Feedback message error must have alert/live semantics"
);
assert.match(
  feedbackPage,
  /role="radiogroup"[\s\S]*aria-invalid=\{error \? "true" : "false"\}[\s\S]*aria-describedby=\{error \? errorId : undefined\}/,
  "Feedback rating group must expose validation state"
);

assert.match(
  formInput,
  /const errorId = fieldId \? `\$\{fieldId\}-error` : undefined/,
  "FormInput must derive stable error IDs from id or name"
);
assert.match(
  formInput,
  /aria-invalid=\{error \? "true" : "false"\}[\s\S]*aria-describedby=\{error && errorId \? errorId : props\["aria-describedby"\]\}/,
  "FormInput must connect invalid fields to their error messages"
);
assert.match(
  formInput,
  /<p id=\{errorId\}[\s\S]*role="alert"[\s\S]*aria-live="polite"/,
  "FormInput errors must expose IDs and live alert semantics"
);

console.log("validation accessibility tests passed");
