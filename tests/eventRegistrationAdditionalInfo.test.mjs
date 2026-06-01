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
);

assert.match(
  source,
  /await apiUtils\.post\([\s\S]*\{\s*\.\.\.formData,/,
  "Registration submission should include additionalInfo through formData once"
);

console.log("event registration additional info tests passed");
