import assert from "node:assert/strict";

process.env.REACT_APP_API_URL = "https://api.eventra.test";

let requestedUrl = "";
global.fetch = async (url) => {
  requestedUrl = url;
  if (String(url).includes("missing")) {
    return { ok: false, text: async () => "Certificate not found" };
  }
  return {
    ok: true,
    json: async () => ({ name: "Ada Lovelace", skills: ["React"], badges: ["Builder"] }),
  };
};

const { verifyCertificate } = await import("../src/utils/certificateUtils.js");

await assert.rejects(() => verifyCertificate(""), /UID is required/);

const result = await verifyCertificate("cert-123");
assert.equal(requestedUrl, "https://api.eventra.test/api/verify-certificate/cert-123");
assert.deepEqual(result, {
  name: "Ada Lovelace",
  skills: ["React"],
  badges: ["Builder"],
});

await assert.rejects(() => verifyCertificate("missing"), /Certificate not found/);

delete global.fetch;
delete process.env.REACT_APP_API_URL;

console.log("certificateUtils tests passed ✓");
