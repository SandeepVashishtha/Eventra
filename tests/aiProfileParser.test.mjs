import assert from "node:assert/strict";
import { parseResumePDF } from "../src/utils/aiProfileParser.js";

const file = { name: "john_doe_resume.pdf", type: "application/pdf" };
const res = await parseResumePDF(file);
assert.equal(res.fullName, "John Doe Resume");
assert.ok(res.skills.includes("Python") || res.skills.includes("JavaScript"));
console.log("aiProfileParser tests passed ✓");
