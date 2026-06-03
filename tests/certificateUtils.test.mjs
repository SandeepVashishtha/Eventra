import assert from "node:assert/strict";
import { verifyCertificate } from "../src/utils/certificateUtils.js";

globalThis.fetch = async (url) => {
  if (url.includes("success-uid")) {
    return {
      ok: true,
      json: async () => ({ name: "Test User", skills: ["JS"], badges: ["Active"] })
    };
  }
  return {
    ok: false,
    text: async () => "Certificate not found"
  };
};

try {
  const result = await verifyCertificate("success-uid");
  assert.equal(result.success, true);
  assert.equal(result.data.name, "Test User");
  assert.deepStrictEqual(result.data.skills, ["JS"]);

  const failResult = await verifyCertificate("invalid-uid");
  assert.equal(failResult.success, false);
  assert.match(failResult.error, /Certificate not found/);

  const missingResult = await verifyCertificate("");
  assert.equal(missingResult.success, false);
  assert.match(missingResult.error, /UID is required/);

  console.log("certificateUtils tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
