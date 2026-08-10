import fs from "node:fs";
import assert from "node:assert/strict";

const socialLogin = fs.readFileSync("src/components/auth/SocialLogin.js", "utf8");
const authService = fs.readFileSync("src/services/authService.js", "utf8");
const authContext = fs.readFileSync("src/context/AuthContext.js", "utf8");

assert.equal(socialLogin.includes("window.location.href"), false);
assert.equal(socialLogin.includes("API_ENDPOINTS.AUTH.GITHUB"), false);
assert.equal(socialLogin.includes("window.google.accounts.id.initialize"), true);
assert.equal(authService.includes("googleLogin"), true);
assert.equal(authContext.includes("googleLogin,"), true);

console.log("social login contract checks passed");
