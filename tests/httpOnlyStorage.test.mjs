import assert from "node:assert/strict";

let cookieJar = "";

globalThis.document = {
  get cookie() {
    return cookieJar;
  },
  set cookie(value) {
    const [pair, ...attrs] = value.split(";").map((part) => part.trim());
    const [name] = pair.split("=");
    const maxAgeAttr = attrs.find((a) => a.toLowerCase().startsWith("max-age="));
    const expiresAttr = attrs.find((a) => a.toLowerCase().startsWith("expires="));

    if (
      (maxAgeAttr && maxAgeAttr.split("=")[1] === "0") ||
      (expiresAttr && expiresAttr.includes("1970"))
    ) {
      const existing = cookieJar
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c && !c.startsWith(`${name}=`));
      cookieJar = existing.join("; ");
      return;
    }

    const without = cookieJar
      .split(";")
      .map((c) => c.trim())
      .filter((c) => c && !c.startsWith(`${name}=`));
    cookieJar = [...without, pair, ...attrs].filter(Boolean).join("; ");
  },
};

const { getCookie, setCookie, deleteCookie } = await import(
  "../src/utils/httpOnlyStorage.js"
);

cookieJar = "";

setCookie("session", "abc123", { secure: false });
assert.equal(getCookie("session"), "abc123", "reads a set cookie");

setCookie("prefs", "dark", { path: "/app", secure: false });
assert.equal(getCookie("prefs"), "dark", "reads cookie with path option");

setCookie("encoded", "hello world", { secure: false });
assert.equal(getCookie("encoded"), "hello world", "round-trips URI-encoded values");

deleteCookie("session", { secure: false });
assert.equal(getCookie("session"), null, "deleteCookie removes the cookie");

assert.equal(getCookie("missing"), null, "unknown cookie returns null");
assert.equal(getCookie(""), null, "empty name returns null");

cookieJar = "legacy=plain%20text";
assert.equal(getCookie("legacy"), "plain text", "reads legacy unencoded names");

console.log("httpOnlyStorage tests passed ✓");
