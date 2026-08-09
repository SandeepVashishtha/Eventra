import assert from "node:assert";

import { signRequest } from "../src/utils/requestSigner.js";

import { validateSignature } from "../src/utils/signatureValidator.js";

const payload = {
  userId: 123,
};

const secret = "test-secret";

const signed = signRequest(
  payload,
  secret
);

const result = validateSignature(
  payload,
  signed.timestamp,
  signed.nonce,
  signed.signature,
  secret
);

assert.equal(result.valid, true);

console.log(
  "requestSignature tests passed"
);