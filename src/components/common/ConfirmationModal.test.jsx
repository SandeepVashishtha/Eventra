import { act } from "react";
import { createRoot } from "react-dom/client";
import ConfirmationModal from "./ConfirmationModal";

let container;
let root;
let onClose;
let onConfirm;

/* eslint-disable no-undef */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
/* eslint-enable no-undef */

const renderModal = (props = {}) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onClose = jest.fn();
  onConfirm = jest.fn();

  // eslint-disable-next-line testing-library/no-unnecessary-act
  act(() => {
    root.render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete event"
        message="This action cannot be undone."
        {...props}
      />,
    );
  });

  return container;
};

const pressKey = (key, shiftKey = false) => {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
};

afterEach(() => {
  if (root) {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("ConfirmationModal accessibility", () => {
  it("renders dialog semantics with labelled content", () => {
    renderModal();

    const dialog = container.querySelector('[role="dialog"]');
    const titleId = dialog.getAttribute("aria-labelledby");
    const descriptionId = dialog.getAttribute("aria-describedby");

    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.getElementById(titleId).textContent).toBe("Delete event");
    expect(document.getElementById(descriptionId).textContent).toBe(
      "This action cannot be undone.",
    );
  });

  it("traps focus inside the modal", () => {
    renderModal();

    const buttons = container.querySelectorAll("button");
    const cancelButton = buttons[0];
    const confirmButton = buttons[1];

    expect(document.activeElement).toBe(cancelButton);

    pressKey("Tab", true);
    expect(document.activeElement).toBe(confirmButton);

    pressKey("Tab");
    expect(document.activeElement).toBe(cancelButton);
  });

  it("closes with Escape", () => {
    renderModal();

    pressKey("Escape");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("returns focus to the previously focused element when closed", () => {
    const opener = document.createElement("button");
    opener.textContent = "Open";
    document.body.appendChild(opener);
    opener.focus();

    renderModal();

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      root.render(
        <ConfirmationModal
          isOpen={false}
          onClose={onClose}
          onConfirm={onConfirm}
        />,
      );
    });

    expect(document.activeElement).toBe(opener);
  });
});
