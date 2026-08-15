import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(__dirname, "../src/components/common/EventCreation/EventCreation.jsx"),
  "utf8",
);

describe("EventCreation hook order", () => {
  it("declares formData state before useFormDirty(formData)", () => {
    const stateIndex = source.search(
      /const \[formData, setFormData\] = useState\(initialFormData(?:\(\))?\)/,
    );
    const dirtyIndex = source.indexOf("useFormDirty(formData)");
    assert.ok(stateIndex >= 0, "formData useState must exist");
    assert.ok(dirtyIndex >= 0, "useFormDirty(formData) must exist");
    assert.ok(stateIndex < dirtyIndex, "formData must be initialized before useFormDirty");
  });
});
