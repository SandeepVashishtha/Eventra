import React, { act } from "react";
import { createRoot } from "react-dom/client";
import FormField from "../FormField";

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

const rerender = (element) => {
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

describe("FormField", () => {
  it("renders label connected to input via htmlFor/id", () => {
    render(<FormField id="email" label="Email" value="" onChange={() => {}} />);

    const label = container.querySelector("label");
    const input = container.querySelector("input");
    expect(label.getAttribute("for")).toBe("email");
    expect(input.getAttribute("id")).toBe("email");
    expect(label.textContent).toBe("Email");
  });

  it("renders the input with the supplied type", () => {
    render(
      <FormField id="pwd" label="Password" type="password" value="" onChange={() => {}} />,
    );

    expect(container.querySelector("input").getAttribute("type")).toBe("password");
  });

  it("defaults input type to text when type is omitted", () => {
    render(<FormField id="name" label="Name" value="" onChange={() => {}} />);

    expect(container.querySelector("input").getAttribute("type")).toBe("text");
  });

  // ─── aria-invalid ──────────────────────────────────────────────────────────

  it("sets aria-invalid=true when an error is present", () => {
    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required."
      />,
    );

    expect(container.querySelector("input").getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid=false when no error is present", () => {
    render(<FormField id="email" label="Email" value="" onChange={() => {}} />);

    expect(container.querySelector("input").getAttribute("aria-invalid")).toBe("false");
  });

  // ─── aria-describedby ─────────────────────────────────────────────────────

  it("sets aria-describedby pointing to the error element when error is present", () => {
    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required."
      />,
    );

    expect(container.querySelector("input").getAttribute("aria-describedby")).toBe(
      "email-error",
    );
  });

  it("omits aria-describedby when there is no error", () => {
    render(<FormField id="email" label="Email" value="" onChange={() => {}} />);

    expect(container.querySelector("input").getAttribute("aria-describedby")).toBeNull();
  });

  // ─── role="alert" error element ───────────────────────────────────────────

  it("renders an alert element with the correct id when error is present", () => {
    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Email is required."
      />,
    );

    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.getAttribute("id")).toBe("email-error");
  });

  it("displays the error message text inside the alert", () => {
    render(
      <FormField
        id="username"
        label="Username"
        value=""
        onChange={() => {}}
        error="Username is taken."
      />,
    );

    const alert = container.querySelector('[role="alert"]');
    expect(alert.textContent).toContain("Username is taken.");
  });

  it("renders no alert element when error is absent", () => {
    render(<FormField id="email" label="Email" value="" onChange={() => {}} />);

    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("renders no alert element when error is an empty string", () => {
    render(
      <FormField id="email" label="Email" value="" onChange={() => {}} error="" />,
    );

    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  // ─── aria-describedby + role="alert" consistency ─────────────────────────

  it("aria-describedby value matches the id of the role=alert element", () => {
    render(
      <FormField
        id="phone"
        label="Phone"
        value=""
        onChange={() => {}}
        error="Invalid phone number."
      />,
    );

    const input = container.querySelector("input");
    const alert = container.querySelector('[role="alert"]');
    expect(input.getAttribute("aria-describedby")).toBe(alert.getAttribute("id"));
  });

  // ─── update from error → no error ─────────────────────────────────────────

  it("removes aria-describedby after error is cleared", () => {
    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Required."
      />,
    );

    rerender(
      <FormField id="email" label="Email" value="" onChange={() => {}} />,
    );

    expect(container.querySelector("input").getAttribute("aria-describedby")).toBeNull();
  });
});
