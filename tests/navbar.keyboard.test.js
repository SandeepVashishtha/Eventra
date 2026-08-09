import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import assert from "node:assert/strict";
import NavbarLinks from "../src/components/navbar/NavbarLinks.jsx";

// Mock prefetchRoute to avoid dynamic import errors
vi.mock("../src/utils/prefetchUtils", () => ({
  prefetchRoute: vi.fn(),
}));

vi.mock("../src/utils/routePrefetch", () => ({
  prefetchRoute: vi.fn(),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === "nav.expandSubmenu") {
        return `Expand ${options?.name || ""} submenu`;
      }
      if (key === "nav.collapseSubmenu") {
        return `Collapse ${options?.name || ""} submenu`;
      }
      return key;
    },
  }),
}));

describe("Navbar Keyboard & Accessibility Interactions", () => {
  test("toggles submenu on Enter/Space keyboard events and closes on Escape", () => {
    render(
      <MemoryRouter>
        <NavbarLinks vertical={false} />
      </MemoryRouter>
    );

    // Get the expand/collapse button for the first submenu item (e.g., "Events")
    const toggleButton = screen.getAllByLabelText(/expand.*submenu/i)[0];
    assert.ok(toggleButton);

    // Initial state: expanded attribute is false
    assert.equal(toggleButton.getAttribute("aria-expanded"), "false");

    // Fire Enter keypress
    fireEvent.keyDown(toggleButton, { key: "Enter", code: "Enter" });
    assert.equal(toggleButton.getAttribute("aria-expanded"), "true");

    // Fire Escape keypress to close submenu
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    assert.equal(toggleButton.getAttribute("aria-expanded"), "false");
  });
});
