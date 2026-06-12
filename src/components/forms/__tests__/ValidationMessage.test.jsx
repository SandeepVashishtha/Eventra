import { act } from "react";
import { createRoot } from "react-dom/client";
import ValidationMessage from "../ValidationMessage";

let container;
let root;

/* eslint-disable no-undef */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
/* eslint-enable no-undef */

const render = (element) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  // eslint-disable-next-line testing-library/no-unnecessary-act
  act(() => {
    root.render(element);
  });

  return container;
};

afterEach(() => {
  if (root) {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
});

describe("ValidationMessage", () => {
  const states = ["success", "error", "warning", "info", "loading"];

  it.each(states)("renders %s messages", (state) => {
    render(<ValidationMessage state={state} message={`${state} message`} />);

    const message = container.querySelector(`[data-state="${state}"]`);
    expect(message).not.toBeNull();
    expect(message.textContent).toBe(`${state} message`);
  });

  it("does not render empty messages", () => {
    render(<ValidationMessage state="error" message="" />);

    expect(container.querySelector("p")).toBeNull();
  });

  it("does not render null messages", () => {
    render(<ValidationMessage state="error" message={null} />);

    expect(container.querySelector("p")).toBeNull();
  });

  it("uses alert semantics for error messages", () => {
    render(<ValidationMessage state="error" message="Email is required" />);

    const message = container.querySelector("p");
    expect(message.getAttribute("role")).toBe("alert");
    expect(message.getAttribute("aria-live")).toBe("assertive");
  });

  it("uses polite status semantics for non-error messages", () => {
    render(<ValidationMessage state="success" message="Looks good" />);

    const message = container.querySelector("p");
    expect(message.getAttribute("role")).toBe("status");
    expect(message.getAttribute("aria-live")).toBe("polite");
  });

  it("supports id and custom className props", () => {
    render(
      <ValidationMessage
        id="email-message"
        className="custom-message"
        state="info"
        message="We will never share your email"
      />,
    );

    const message = container.querySelector("#email-message");
    expect(message).not.toBeNull();
    expect(message.classList.contains("custom-message")).toBe(true);
  });
});
