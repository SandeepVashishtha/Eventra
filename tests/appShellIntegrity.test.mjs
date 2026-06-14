import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appShellPath = "src/App.jsx";
const appShellSource = readFileSync(appShellPath, "utf8");
const protectedRoutesPath = "src/components/routes/ProtectedRoutes.js";
const protectedRoutesSource = readFileSync(protectedRoutesPath, "utf8");
const malformedSeparatorPattern = /\u00e2\u20ac\u201d/;

assert.doesNotMatch(
  appShellSource,
  /^(<<<<<<<|=======|>>>>>>>)/m,
  `${appShellPath} must not contain unresolved Git conflict markers`
);

assert.doesNotMatch(
  appShellSource,
  malformedSeparatorPattern,
  `${appShellPath} must not contain malformed separator text`
);

assert.match(
  appShellSource,
  /import\s+\{\s*getAuthRoutes,\s*getProtectedRoutes\s*\}\s+from\s+"\.\/components\/routes\/ProtectedRoutes"/,
  `${appShellPath} must import the shared auth and protected route definitions`
);

assert.match(
  appShellSource,
  /\{getAuthRoutes\(\)\}/,
  `${appShellPath} must mount auth routes directly for bookmarked auth URLs`
);

assert.match(
  appShellSource,
  /\{getProtectedRoutes\(\)\}/,
  `${appShellPath} must mount protected routes directly for dashboard/admin/profile URLs`
);

for (const routePath of ["/login", "/register", "/signup"]) {
  assert.match(
    protectedRoutesSource,
    new RegExp(`path="${routePath}"`),
    `${protectedRoutesPath} must define direct auth route ${routePath}`
  );
}

for (const routePath of ["/dashboard", "/admin", "/profile", "/dashboard/profile"]) {
  assert.match(
    protectedRoutesSource,
    new RegExp(`path="${routePath}"`),
    `${protectedRoutesPath} must define protected direct route ${routePath}`
  );
}

console.log("app shell integrity tests passed");
