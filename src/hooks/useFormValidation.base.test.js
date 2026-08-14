import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFormValidation from "./useFormValidation";

vi.mock("./useAsyncValidation", () => ({
  __esModule: true,
  default: () => ({
    asyncErrors: {},
    asyncTouched: {},
    isAsyncValidating: false,
    isAnyAsyncValidating: false,
    hasAsyncErrors: false,
    validateAsync: () => {},
    clearAsyncError: () => {},
    cleanup: () => {},
  }),
}));

describe("useFormValidation (base hook)", () => {
  it("mounts without ReferenceError (regression: valuesRef was undeclared)", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "", name: "" }, {})
    );
    expect(result.current.values).toEqual({ email: "", name: "" });
  });

  it("validates on blur using the current values", () => {
    const rules = {
      email: (v) => (v && v.includes("@") ? null : "invalid email"),
    };
    const { result } = renderHook(() =>
      useFormValidation({ email: "" }, rules)
    );
    act(() => {
      result.current.handleBlur({ target: { name: "email", value: "bad" } });
    });
    expect(result.current.errors.email).toBe("invalid email");
  });
});
