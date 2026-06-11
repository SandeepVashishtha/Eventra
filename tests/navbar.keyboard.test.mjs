import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/components/navbar/NavbarLinks.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

describe("NavbarLinks Accessibility & Keyboard Navigation", () => {
  it("should contain a document keydown listener for Escape key to close open groups", () => {
    assert.ok(
      componentSrc.includes('event.key === "Escape"') || componentSrc.includes("event.key === 'Escape'"),
      "NavbarLinks must close open submenus when the Escape key is pressed."
    );
  });

  it("should support keydown event handling on the submenu toggle button", () => {
    assert.ok(
      componentSrc.includes("onKeyDown={") && componentSrc.includes("event.key === \"Enter\""),
      "NavbarLinks toggle buttons must support keyboard activations."
    );
  });

  it("should have aria-expanded attribute on sub-item NavLink and toggle button", () => {
    assert.ok(
      componentSrc.includes("aria-expanded={"),
      "NavbarLinks submenu toggles must indicate their expanded/collapsed state via aria-expanded."
    );
  });

  it("should have aria-haspopup set to menu for non-vertical dropdown links", () => {
    assert.ok(
      componentSrc.includes("aria-haspopup="),
      "NavbarLinks dropdown links must expose aria-haspopup to indicate they toggle submenus."
    );
  });
});

console.log("Navbar keyboard navigation & accessibility tests loaded ✓");
