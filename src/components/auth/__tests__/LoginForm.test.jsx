import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../LoginForm";
import { useAuth } from "../../../context/AuthContext";

jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../utils/toast", () => ({
  showAuthToast: jest.fn((message, onClose) => {
    if (onClose) onClose();
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

let container;
let root;
let loginMock;

 
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
 

const renderLogin = () => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

   
  act(() => {
    root.render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginForm />
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

beforeEach(() => {
  window.scrollTo = jest.fn();
  loginMock = jest.fn().mockResolvedValue(true);
  useAuth.mockReturnValue({ login: loginMock });
});

afterEach(() => {
  if (root) {
     
    act(() => {
      root.unmount();
    });
  }
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("LoginForm integration", () => {
  it("blocks submission when required fields are empty", async () => {
    renderLogin();

    await submitForm();

    expect(container.textContent).toContain("Email or username is required");
    expect(container.textContent).toContain("Password is required");
    expect(input("usernameOrEmail").getAttribute("aria-invalid")).toBe("true");
    expect(input("password").getAttribute("aria-invalid")).toBe("true");
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("shows invalid email format errors", async () => {
    renderLogin();
    changeInput("usernameOrEmail", "broken@email");
    changeInput("password", "password123");

    await submitForm();

    expect(container.textContent).toContain("Invalid email format");
    expect(input("usernameOrEmail").getAttribute("aria-describedby")).toContain(
      "usernameOrEmail-message",
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("shows password validation errors", async () => {
    renderLogin();
    changeInput("usernameOrEmail", "person@example.com");
    changeInput("password", "short");

    await submitForm();

    expect(container.textContent).toContain(
      "Password must be at least 8 characters",
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("submits when validation passes", async () => {
    renderLogin();
    changeInput("usernameOrEmail", "person@example.com");
    changeInput("password", "password123");

    await submitForm();

    expect(loginMock).toHaveBeenCalledWith("person@example.com", "password123");
  });
});
