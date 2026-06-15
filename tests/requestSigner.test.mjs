import assert from "node:assert";
import { signRequest } from "../src/utils/requestSigner.js";

const payload = {
  id: 1,
  action: "register",
};

const signed = signRequest(
  payload,
  "test-secret"
);

assert.ok(signed.timestamp);
assert.ok(signed.nonce);
assert.ok(signed.signature);

console.log(
  "requestSigner tests passed"
);