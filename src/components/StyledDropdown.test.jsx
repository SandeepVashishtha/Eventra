import { act } from "react";
import { createRoot } from "react-dom/client";
import Dropdown from "./StyledDropdown";

let container;
let root;
let onChange;

 
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
 

const renderDropdown = (props = {}) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onChange = jest.fn();

   
  act(() => {
    root.render(
      <Dropdown
        label="Category"
        value=""
        options={["Events", "Hackathons", "Projects"]}
        onChange={onChange}
        {...props}
      />,
    );
  });

  return container;
};

const pressKey = (element, key) => {
  act(() => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  });
};

afterEach(() => {
  if (root) {
     
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("StyledDropdown accessibility", () => {
  it("opens with Enter and exposes listbox semantics", () => {
    renderDropdown();

    const button = container.querySelector("button");
    pressKey(button, "Enter");

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-haspopup")).toBe("listbox");
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(4);
  });

  it("navigates options with ArrowDown and selects with Enter", () => {
    renderDropdown();

    const button = container.querySelector("button");
    pressKey(button, "Enter");
    pressKey(button, "ArrowDown");
    pressKey(button, "Enter");

    expect(onChange).toHaveBeenCalledWith("Events");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes with Escape", () => {
    renderDropdown();

    const button = container.querySelector("button");
    pressKey(button, " ");
    pressKey(button, "Escape");

    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});
