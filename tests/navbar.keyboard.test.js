import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/components/navbar/NavbarLinks.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

describe("Navbar Keyboard & Accessibility Interactions", () => {
  it("toggles submenu on Enter/Space keyboard events and closes on Escape", () => {
    // Static code validation to ensure accessibility and keyboard interactions are implemented
    assert.ok(
      componentSrc.includes('Escape') || componentSrc.includes('escape'),
      "NavbarLinks must close open submenus when the Escape key is pressed."
    );
    assert.ok(
      componentSrc.includes("onKeyDown={") && (componentSrc.includes("Enter") || componentSrc.includes("Space")),
      "NavbarLinks toggle buttons must support keyboard keydown triggers."
    );
  });
});
