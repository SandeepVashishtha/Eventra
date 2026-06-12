import { act } from "react";
import { createRoot } from "react-dom/client";
import ValidationStatusIcon from "../ValidationStatusIcon";

let container;
let root;

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const render = (element) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return container;
};

afterEach(() => {
  if (root) {
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
});

describe("ValidationStatusIcon", () => {
  const states = [
    ["idle", "Not validated yet"],
    ["validating", "Validation in progress"],
    ["success", "Validation passed"],
    ["error", "Validation failed"],
    ["warning", "Validation warning"],
    ["info", "Validation information"],
  ];

  it.each(states)("renders the %s state", (state, label) => {
    render(<ValidationStatusIcon state={state} />);

    const icon = container.querySelector(`[data-state="${state}"]`);
    expect(icon).not.toBeNull();
    expect(icon.getAttribute("aria-label")).toBe(label);
  });

  it("uses alert semantics for error states", () => {
    render(<ValidationStatusIcon state="error" />);

    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("uses polite status semantics for loading states", () => {
    render(<ValidationStatusIcon state="validating" />);

    const icon = container.querySelector('[role="status"]');
    expect(icon).not.toBeNull();
    expect(icon.getAttribute("aria-live")).toBe("polite");
  });

  it("supports custom className", () => {
    render(<ValidationStatusIcon state="success" className="custom-icon" />);

    expect(
      container.querySelector("[data-state='success']").classList.contains("custom-icon")
    ).toBe(true);
  });

  it("can be hidden from assistive technology when decorative", () => {
    render(<ValidationStatusIcon state="success" ariaHidden />);

    const icon = container.querySelector("[data-state='success']");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.hasAttribute("aria-label")).toBe(false);
  });
});
