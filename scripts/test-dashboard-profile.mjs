import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import babel from "next/dist/compiled/babel/core.js";
import transformModulesCommonJs from "next/dist/compiled/babel/plugin-transform-modules-commonjs.js";
import presetReact from "next/dist/compiled/babel/preset-react.js";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import * as jsxRuntime from "react/jsx-runtime";

const apiPath = new URL("../src/lib/api.js", import.meta.url);
const dashboardPath = new URL("../src/app/dashboard/page.jsx", import.meta.url);

const initialProfile = {
  email: "alex@example.com",
  firstName: "Alex",
  lastName: "Rivera",
  username: "current-user",
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

async function loadApi({ fetchImpl, storage }) {
  const source = await readFile(apiPath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: apiPath.pathname,
    plugins: [transformModulesCommonJs],
  });
  const apiModule = { exports: {} };

  vm.runInNewContext(code, {
    console,
    fetch: fetchImpl,
    localStorage: storage,
    module: apiModule,
    exports: apiModule.exports,
    process: { env: {} },
    window: {},
    require(specifier) {
      throw new Error(`Unexpected API dependency: ${specifier}`);
    },
  });

  return apiModule.exports;
}

async function loadDashboard(api, scheduledTimers) {
  const source = await readFile(dashboardPath, "utf8");
  const { code } = babel.transformSync(source, {
    filename: dashboardPath.pathname,
    plugins: [transformModulesCommonJs],
    presets: [[presetReact, { runtime: "automatic" }]],
  });
  const dashboardModule = { exports: {} };
  const passthroughLink = ({ children, ...props }) =>
    React.createElement("a", props, children);
  const renderIcon = (props) => React.createElement("span", props);
  const renderCard = () => React.createElement("article");

  vm.runInNewContext(code, {
    AbortController,
    clearTimeout() {},
    console,
    document: globalThis.document,
    localStorage: globalThis.window.localStorage,
    module: dashboardModule,
    exports: dashboardModule.exports,
    require(specifier) {
      if (specifier === "react") return React;
      if (specifier === "react/jsx-runtime") return jsxRuntime;
      if (specifier === "next/link") {
        return { __esModule: true, default: passthroughLink };
      }
      if (specifier === "next/navigation") {
        return { useRouter: () => ({ push() {} }) };
      }
      if (specifier === "lucide-react") {
        return new Proxy({}, { get: () => renderIcon });
      }
      if (specifier === "@/lib/api") return api;
      if (specifier === "@/components/ui/Skeleton") {
        return { CardSkeleton: renderCard };
      }
      if (specifier.startsWith("@/components/ui/")) {
        return { __esModule: true, default: renderCard };
      }
      throw new Error(`Unexpected dashboard dependency: ${specifier}`);
    },
    setTimeout(callback, delay) {
      scheduledTimers.push({ callback, delay });
      return scheduledTimers.length;
    },
    window: globalThis.window,
  });

  return dashboardModule.exports.default;
}

async function waitFor(predicate, message) {
  const deadline = Date.now() + 1500;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(message);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  }
}

function findButton(container, label) {
  return [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === label,
  );
}

async function renderDashboard(overrides = {}) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost/dashboard",
  });
  const previousGlobals = {
    document: globalThis.document,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
    window: globalThis.window,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.localStorage.setItem("eventra_token", "test-token");
  dom.window.localStorage.setItem("eventra_user", JSON.stringify(initialProfile));
  const { createRoot } = await import("react-dom/client");

  const calls = { availability: [], update: [] };
  const api = {
    async checkUsernameAvailability(username, options) {
      calls.availability.push({ options, username });
      return { available: true, username };
    },
    async getHackathons() {
      return [];
    },
    async getMyRegisteredEvents() {
      return [];
    },
    async getProjects() {
      return [];
    },
    async getUserNotifications() {
      return [];
    },
    async getUserProfile() {
      return initialProfile;
    },
    async markNotificationRead() {},
    async updateUserProfile(profile) {
      calls.update.push(profile);
      return profile;
    },
    ...overrides,
  };
  const scheduledTimers = [];
  const DashboardPage = await loadDashboard(api, scheduledTimers);
  const container = dom.window.document.querySelector("#root");
  const root = createRoot(container);

  await act(async () => {
    root.render(React.createElement(DashboardPage));
  });
  await waitFor(
    () => findButton(container, "Edit Profile"),
    "dashboard profile did not load",
  );

  async function openEditor() {
    await act(async () => {
      findButton(container, "Edit Profile").click();
    });
    await waitFor(
      () => findButton(container, "Save Profile"),
      "profile editor did not open",
    );
  }

  async function changeInput(index, value) {
    const input = container.querySelectorAll("form input")[index];
    const valueSetter = Object.getOwnPropertyDescriptor(
      dom.window.HTMLInputElement.prototype,
      "value",
    ).set;
    await act(async () => {
      valueSetter.call(input, value);
      input.dispatchEvent(
        new dom.window.InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        }),
      );
      input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
  }

  async function submit() {
    const form = container.querySelector("form");
    await act(async () => {
      form.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    });
  }

  async function cleanup() {
    await act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previousGlobals.window;
    globalThis.document = previousGlobals.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT =
      previousGlobals.IS_REACT_ACT_ENVIRONMENT;
  }

  return {
    calls,
    changeInput,
    cleanup,
    container,
    dom,
    openEditor,
    scheduledTimers,
    submit,
  };
}

test("sends an authenticated, encoded username availability request", async () => {
  let request;
  const storage = {
    getItem(key) {
      return key === "eventra_token" ? "signed-jwt" : null;
    },
  };
  const controller = new AbortController();
  const api = await loadApi({
    storage,
    async fetchImpl(url, options) {
      request = { options, url };
      return {
        ok: true,
        async json() {
          return { available: true, username: "user/name" };
        },
      };
    },
  });

  const result = await api.checkUsernameAvailability("  user/name  ", {
    signal: controller.signal,
  });

  assert.equal(
    request.url,
    "http://localhost:8080/api/users/username-availability?username=user%2Fname",
  );
  assert.equal(request.options.headers.Authorization, "Bearer signed-jwt");
  assert.equal(request.options.signal, controller.signal);
  assert.deepEqual(
    { available: result.available, username: result.username },
    { available: true, username: "user/name" },
  );
});

test("trims usernames, enforces 3-50 characters, and saves only an available candidate", async () => {
  const availabilityCalls = [];
  const rendered = await renderDashboard({
    async checkUsernameAvailability(username) {
      availabilityCalls.push(username);
      return { available: true, username };
    },
  });

  try {
    await rendered.openEditor();
    await waitFor(
      () => availabilityCalls.includes("current-user"),
      "current username was not checked",
    );
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "available current username did not enable saving",
    );

    await rendered.changeInput(2, " ab ");
    assert.match(rendered.container.textContent, /3 to 50 characters/);
    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);

    await rendered.changeInput(2, "x".repeat(51));
    assert.match(rendered.container.textContent, /3 to 50 characters/);
    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);

    await rendered.changeInput(2, "  fresh-user  ");
    await waitFor(
      () => availabilityCalls.includes("fresh-user"),
      "trimmed username was not checked",
    );
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "available username did not enable saving",
    );
    await rendered.submit();

    assert.equal(rendered.calls.update.length, 1);
    assert.equal(rendered.calls.update[0].username, "fresh-user");
  } finally {
    await rendered.cleanup();
  }
});

test("ignores an older availability response for a newer username", async () => {
  const requests = new Map();
  const rendered = await renderDashboard({
    checkUsernameAvailability(username) {
      if (username === "current-user") {
        return Promise.resolve({ available: true, username });
      }
      const request = deferred();
      requests.set(username, request);
      return request.promise;
    },
  });

  try {
    await rendered.openEditor();
    await rendered.changeInput(2, "older-choice");
    await waitFor(
      () => requests.has("older-choice"),
      "older availability request did not start",
    );
    await rendered.changeInput(2, "newer-choice");
    await waitFor(
      () => requests.has("newer-choice"),
      "newer availability request did not start",
    );

    await act(async () => {
      requests.get("newer-choice").resolve({
        available: false,
        username: "newer-choice",
      });
      await requests.get("newer-choice").promise;
    });
    assert.match(rendered.container.textContent, /Username is already in use/);
    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);

    await act(async () => {
      requests.get("older-choice").resolve({
        available: true,
        username: "older-choice",
      });
      await requests.get("older-choice").promise;
    });
    assert.match(rendered.container.textContent, /Username is already in use/);
    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);
  } finally {
    await rendered.cleanup();
  }
});

test("rechecks a revisited username before allowing it to be saved", async () => {
  let firstChoiceRequests = 0;
  const revisitedRequest = deferred();
  const secondChoiceRequest = deferred();
  const rendered = await renderDashboard({
    checkUsernameAvailability(username) {
      if (username === "current-user") {
        return Promise.resolve({ available: true, username });
      }
      if (username === "first-choice") {
        firstChoiceRequests += 1;
        return firstChoiceRequests === 1
          ? Promise.resolve({ available: true, username })
          : revisitedRequest.promise;
      }
      return secondChoiceRequest.promise;
    },
  });

  try {
    await rendered.openEditor();
    await rendered.changeInput(2, "first-choice");
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "first availability result did not enable saving",
    );

    await rendered.changeInput(2, "second-choice");
    await rendered.changeInput(2, "first-choice");
    await waitFor(
      () => firstChoiceRequests === 2,
      "revisited username was not checked again",
    );

    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);
    await act(async () => {
      revisitedRequest.resolve({ available: true, username: "first-choice" });
      await revisitedRequest.promise;
    });
    assert.equal(findButton(rendered.container, "Save Profile").disabled, false);
  } finally {
    await rendered.cleanup();
  }
});

test("requires a fresh availability result after reopening the editor", async () => {
  let currentUsernameRequests = 0;
  const reopenedRequest = deferred();
  const rendered = await renderDashboard({
    checkUsernameAvailability(username) {
      currentUsernameRequests += 1;
      return currentUsernameRequests === 1
        ? Promise.resolve({ available: true, username })
        : reopenedRequest.promise;
    },
  });

  try {
    await rendered.openEditor();
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "first availability result did not enable saving",
    );
    await act(async () => findButton(rendered.container, "Cancel").click());
    await rendered.openEditor();
    await waitFor(
      () => currentUsernameRequests === 2,
      "reopened editor did not request fresh availability",
    );

    assert.equal(findButton(rendered.container, "Save Profile").disabled, true);
    await act(async () => {
      reopenedRequest.resolve({ available: true, username: "current-user" });
      await reopenedRequest.promise;
    });
    assert.equal(findButton(rendered.container, "Save Profile").disabled, false);
  } finally {
    await rendered.cleanup();
  }
});

test("does not dismiss the editor while a profile save is in flight", async () => {
  const updateRequest = deferred();
  const rendered = await renderDashboard({
    updateUserProfile() {
      return updateRequest.promise;
    },
  });

  try {
    await rendered.openEditor();
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "available current username did not enable saving",
    );
    await rendered.submit();
    await waitFor(
      () => findButton(rendered.container, "Saving..."),
      "profile save did not start",
    );
    await act(async () => findButton(rendered.container, "Cancel").click());
    await act(async () => {
      updateRequest.reject(new Error("Server rejected the profile update"));
      try {
        await updateRequest.promise;
      } catch {}
    });
    await waitFor(
      () => rendered.container.textContent.includes("Server rejected the profile update"),
      "save failure was not shown in the open editor",
    );

    assert.ok(findButton(rendered.container, "Save Profile"));
  } finally {
    await rendered.cleanup();
  }
});

test("keeps the editor and persisted profile unchanged when saving fails", async () => {
  const originalStoredProfile = JSON.stringify(initialProfile);
  const rendered = await renderDashboard({
    async updateUserProfile() {
      throw new Error("API Error 409: Username is already in use");
    },
  });

  try {
    await rendered.openEditor();
    await rendered.changeInput(2, "conflict-user");
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "available candidate did not enable saving",
    );
    await rendered.submit();
    await waitFor(
      () => rendered.container.textContent.includes("API Error 409: Username is already in use"),
      "server error was not shown",
    );

    assert.ok(findButton(rendered.container, "Save Profile"));
    assert.match(rendered.container.textContent, /@current-user/);
    assert.equal(
      rendered.dom.window.localStorage.getItem("eventra_user"),
      originalStoredProfile,
    );
    assert.doesNotMatch(
      rendered.container.textContent,
      /Profile updated successfully/,
    );
  } finally {
    await rendered.cleanup();
  }
});

test("updates the profile, persists it, and closes after a successful save", async () => {
  const rendered = await renderDashboard();

  try {
    await rendered.openEditor();
    await rendered.changeInput(2, "fresh-user");
    await waitFor(
      () => findButton(rendered.container, "Save Profile").disabled === false,
      "available candidate did not enable saving",
    );
    await rendered.submit();
    await waitFor(
      () => rendered.container.textContent.includes("Profile updated successfully!"),
      "save success was not shown",
    );

    const storedProfile = JSON.parse(
      rendered.dom.window.localStorage.getItem("eventra_user"),
    );
    assert.equal(storedProfile.username, "fresh-user");
    assert.match(rendered.container.textContent, /@fresh-user/);
    assert.equal(rendered.scheduledTimers.length, 1);
    assert.equal(rendered.scheduledTimers[0].delay, 1000);

    await act(async () => rendered.scheduledTimers[0].callback());
    assert.equal(findButton(rendered.container, "Save Profile"), undefined);
  } finally {
    await rendered.cleanup();
  }
});
