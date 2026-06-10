import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

assert.equal(
  existsSync("src/Pages/Events/EventAnalyticsDashboard.js"),
  false,
  "the conflicting .js dashboard implementation should be removed",
);
assert.equal(
  existsSync("src/Pages/Events/EventAnalyticsDashboard.jsx"),
  true,
  "the canonical dashboard implementation should remain",
);

const routes = readFileSync("src/components/routes/ProtectedRoutes.js", "utf8");
assert.match(
  routes,
  /import\("\.\.\/\.\.\/Pages\/Events\/EventAnalyticsDashboard\.jsx"\)/,
  "the protected route should import the canonical dashboard explicitly",
);

console.log("canonical event analytics dashboard contract passed");
