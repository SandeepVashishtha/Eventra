import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateE2EEKeyPair, encryptE2EEMessage, decryptE2EEMessage } from "../src/utils/security/e2eeManager.js";

describe("E2EE Encryption & Decryption Engine Tests", () => {
  it("should generate ECDH P-256 key pair", async () => {
    const keys = await generateE2EEKeyPair();
    assert.ok(keys);
  });

  it("should encrypt and decrypt plaintext message cleanly", async () => {
    const originalText = "VIP Zoom Meeting Passcode: 884-102-993";
    const encrypted = await encryptE2EEMessage(originalText, "recipient-pub-key");

    assert.ok(encrypted.ciphertext);
    assert.ok(encrypted.iv);
    assert.equal(encrypted.isEncrypted, true);
    assert.notEqual(encrypted.ciphertext, originalText);

    const decrypted = await decryptE2EEMessage(encrypted);
    assert.equal(decrypted, originalText);
  });
});
