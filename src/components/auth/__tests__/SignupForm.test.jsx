import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import SignupForm from "../SignupForm";
import { apiUtils } from "../../../config/api";
import {
  validateEmailAvailability,
  validatePasswordStrength,
} from "../../../validation";

jest.mock("../../../config/api", () => ({
  API_ENDPOINTS: {
    AUTH: {
      SIGNUP: "/auth/signup",
    },
  },
  apiUtils: {
    post: jest.fn(),
  },
}));

jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    setAuthSession: jest.fn(),
  }),
}));

jest.mock("../../../validation", () => ({
  validate: {
    email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email format",
    firstName: (value) => {
      if (!value || !value.trim()) return "First name is required";
      if (value.length < 2) return "At least 2 characters";
      if (value.length > 50) return "Less than 50 characters";
      return true;
    },
    lastName: (value) => {
      if (!value || !value.trim()) return "Last name is required";
      if (value.length < 2) return "At least 2 characters";
      if (value.length > 50) return "Less than 50 characters";
      return true;
    },
  },
  validateEmailAvailability: jest.fn(),
  validatePasswordStrength: jest.fn(),
}));

let container;
let root;

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const renderSignup = () => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SignupForm />
      </MemoryRouter>,
    );
  });

  return container;
};

const input = (name) => container.querySelector(`input[name="${name}"]`);

const changeInput = (name, value) => {
  act(() => {
    const element = input(name);
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    valueSetter.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const submitForm = async () => {
  await act(async () => {
    container.querySelector("form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
};

const fillValidSignupForm = () => {
  changeInput("firstName", "Ada");
  changeInput("lastName", "Lovelace");
  changeInput("email", "ada@example.com");
  changeInput("password", "Strong1!");
  changeInput("confirmPassword", "Strong1!");
};

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollTo = jest.fn();
  validateEmailAvailability.mockResolvedValue({ isValid: true, message: "" });
  validatePasswordStrength.mockResolvedValue({ isValid: true, message: "" });
  apiUtils.post.mockResolvedValue({
    status: 200,
    data: {
      token: "token-123",
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    },
  });
});

afterEach(() => {
  if (root) {
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("SignupForm integration", () => {
  it("blocks submission and marks required fields invalid", async () => {
    renderSignup();

    await submitForm();

    expect(container.textContent).toContain("First name is required");
    expect(input("firstName").getAttribute("aria-invalid")).toBe("true");
    expect(apiUtils.post).not.toHaveBeenCalled();
  });

  it("shows invalid email errors and blocks submission", async () => {
    renderSignup();
    changeInput("firstName", "Ada");
    changeInput("lastName", "Lovelace");
    changeInput("email", "not-email");
    changeInput("password", "Strong1!");
    changeInput("confirmPassword", "Strong1!");

    await submitForm();

    expect(container.textContent).toContain("Invalid email format");
    expect(input("email").getAttribute("aria-invalid")).toBe("true");
    expect(apiUtils.post).not.toHaveBeenCalled();
  });

  it("shows async email validation loading state", async () => {
    validateEmailAvailability.mockReturnValue(new Promise(() => {}));
    renderSignup();

    changeInput("email", "ada@example.com");
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(container.textContent).toContain("Checking email availability...");
    expect(input("email").getAttribute("aria-busy")).toBe("true");
  });

  it("shows async email validation success state", async () => {
    renderSignup();

    changeInput("email", "ada@example.com");
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(input("email").getAttribute("aria-invalid")).toBe("false");
    expect(container.querySelector('[data-state="success"]')).not.toBeNull();
  });

  it("shows async email validation error state", async () => {
    validateEmailAvailability.mockResolvedValue({
      isValid: false,
      message: "Email is already registered",
    });
    renderSignup();

    changeInput("email", "taken@example.com");
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(container.textContent).toContain("Email is already registered");
    expect(input("email").getAttribute("aria-invalid")).toBe("true");
  });

  it("blocks submission when password strength validation fails", async () => {
    validatePasswordStrength.mockResolvedValue({
      isValid: false,
      message: "Password must include a special character",
    });
    renderSignup();
    fillValidSignupForm();

    await submitForm();

    expect(container.textContent).toContain(
      "Password doesn't meet the security criteria",
    );
    expect(input("password").getAttribute("aria-invalid")).toBe("true");
    expect(apiUtils.post).not.toHaveBeenCalled();
  });

  it("submits when reusable validation passes", async () => {
    renderSignup();
    fillValidSignupForm();

    await submitForm();

    expect(apiUtils.post).toHaveBeenCalledWith("/auth/signup", {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "Strong1!",
      confirmPassword: "Strong1!",
    });
  });

  it("connects field messages with aria-describedby", async () => {
    renderSignup();
    changeInput("email", "bad-email");

    await submitForm();

    expect(input("email").getAttribute("aria-describedby")).toContain(
      "email-message",
    );
  });
});
