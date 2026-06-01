import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/Pages/Events/EventRegistration.js", "utf8");

const count = (pattern) => (source.match(pattern) || []).length;

assert.equal(
  count(/Additional Information \(Optional\)/g),
  1,
  "Registration form should render one Additional Information label"
);

assert.equal(
  count(/id="additionalInfo"/g),
  1,
  "Registration form should define one additionalInfo id"
);

assert.equal(
  count(/name="additionalInfo"/g),
  1,
  "Registration form should define one additionalInfo field name"
);

assert.match(
  source,
  /<label\s+htmlFor="additionalInfo"[\s\S]*?Additional Information \(Optional\)[\s\S]*?<\/label>\s*<textarea\s+id="additionalInfo"\s+name="additionalInfo"[\s\S]*?value=\{formData\.additionalInfo\}[\s\S]*?onChange=\{handleChange\}/,
  "Additional Information textarea should have a single accessible label and state binding"
const sourcePath = "src/Pages/Events/EventRegistration.js";
const source = readFileSync(sourcePath, "utf8");

const additionalInfoLabelMatches =
  source.match(/Additional Information \(Optional\)/g) || [];
const additionalInfoTextareaMatches =
  source.match(/<textarea[\s\S]*?name="additionalInfo"[\s\S]*?>/g) || [];
const additionalInfoIdMatches =
  source.match(/id="additionalInfo"/g) || [];

assert.equal(
  additionalInfoLabelMatches.length,
  1,
  `${sourcePath} must render exactly one Additional Information label`
);

assert.equal(
  additionalInfoTextareaMatches.length,
  1,
  `${sourcePath} must render exactly one additionalInfo textarea`
);

assert.equal(
  additionalInfoIdMatches.length,
  1,
  `${sourcePath} must not duplicate the additionalInfo id`
);

const additionalInfoTextarea = additionalInfoTextareaMatches[0];

assert.match(
  additionalInfoTextarea,
  /value=\{formData\.additionalInfo\}/,
  "The single Additional Information textarea must read from formData.additionalInfo"
);

assert.match(
  additionalInfoTextarea,
  /onChange=\{handleChange\}/,
  "The single Additional Information textarea must update through the shared form handler"
);

assert.match(
  additionalInfoTextarea,
  /maxLength=\{MAX_NOTES_CHARS\}/,
  "The single Additional Information textarea must use the shared character limit"
);

assert.doesNotMatch(
  source,
  /maxLength=\{?500\}?/,
  "Additional Information should not reintroduce the removed hard-coded duplicate field"
);

assert.match(
  source,
  /formData\.additionalInfo\?\.length \|\| 0/,
  "The Additional Information counter must safely handle an empty value"
);

const submitSection = source.slice(
  source.indexOf("await apiUtils.post("),
  source.indexOf("// Axios resolves for 2xx")
);

assert.match(
  submitSection,
  /\.\.\.formData/,
  "The live registration payload must include additionalInfo through formData"
);

const offlinePayloadSection = source.slice(
  source.indexOf("const payload = {"),
  source.indexOf("const success = await pushToQueue")
);

assert.match(
  offlinePayloadSection,
  /\.\.\.formData/,
  "The offline queued registration payload must include additionalInfo through formData"
);

assert.match(
  source,
  /await apiUtils\.post\([\s\S]*\{\s*\.\.\.formData,/,
  "Registration submission should include additionalInfo through formData once"
);

console.log("event registration additional info tests passed");
  /addRegistration\(event, formData\)/,
  "Local registration state must continue receiving the submitted formData"
);

console.log("event registration additionalInfo tests passed");
