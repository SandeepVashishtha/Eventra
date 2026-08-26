import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import babel from "next/dist/compiled/babel/core.js";
import transformModulesCommonJs from "next/dist/compiled/babel/plugin-transform-modules-commonjs.js";
import presetReact from "next/dist/compiled/babel/preset-react.js";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
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

async function loadFooter({ getBackendBuildVersion = async () => null } = {}) {
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
        return { getBackendBuildVersion };
      }
      throw new Error(`Unexpected footer dependency: ${specifier}`);
    },
  });

  return footerModule.exports;
}

async function renderMountedFooterBuildVersion(getBackendBuildVersion) {
  const dom = new JSDOM("<!doctype html><div id=\"root\"></div>", {
    url: "http://localhost/",
  });
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const { FooterBuildVersion } = await loadFooter({ getBackendBuildVersion });
  const container = dom.window.document.querySelector("#root");
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(React.createElement(FooterBuildVersion));
    });
    return container.innerHTML;
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
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
      name: "missing service field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return { apiVersion: "v1", buildVersion: "0.0.1-SNAPSHOT" };
        },
      }),
    },
    {
      name: "unexpected service field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return {
            service: "another-backend",
            apiVersion: "v1",
            buildVersion: "0.0.1-SNAPSHOT",
          };
        },
      }),
    },
    {
      name: "missing apiVersion field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return {
            service: "eventra-backend",
            buildVersion: "0.0.1-SNAPSHOT",
          };
        },
      }),
    },
    {
      name: "unexpected apiVersion field",
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return {
            service: "eventra-backend",
            apiVersion: "v2",
            buildVersion: "0.0.1-SNAPSHOT",
          };
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

test("loads and renders the successful backend build version in the footer status", async () => {
  const markup = await renderMountedFooterBuildVersion(
    async () => "0.0.1-SNAPSHOT",
  );

  assert.match(markup, /Backend build:/);
  assert.match(markup, /0\.0\.1-SNAPSHOT/);
  assert.match(markup, /aria-live="polite"/);
});

test("renders an unavailable footer status without removing existing content", async () => {
  const { default: Footer, FooterBuildVersion } = await loadFooter();

  assert.equal(typeof FooterBuildVersion, "function");
  const statusMarkup = await renderMountedFooterBuildVersion(
    async () => null,
  );
  const footerMarkup = renderToStaticMarkup(React.createElement(Footer));

  assert.match(statusMarkup, /Backend build:/);
  assert.match(statusMarkup, /Unavailable/);
  assert.match(footerMarkup, /Backend build:/);
  assert.match(footerMarkup, /Unavailable/);
  assert.match(footerMarkup, /Eventra/);
  assert.match(footerMarkup, /Privacy Policy/);
});
