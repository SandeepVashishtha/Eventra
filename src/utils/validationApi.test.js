import {
  checkEmailAvailability,
  checkPhoneValidation,
  checkUsernameAvailability,
  requestValidation,
} from "./validationApi";

const createJsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn(async () => body),
});

describe("validationApi", () => {
  it("normalizes email availability responses", async () => {
    const fetchImpl = jest.fn(async () =>
      createJsonResponse({ available: true }),
    );

    const result = await checkEmailAvailability("person@example.com", {
      fetchImpl,
    });

    expect(result).toEqual({
      isValid: true,
      message: "",
      isLoading: false,
      data: { available: true },
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/validate/email/person%40example.com",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("normalizes username unavailable responses", async () => {
    const fetchImpl = jest.fn(async () =>
      createJsonResponse({ available: false, message: "Taken" }),
    );

    const result = await checkUsernameAvailability("admin", { fetchImpl });

    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Taken");
  });

  it("posts phone values to the validation endpoint", async () => {
    const fetchImpl = jest.fn(async () => createJsonResponse({ valid: true }));

    const result = await checkPhoneValidation("+1 555 111 2222", {
      fetchImpl,
    });

    expect(result.isValid).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/validate/phone",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "+1 555 111 2222" }),
      }),
    );
  });

  it("returns a standardized error on API failures", async () => {
    const fetchImpl = jest.fn(async () =>
      createJsonResponse({ message: "Server says no" }, false, 400),
    );

    const result = await requestValidation("/api/validate/email/a", {
      fetchImpl,
      retries: 0,
    });

    expect(result).toMatchObject({
      isValid: false,
      message: "Server says no",
      status: 400,
    });
  });

  it("retries transient failures before returning success", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(createJsonResponse({}, false, 503))
      .mockResolvedValueOnce(createJsonResponse({ available: true }));

    const result = await requestValidation("/api/validate/username/newuser", {
      fetchImpl,
      retries: 1,
      retryDelayMs: 0,
    });

    expect(result.isValid).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("handles network failures gracefully", async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error("offline");
    });

    const result = await requestValidation("/api/validate/email/a", {
      fetchImpl,
      retries: 0,
    });

    expect(result).toMatchObject({
      isValid: false,
      isNetworkError: true,
      message: "Unable to validate right now. Please try again.",
    });
  });
});
