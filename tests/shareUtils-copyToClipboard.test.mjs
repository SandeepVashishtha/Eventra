import assert from "node:assert/strict";

Object.defineProperty(globalThis, "navigator", {
  value: { clipboard: undefined },
  configurable: true,
  writable: true,
});
global.document = {
  createElement: () => ({
    value: "",
    style: {},
    focus: () => {},
    select: () => {},
    remove: () => {}
  }),
  body: { appendChild: () => {}, removeChild: () => {} }
};
global.CustomEvent = class CustomEvent {
  constructor() {}
};

const { copyToClipboard } = await import("../src/utils/shareUtils.js");

const originalExecCommand = document.execCommand;
let execCommandCalled = false;
document.execCommand = () => { execCommandCalled = true; return true; };

execCommandCalled = false;
const result = await copyToClipboard("test text");
assert.equal(result, true, "fallback copy returns true on success");
assert.equal(execCommandCalled, true, "execCommand called in fallback path");

document.execCommand = originalExecCommand;

console.log("shareUtils copyToClipboard tests passed ✓");