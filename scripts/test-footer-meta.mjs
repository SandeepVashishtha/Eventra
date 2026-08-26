import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import babel from "next/dist/compiled/babel/core.js";
import transformModulesCommonJs from "next/dist/compiled/babel/plugin-transform-modules-commonjs.js";
import presetReact from "next/dist/compiled/babel/preset-react.js";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";

const apiPath = new URL("../src/lib/api.js", import.meta.url);
const footerPath = new URL("../src/components/Footer.jsx", import.meta.url);

async function loadApi() {
  const source = await readFile(apiPath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: apiPath.pathname,
    plugins: [transformModulesCommonJs],
  });
  const apiModule = { exports: {} };

  vm.runInNewContext(code, {
    console,
    module: apiModule,
    exports: apiModule.exports,
    process: { env: {} },
    require(specifier) {
      throw new Error(`Unexpected API dependency: ${specifier}`);
    },
  });

  return apiModule.exports;
}

async function loadFooter() {
  const source = await readFile(footerPath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: footerPath.pathname,
    plugins: [transformModulesCommonJs],
    presets: [[presetReact, { runtime: "automatic" }]],
  });
  const footerModule = { exports: {} };
  const renderLink = ({ children, ...props }) =>
    React.createElement("a", props, children);
  const renderImage = ({ alt, ...props }) =>
    React.createElement("img", { alt, ...props });
  const renderIcon = (props) => React.createElement("span", props);
  const icons = new Proxy({}, { get: () => renderIcon });

  vm.runInNewContext(code, {
    console,
    module: footerModule,
    exports: footerModule.exports,
    require(specifier) {
      if (specifier === "react") return React;
      if (specifier === "react/jsx-runtime") return jsxRuntime;
      if (specifier === "next/link") {
        return { __esModule: true, default: renderLink };
      }
      if (specifier === "next/image") {
        return { __esModule: true, default: renderImage };
      }
      if (specifier === "lucide-react") return icons;
      if (specifier === "@/lib/api") {
        return { getBackendBuildVersion: async () => null };
      }
      throw new Error(`Unexpected footer dependency: ${specifier}`);
    },
  });

  return footerModule.exports;
}

test("requests public backend metadata and returns its stable build version", async () => {
  const { getBackendBuildVersion } = await loadApi();
  let requestedUrl;

  const buildVersion = await getBackendBuildVersion(async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      async json() {
        return {
          service: "eventra-backend",
          apiVersion: "v1",
          buildVersion: "0.0.1-SNAPSHOT",
        };
      },
    };
  });

  assert.equal(requestedUrl, "http://localhost:8080/api/meta");
  assert.equal(buildVersion, "0.0.1-SNAPSHOT");
});

test("returns the non-disruptive unavailable value for every metadata failure", async (t) => {
  const { getBackendBuildVersion } = await loadApi();
  const cases = [
    {
      name: "request rejection",
      fetchImpl: async () => {
        throw new Error("backend offline");
      },
    },
    {
      name: "non-success response",
      fetchImpl: async () => ({
        ok: false,
        status: 503,
        async json() {
          return {
            service: "eventra-backend",
            apiVersion: "v1",
            buildVersion: "misleading-error-body-version",
          };
        },
      }),
    },
    {
      name: "JSON parse failure",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          throw new SyntaxError("invalid JSON");
        },
      }),
    },
    {
      name: "malformed JSON shape",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return ["eventra-backend", "v1", "0.0.1-SNAPSHOT"];
        },
      }),
    },
    {
      name: "missing buildVersion field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return { service: "eventra-backend", apiVersion: "v1" };
        },
      }),
    },
    {
      name: "empty buildVersion field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return {
            service: "eventra-backend",
            apiVersion: "v1",
            buildVersion: "   ",
          };
        },
      }),
    },
  ];

  for (const { name, fetchImpl } of cases) {
    await t.test(name, async () => {
      assert.equal(await getBackendBuildVersion(fetchImpl), null);
    });
  }
});

test("renders the successful backend build version in the footer status", async () => {
  const { FooterBuildVersion } = await loadFooter();

  assert.equal(typeof FooterBuildVersion, "function");
  const markup = renderToStaticMarkup(
    React.createElement(FooterBuildVersion, {
      buildVersion: "0.0.1-SNAPSHOT",
    }),
  );

  assert.match(markup, /Backend build:/);
  assert.match(markup, /0\.0\.1-SNAPSHOT/);
  assert.match(markup, /aria-live="polite"/);
});

test("renders an unavailable footer status without removing existing content", async () => {
  const { default: Footer, FooterBuildVersion } = await loadFooter();

  assert.equal(typeof FooterBuildVersion, "function");
  const statusMarkup = renderToStaticMarkup(
    React.createElement(FooterBuildVersion, { buildVersion: null }),
  );
  const footerMarkup = renderToStaticMarkup(React.createElement(Footer));

  assert.match(statusMarkup, /Backend build:/);
  assert.match(statusMarkup, /Unavailable/);
  assert.match(footerMarkup, /Backend build:/);
  assert.match(footerMarkup, /Unavailable/);
  assert.match(footerMarkup, /Eventra/);
  assert.match(footerMarkup, /Privacy Policy/);
});
