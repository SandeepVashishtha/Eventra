/**
 * Request-signing wiring test.
 *
 * The signing utilities (requestSigner / signatureValidator) are only useful
 * if the live API request interceptor actually attaches the signature headers.
 * Since interceptors.js imports through the Vite `utils/*` alias (not
 * resolvable under plain `node --test`), this test statically asserts the
 * wiring in the interceptor source and dynamically verifies the sign →
 * validate round-trip against the exact header names used on the wire.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { signRequest } from "../src/utils/requestSigner.js";
import { validateSignature } from "../src/utils/signatureValidator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const interceptorCode = fs.readFileSync(
  path.resolve(repoRoot, "src/config/api/interceptors.js"),
  "utf8",
);
const signerCode = fs.readFileSync(
  path.resolve(repoRoot, "src/utils/requestSigner.js"),
  "utf8",
);

const SECRET = "wire-contract-test-secret";

describe("request signing wiring", () => {
  it("the live interceptor imports signRequest", () => {
    assert.match(
      interceptorCode,
      /import\s*\{\s*signRequest\s*\}\s*from\s*["'][^"']*requestSigner\.js["']/,
      "setupRequestInterceptor must import signRequest",
    );
  });

  it("signing is scoped to mutating methods only", () => {
    assert.match(
      interceptorCode,
      /SIGNED_METHODS\s*=\s*new Set\(\[["']POST["'],\s*["']PUT["'],\s*["']PATCH["'],\s*["']DELETE["']\]\)/,
      "SIGNED_METHODS must cover POST, PUT, PATCH and DELETE",
    );
  });

  it("attaches the x-timestamp/x-nonce/x-signature header contract", () => {
    assert.match(
      interceptorCode,
      /config\.headers\[["']x-timestamp["']\]/,
      "interceptor must set the x-timestamp header",
    );
    assert.match(
      interceptorCode,
      /config\.headers\[["']x-nonce["']\]/,
      "interceptor must set the x-nonce header",
    );
    assert.match(
      interceptorCode,
      /config\.headers\[["']x-signature["']\]/,
      "interceptor must set the x-signature header",
    );
  });

  it("does not read a VITE_ signing secret (those are public in the bundle)", () => {
    assert.doesNotMatch(
      interceptorCode,
      /VITE_REQUEST_SIGNING_SECRET/,
      "interceptor must not read VITE_REQUEST_SIGNING_SECRET",
    );
    assert.match(
      interceptorCode,
      /["']REQUEST_SIGNING_SECRET["']/,
      "interceptor may only read a non-VITE REQUEST_SIGNING_SECRET",
    );
  });

  it("no file under src/ references the VITE_ signing secret anywhere", () => {
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : full;
      });
    const offenders = [];
    for (const file of walk(path.join(repoRoot, "src"))) {
      if (!/\.(js|jsx|ts|tsx|mjs)$/.test(file)) {
        continue;
      }
      if (fs.readFileSync(file, "utf8").includes("VITE_REQUEST_SIGNING_SECRET")) {
        offenders.push(path.relative(repoRoot, file));
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `VITE_REQUEST_SIGNING_SECRET must never appear under src/ (it is inlined into the client bundle): ${offenders.join(", ")}`,
    );
  });

  it("requestSigner never reads a signing secret from the environment", () => {
    assert.doesNotMatch(
      signerCode,
      /VITE_REQUEST_SIGNING_SECRET/,
      "requestSigner must not read VITE_REQUEST_SIGNING_SECRET",
    );
    assert.doesNotMatch(
      signerCode,
      /import\.meta\.env/,
      "requestSigner must not read import.meta.env (bundle-inlined)",
    );
    assert.doesNotMatch(
      signerCode,
      /process\.env/,
      "requestSigner must not read process.env for a signing secret",
    );
  });

  it("signRequest output validates server-side under the wire header names", async () => {
    const payload = { eventId: "evt-1", action: "register" };

    const { timestamp, nonce, signature } = await signRequest(payload, SECRET);

    const result = await validateSignature(
      payload,
      timestamp,
      nonce,
      signature,
      SECRET,
    );

    assert.equal(result.valid, true, `signature must validate: ${result.error}`);
    assert.equal(typeof timestamp, "string");
    assert.equal(typeof nonce, "string");
    assert.equal(typeof signature, "string");
  });

  it("a signature produced for a different payload is rejected", async () => {
    const { timestamp, nonce, signature } = await signRequest({ eventId: "evt-1" }, SECRET);

    const result = await validateSignature(
      { eventId: "evt-2" },
      timestamp,
      nonce,
      signature,
      SECRET,
    );

    assert.equal(result.valid, false);
  });
});
