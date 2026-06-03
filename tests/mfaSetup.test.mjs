import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/Pages/Auth/MFASetup.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

describe("MFASetup Component Structure", () => {
  it("exports MFASetup as default export", () => {
    assert.ok(
      componentSrc.includes("export default MFASetup"),
      "Component must export MFASetup as default export"
    );
  });

  it("uses the useMFA hook", () => {
    assert.ok(
      componentSrc.includes("useMFA()"),
      "Component must call the useMFA hook"
    );
  });

  it("renders a ShieldCheck icon for security branding", () => {
    assert.ok(
      componentSrc.includes("ShieldCheck"),
      "Component must include ShieldCheck icon from lucide-react"
    );
  });

  it("renders the page title Multi-Factor Auth", () => {
    assert.ok(
      componentSrc.includes("Multi-Factor Auth"),
      "Component must display 'Multi-Factor Auth' header"
    );
  });

  it("supports starting MFA enrollment process", () => {
    assert.ok(
      componentSrc.includes("onClick={startEnrollment}"),
      "Component must wire startEnrollment function to the button click"
    );
  });

  it("supports code verification", () => {
    assert.ok(
      componentSrc.includes("onClick={() => verifyAndEnable(code)}"),
      "Component must wire verifyAndEnable function to code verification button"
    );
  });

  it("enforces a 6-digit maxLength constraint on the verification code input", () => {
    assert.ok(
      componentSrc.includes("maxLength={6}"),
      "Component must enforce a maximum length of 6 for the verification code"
    );
  });
});
