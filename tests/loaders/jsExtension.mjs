/**
 * Node.js ESM loader hook that adds .js extension when bare specifiers
 * within the src/ tree are imported without one (e.g. './timezoneUtils').
 *
 * Usage:
 *   node --loader tests/loaders/jsExtension.mjs tests/reminderUtils.test.mjs
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "react") {
    const mockReactPath = path.resolve("tests/mocks/react.js");
    return nextResolve(pathToFileURL(mockReactPath).href, context);
  }
  if (specifier === "idb-keyval") {
    const mockIdbPath = path.resolve("tests/mocks/idb-keyval.js");
    return nextResolve(pathToFileURL(mockIdbPath).href, context);
  }
  // Only patch relative imports that lack an extension
  if (specifier.startsWith(".") && !path.extname(specifier)) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const candidate = path.join(parentDir, `${specifier}.js`);
    if (fs.existsSync(candidate)) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }
  return nextResolve(specifier, context);
}
