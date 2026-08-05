import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const navbarPath = path.resolve(__dirname, "../src/components/navbar/Navbar.jsx");
const navbarSrc = readFileSync(navbarPath, "utf8");

describe("Navbar dropdown visibility", () => {
  it("keeps the header row from clipping dropdown menus", () => {
    assert.match(
      navbarSrc,
      /<div className="[^"]*h-16[^"]*overflow-visible[^"]*"/,
      "Navbar header row must allow language and account dropdown menus to render outside the 64px bar."
    );

    assert.doesNotMatch(
      navbarSrc,
      /<div className="[^"]*h-16[^"]*overflow-hidden[^"]*"/,
      "Navbar header row must not use overflow-hidden because it clips dropdown menus."
    );
  });

  it("renders the language selector in the desktop controls", () => {
    assert.ok(
      navbarSrc.includes("<LanguageSelector compact />"),
      "Desktop navigation controls should expose the language dropdown."
    );
  });
});
