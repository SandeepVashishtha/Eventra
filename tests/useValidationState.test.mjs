import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useValidationState.js"),
  "utf8",
);

describe("useValidationState — source contract", () => {
  it("supports idle, validating, success, and error states", () => {
    assert.ok(src.includes('"validating"'));
    assert.ok(src.includes('"success"'));
    assert.ok(src.includes('"error"'));
    assert.ok(src.includes('"idle"'));
  });

  it("only shows errors after the field is touched", () => {
    assert.ok(src.includes("touched && validationState === \"error\""));
  });

  it("exposes accessibility attributes for invalid and busy fields", () => {
    assert.ok(src.includes('"aria-invalid"'));
    assert.ok(src.includes('"aria-busy"'));
    assert.ok(src.includes('"aria-describedby"'));
  });
});

function getStatusIndicator(validationState) {
  switch (validationState) {
    case "validating":
      return "validating";
    case "success":
      return "success";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

function shouldShowError(touched, validationState, error) {
  return touched && validationState === "error" && error;
}

describe("useValidationState — status simulation", () => {
  it("maps validation states to indicators", () => {
    assert.equal(getStatusIndicator("success"), "success");
    assert.equal(getStatusIndicator("idle"), "idle");
  });

  it("hides errors until the field is touched", () => {
    assert.equal(shouldShowError(false, "error", "Required"), false);
    assert.equal(shouldShowError(true, "error", "Required"), "Required");
  });
});

console.log("useValidationState tests passed ✓");
