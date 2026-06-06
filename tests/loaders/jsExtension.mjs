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
    const mockReactPath = path.resolve("tests/helpers/mockReact.js");
    return {
      url: pathToFileURL(mockReactPath).href,
      shortCircuit: true
    };
  }
  if (specifier === "react-router-dom") {
    const mockRouterPath = path.resolve("tests/helpers/mockReactRouter.js");
    return {
      url: pathToFileURL(mockRouterPath).href,
      shortCircuit: true
    };
  }
  if (specifier === "idb-keyval") {
    const mockIdbPath = path.resolve("tests/helpers/mockIdbKeyval.js");
    return {
      url: pathToFileURL(mockIdbPath).href,
      shortCircuit: true
    };
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

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const filePath = fileURLToPath(url);
    const rawSource = fs.readFileSync(filePath, "utf-8");
    return {
      format: "module",
      source: `export default ${rawSource};`,
      shortCircuit: true
    };
  }
  return nextLoad(url, context);
}
