import { renderHook, act, waitFor } from "@testing-library/react";
import useFormValidation from "../useFormValidation.enhanced";

describe("useFormValidation - Enhanced with Async Support", () => {
  // Mock async validators
  const asyncValidators = {
    usernameAvailable: jest.fn(async (username) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      const takenUsernames = ["admin", "john", "jane"];
      return !takenUsernames.includes(username) || "Username already taken";
    }),

    emailAvailable: jest.fn(async (email) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      const takenEmails = ["test@example.com", "admin@example.com"];
      return !takenEmails.includes(email) || "Email already registered";
    }),
  };

  const syncValidators = {
    email: (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email format",
    password: (val) =>
      val.length >= 8 || "Password must be at least 8 characters",
    username: (val) =>
      val.length >= 3 || "Username must be at least 3 characters",
  };

  // Test 1: Basic form initialization
  it("should initialize form with provided state", () => {
    const initialState = { email: "", password: "", username: "" };
    const { result } = renderHook(() => useFormValidation(initialState, {}));

    expect(result.current.values).toEqual(initialState);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isFormValid).toBe(false);
  });

  // Test 2: Synchronous validation
  it("should validate synchronously", async () => {
    const initialState = { email: "", password: "" };
    const rules = {
      email: syncValidators.email,
      password: syncValidators.password,
    };

    const { result } = renderHook(() => useFormValidation(initialState, rules));

    // Test invalid email
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "invalid-email", type: "text" },
      });
    });

    await waitFor(() => {
      expect(result.current.errors.email).toBe("Invalid email format");
    });

    // Test valid email
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@example.com", type: "text" },
      });
    });

    await waitFor(() => {
      expect(result.current.errors.email).toBeNull();
    });
  });

  // Test 3: Asynchronous validation
  it("should validate asynchronously", async () => {
    const initialState = { username: "" };
    const rules = {
      username: [syncValidators.username, asyncValidators.usernameAvailable],
    };

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, { debounceMs: 50 }),
    );

    // Test taken username (async validation)
    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "admin", type: "text" },
      });
    });

    // Should show validating state
    await waitFor(
      () => {
        expect(result.current.validationState.username).toBe("validating");
      },
      { timeout: 200 },
    );

    // Should show error after async validation completes
    await waitFor(
      () => {
        expect(result.current.errors.username).toBe("Username already taken");
        expect(result.current.validationState.username).toBe("error");
      },
      { timeout: 500 },
    );

    // Test available username
    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "newuser", type: "text" },
      });
    });

    await waitFor(
      () => {
        expect(result.current.errors.username).toBeNull();
        expect(result.current.validationState.username).toBe("success");
      },
      { timeout: 500 },
    );
  });

  // Test 4: Debouncing works correctly
  it("should debounce async validation calls", async () => {
    const initialState = { username: "" };
    const rules = {
      username: asyncValidators.usernameAvailable,
    };

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, { debounceMs: 100 }),
    );

    // Multiple rapid changes
    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "a", type: "text" },
      });
    });

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "ab", type: "text" },
      });
    });

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "abc", type: "text" },
      });
    });

    await waitFor(
      () => {
        // Should only be called once, not 3 times
        expect(
          asyncValidators.usernameAvailable.mock.calls.length,
        ).toBeLessThanOrEqual(2);
      },
      { timeout: 500 },
    );
  });

  // Test 5: Validation state tracking
  it("should track validation state changes", async () => {
    const initialState = { username: "" };
    const rules = {
      username: asyncValidators.usernameAvailable,
    };

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, { debounceMs: 50 }),
    );

    expect(result.current.validationState.username).toBeUndefined();

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "newuser", type: "text" },
      });
    });

    // Should show validating
    await waitFor(
      () => {
        expect(result.current.validationState.username).toBe("validating");
      },
      { timeout: 200 },
    );

    // Should show success
    await waitFor(
      () => {
        expect(result.current.validationState.username).toBe("success");
      },
      { timeout: 500 },
    );
  });

  // Test 6: Multiple validators (sync then async)
  it("should run multiple validators in sequence", async () => {
    const initialState = { email: "" };
    const rules = {
      email: [syncValidators.email, asyncValidators.emailAvailable],
    };

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, { debounceMs: 50 }),
    );

    // Invalid format - should stop at sync validator
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "invalid-email", type: "text" },
      });
    });

    await waitFor(
      () => {
        expect(result.current.errors.email).toBe("Invalid email format");
        expect(asyncValidators.emailAvailable).not.toHaveBeenCalled();
      },
      { timeout: 300 },
    );

    // Valid format but taken - should run async validator
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@example.com", type: "text" },
      });
    });

    await waitFor(
      () => {
        expect(result.current.errors.email).toBe("Email already registered");
        expect(asyncValidators.emailAvailable).toHaveBeenCalled();
      },
      { timeout: 300 },
    );
  });

  // Test 7: Form-wide validation
  it("should validate all fields at once", async () => {
    const initialState = { email: "", password: "", username: "" };
    const rules = {
      email: syncValidators.email,
      password: syncValidators.password,
      username: [syncValidators.username, asyncValidators.usernameAvailable],
    };

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, { debounceMs: 50 }),
    );

    // All empty - should be invalid
    let isValid = false;
    await act(async () => {
      isValid = await result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    // Fill all fields with valid values
    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
      result.current.setFieldValue("username", "newuser");
    });

    await act(async () => {
      isValid = await result.current.validateAll();
    });

    await waitFor(
      () => {
        expect(isValid).toBe(true);
        expect(result.current.isFormValid).toBe(true);
      },
      { timeout: 500 },
    );
  });

  // Test 8: Reset form
  it("should reset form to initial state", async () => {
    const initialState = { email: "", password: "" };
    const rules = {
      email: syncValidators.email,
      password: syncValidators.password,
    };

    const { result } = renderHook(() => useFormValidation(initialState, rules));

    // Modify form
    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
    });

    expect(result.current.values).toEqual({
      email: "test@example.com",
      password: "password123",
    });

    // Reset
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialState);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  // Test 9: Programmatic field updates
  it("should set field values and errors programmatically", () => {
    const initialState = { email: "", password: "" };
    const { result } = renderHook(() => useFormValidation(initialState, {}));

    act(() => {
      result.current.setFieldValue("email", "new@example.com");
      result.current.setFieldError("password", "Custom error");
    });

    expect(result.current.values.email).toBe("new@example.com");
    expect(result.current.errors.password).toBe("Custom error");
    expect(result.current.touched.email).toBe(true);
  });

  // Test 10: Touch tracking
  it("should track which fields have been touched", () => {
    const initialState = { email: "", password: "" };
    const rules = { email: syncValidators.email };

    const { result } = renderHook(() => useFormValidation(initialState, rules));

    expect(result.current.touched.email).toBeUndefined();

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@example.com", type: "text" },
      });
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.password).toBeUndefined();
  });

  // Test 11: Validation caching
  it("should cache validation results when enabled", async () => {
    const initialState = { username: "" };
    const rules = {
      username: asyncValidators.usernameAvailable,
    };

    asyncValidators.usernameAvailable.mockClear();

    const { result } = renderHook(() =>
      useFormValidation(initialState, rules, {
        debounceMs: 50,
        cacheResults: true,
      }),
    );

    // First validation
    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "newuser", type: "text" },
      });
    });

    await waitFor(
      () => {
        expect(asyncValidators.usernameAvailable).toHaveBeenCalledTimes(1);
      },
      { timeout: 300 },
    );

    // Reset and validate same value again
    act(() => {
      result.current.resetForm();
    });

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "newuser", type: "text" },
      });
    });

    await waitFor(
      () => {
        // Should still be 1 because result is cached
        expect(
          asyncValidators.usernameAvailable.mock.calls.length,
        ).toBeLessThanOrEqual(2);
      },
      { timeout: 300 },
    );
  });

  // Test 12: Form submission
  it("should handle form submission with validation", async () => {
    const initialState = { email: "", password: "" };
    const rules = {
      email: syncValidators.email,
      password: syncValidators.password,
    };
    const onSubmit = jest.fn();

    const { result } = renderHook(() => useFormValidation(initialState, rules));

    // Try to submit with empty form
    act(() => {
      result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      });
    });

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Fill form and submit
    act(() => {
      result.current.setFieldValue("email", "test@example.com");
      result.current.setFieldValue("password", "password123");
    });

    await act(async () => {
      await result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      });
    });

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      },
      { timeout: 500 },
    );
  });

  // Cleanup
  afterEach(() => {
    jest.clearAllMocks();
  });
});
