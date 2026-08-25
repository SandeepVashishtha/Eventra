import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import babel from "next/dist/compiled/babel/core.js";
import transformModulesCommonJs from "next/dist/compiled/babel/plugin-transform-modules-commonjs.js";
import presetReact from "next/dist/compiled/babel/preset-react.js";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";

const layoutPath = new URL("../src/app/layout.jsx", import.meta.url);

async function loadRootLayout() {
  const source = await readFile(layoutPath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: layoutPath.pathname,
    plugins: [transformModulesCommonJs],
    presets: [[presetReact, { runtime: "automatic" }]],
  });
  const layoutModule = { exports: {} };
  const passthrough = ({ children }) => children;
  const require = (specifier) => {
    if (specifier === "next/font/google") {
      return {
        Geist: () => ({ variable: "geist-sans" }),
        Geist_Mono: () => ({ variable: "geist-mono" }),
      };
    }
    if (specifier === "react/jsx-runtime") {
      return jsxRuntime;
    }
    if (specifier === "@/context/DrawerContext") {
      return { DrawerProvider: passthrough };
    }
    if (specifier.startsWith("@/components/") || specifier.endsWith(".css")) {
      return { __esModule: true, default: passthrough };
    }
    throw new Error(`Unexpected layout dependency: ${specifier}`);
  };

  vm.runInNewContext(code, {
    module: layoutModule,
    exports: layoutModule.exports,
    require,
  });
  return layoutModule.exports.default;
}

test("scopes expected browser-extension hydration suppression to the body", async () => {
  const RootLayout = await loadRootLayout();
  const html = RootLayout({ children: React.createElement("main") });
  const body = html.props.children;

  assert.equal(html.type, "html");
  assert.equal(html.props.suppressHydrationWarning, undefined);
  assert.equal(body.type, "body");
  assert.equal(body.props.suppressHydrationWarning, true);
});
