import { act } from "react";
import { createRoot } from "react-dom/client";
import FormFieldWrapper from "../FormFieldWrapper";

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

describe("FormFieldWrapper", () => {
  it("renders a label connected to the input", () => {
    render(
      <FormFieldWrapper id="email" label="Email">
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("label").getAttribute("for")).toBe("email");
    expect(container.querySelector("input").getAttribute("id")).toBe("email");
  });

  it("renders the required indicator and aria-required", () => {
    render(
      <FormFieldWrapper id="email" label="Email" required>
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("label").textContent).toContain("Email");
    expect(container.querySelector("label").textContent).toContain("*");
    expect(container.querySelector("input").getAttribute("aria-required")).toBe("true");
  });

  it("renders helper text and connects it with aria-describedby", () => {
    render(
      <FormFieldWrapper id="email" label="Email" helperText="Use your work email">
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("#email-helper").textContent).toBe("Use your work email");
    expect(container.querySelector("input").getAttribute("aria-describedby")).toBe("email-helper");
  });

  it("renders validation messages and connects them with aria-describedby", () => {
    render(
      <FormFieldWrapper
        id="email"
        label="Email"
        validationState="error"
        message="Email is already registered"
      >
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("#email-message").textContent).toBe(
      "Email is already registered"
    );
    expect(container.querySelector("input").getAttribute("aria-describedby")).toBe("email-message");
  });

  it("marks the input invalid for error states", () => {
    render(
      <FormFieldWrapper id="email" label="Email" validationState="error" message="Invalid email">
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("input").getAttribute("aria-invalid")).toBe("true");
  });

  it("marks the input busy for loading states", () => {
    render(
      <FormFieldWrapper
        id="username"
        label="Username"
        validationState="validating"
        message="Checking username..."
      >
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector("input").getAttribute("aria-busy")).toBe("true");
  });

  it("preserves existing aria-describedby values", () => {
    render(
      <FormFieldWrapper
        id="email"
        label="Email"
        helperText="Use your work email"
        message="Looks good"
        validationState="success"
      >
        <input aria-describedby="external-help" />
      </FormFieldWrapper>
    );

    expect(container.querySelector("input").getAttribute("aria-describedby")).toBe(
      "external-help email-helper email-message"
    );
  });

  it("supports custom className props", () => {
    render(
      <FormFieldWrapper
        id="email"
        label="Email"
        className="custom-field"
        labelClassName="custom-label"
        inputWrapperClassName="custom-input-wrapper"
        helperClassName="custom-helper"
        messageClassName="custom-message"
        helperText="Helper"
        message="Message"
      >
        <input className="custom-input" />
      </FormFieldWrapper>
    );

    expect(container.querySelector("[data-state='idle']").classList.contains("custom-field")).toBe(
      true
    );
    expect(container.querySelector("label").classList.contains("custom-label")).toBe(true);
    expect(container.querySelector(".custom-input-wrapper")).not.toBeNull();
    expect(container.querySelector("#email-helper").classList.contains("custom-helper")).toBe(true);
    expect(container.querySelector("#email-message").classList.contains("custom-message")).toBe(
      true
    );
    expect(container.querySelector("input").classList.contains("custom-input")).toBe(true);
  });

  it("renders optional prefix and suffix content", () => {
    render(
      <FormFieldWrapper
        id="email"
        label="Email"
        prefix={<span data-testid="prefix">prefix</span>}
        suffix={
          <button type="button" aria-label="button">
            toggle
          </button>
        }
      >
        <input />
      </FormFieldWrapper>
    );

    expect(container.querySelector('[data-testid="prefix"]')).not.toBeNull();
    expect(container.querySelector("button").textContent).toBe("toggle");
    expect(container.querySelector("input").className).toContain("pr-");
  });
});
