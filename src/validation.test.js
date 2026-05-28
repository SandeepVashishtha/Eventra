import {
  createCustomAsyncValidator,
  createHookValidator,
  validateEmailAvailability,
  validatePasswordStrength,
  validatePhoneNumber,
  validateUsernameUnique,
} from "./validation";

const createJsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn(async () => body),
});

describe("validation utilities", () => {
  it("validates email format before calling the API", async () => {
    const fetchImpl = jest.fn();

    const result = await validateEmailAvailability("bad-email", {
      apiOptions: { fetchImpl },
    });

    expect(result).toEqual({
      isValid: false,
      message: "Invalid email format",
      isLoading: false,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("checks email availability through the API layer", async () => {
    const fetchImpl = jest.fn(async () =>
      createJsonResponse({ available: false }),
    );

    const result = await validateEmailAvailability("taken@example.com", {
      messages: { unavailable: "Use another email" },
      apiOptions: { fetchImpl },
    });

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Use another email");
  });

  it("validates username shape before checking uniqueness", async () => {
    await expect(validateUsernameUnique("ab")).resolves.toMatchObject({
      isValid: false,
      message: "Username must be at least 3 characters",
    });

    await expect(validateUsernameUnique("not valid")).resolves.toMatchObject({
      isValid: false,
      message: "Username can only include letters, numbers, and underscores",
    });
  });

  it("validates password strength with configurable rules", async () => {
    await expect(validatePasswordStrength("weak")).resolves.toMatchObject({
      isValid: false,
      message: "Password must be at least 8 characters",
    });

    await expect(validatePasswordStrength("Strong1!")).resolves.toMatchObject({
      isValid: true,
      message: "",
    });
  });

  it("can validate phone format without making an API call", async () => {
    const result = await validatePhoneNumber("+1 555 111 2222", {
      useApi: false,
    });

    expect(result).toEqual({
      isValid: true,
      message: "",
      isLoading: false,
    });
  });

  it("creates custom async validators with standardized responses", async () => {
    const validator = createCustomAsyncValidator(async (value) => ({
      isValid: value === "ok",
      message: "Not ok",
    }));

    await expect(validator("bad")).resolves.toMatchObject({
      isValid: false,
      message: "Not ok",
    });
  });

  it("can adapt standardized validators for the form hook contract", async () => {
    const hookValidator = createHookValidator(async () => ({
      isValid: false,
      message: "Unavailable",
    }));

    await expect(hookValidator("value")).resolves.toBe("Unavailable");
  });
});
