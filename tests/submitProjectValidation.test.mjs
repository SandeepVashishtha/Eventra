import assert from "node:assert/strict";
import { REQUIRED_FIELDS, validateSubmitProjectForm } from "../src/utils/submitProjectValidation.js";

const validData = {
  projectName: "My Project",
  teamName: "My Team",
  email: "me@example.com",
  githubLink: "https://github.com/me/repo",
  projectType: "Web",
  techStack: "React",
  description: "A description that is long enough to pass validation.",
};

// A fully valid submission has no errors
assert.deepEqual(validateSubmitProjectForm(validData), {});

// Every required field is flagged, with a formatted (spaced, capitalized) name
const emptyErrors = validateSubmitProjectForm({});
for (const field of REQUIRED_FIELDS) {
  assert.ok(emptyErrors[field], `expected an error for required field "${field}"`);
}
assert.equal(emptyErrors.projectName, "Project Name is required.");
assert.equal(emptyErrors.techStack, "Tech Stack is required.");

// Whitespace-only required fields fail validation (required check fires;
// the length check then also fires since trimmed length is 0, and wins)
assert.ok(validateSubmitProjectForm({ ...validData, projectName: "   " }).projectName);

// Length bounds: projectName / teamName (3-100), description (20-2000)
assert.equal(
  validateSubmitProjectForm({ ...validData, projectName: "ab" }).projectName,
  "Project Name must be between 3 and 100 characters."
);
assert.equal(
  validateSubmitProjectForm({ ...validData, projectName: "a".repeat(101) }).projectName,
  "Project Name must be between 3 and 100 characters."
);
assert.equal(
  validateSubmitProjectForm({ ...validData, teamName: "ab" }).teamName,
  "Team Name must be between 3 and 100 characters."
);
assert.equal(
  validateSubmitProjectForm({ ...validData, description: "too short" }).description,
  "Description must be between 20 and 2000 characters."
);
assert.equal(
  validateSubmitProjectForm({ ...validData, description: "a".repeat(2001) }).description,
  "Description must be between 20 and 2000 characters."
);

// Email regex
assert.equal(
  validateSubmitProjectForm({ ...validData, email: "not-an-email" }).email,
  "Please enter a valid email address."
);
assert.equal(validateSubmitProjectForm({ ...validData, email: "a@b.co" }).email, undefined);

// GitHub URL regex accepts with/without protocol and www, rejects non-github URLs
assert.equal(validateSubmitProjectForm({ ...validData, githubLink: "github.com/me/repo" }).githubLink, undefined);
assert.equal(validateSubmitProjectForm({ ...validData, githubLink: "https://www.github.com/me/repo" }).githubLink, undefined);
assert.equal(
  validateSubmitProjectForm({ ...validData, githubLink: "https://gitlab.com/me/repo" }).githubLink,
  "Please enter a valid GitHub repository URL."
);

// Live demo link is optional but validated when present
assert.equal(validateSubmitProjectForm({ ...validData, liveDemoLink: "" }).liveDemoLink, undefined);
assert.equal(
  validateSubmitProjectForm({ ...validData, liveDemoLink: "not a url" }).liveDemoLink,
  "Please enter a valid URL."
);
assert.equal(
  validateSubmitProjectForm({ ...validData, liveDemoLink: "https://project-demo.com" }).liveDemoLink,
  undefined
);

// Project image accepts base64 data URLs or plain URLs, optional otherwise
assert.equal(validateSubmitProjectForm({ ...validData, projectImage: "" }).projectImage, undefined);
assert.equal(
  validateSubmitProjectForm({ ...validData, projectImage: "data:image/png;base64,abc123" }).projectImage,
  undefined
);
assert.equal(
  validateSubmitProjectForm({ ...validData, projectImage: "https://example.com/logo.png" }).projectImage,
  undefined
);
assert.equal(
  validateSubmitProjectForm({ ...validData, projectImage: "not-a-url-or-base64" }).projectImage,
  "Please enter a valid image URL."
);

console.log("submitProjectValidation tests passed ✓");
