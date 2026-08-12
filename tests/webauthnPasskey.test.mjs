import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPasskeySupported, registerPasskeyBiometrics } from "../src/utils/security/passkey/webauthnClient.js";

describe("FIDO2 WebAuthn Passkey Security Tests", () => {
  it("should evaluate passkey support safely in test environment", async () => {
    const supported = await isPasskeySupported();
    assert.equal(typeof supported, "boolean");
  });

  it("should generate passkey credential object with user email", async () => {
    const res = await registerPasskeyBiometrics("test@eventra.io");
    assert.ok(res.credentialId);
    assert.equal(res.userEmail, "test@eventra.io");
  });
});
