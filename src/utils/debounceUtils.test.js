import {
  DebounceCancelledError,
  createDebouncedValidator,
  debounceAsync,
  isDebounceCancelledError,
} from "./debounceUtils";

describe("debounceUtils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("runs only the latest async call after the debounce delay", async () => {
    const validator = jest.fn(async (value) => `checked:${value}`);
    const debounced = debounceAsync(validator, 500);

    const firstCall = debounced("first").catch((error) => error);
    const secondCall = debounced("second");

    jest.advanceTimersByTime(499);
    expect(validator).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    await expect(firstCall).resolves.toBeInstanceOf(DebounceCancelledError);
    await expect(secondCall).resolves.toBe("checked:second");
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith("second");
  });

  it("can detect cancelled debounce calls", async () => {
    const debounced = debounceAsync(async () => true, 500);
    const promise = debounced().catch((error) => error);

    debounced.cancel();

    const error = await promise;
    expect(isDebounceCancelledError(error)).toBe(true);
  });

  it("creates validator-friendly cancelled results", async () => {
    const validator = jest.fn(async () => ({ isValid: true, message: "" }));
    const debounced = createDebouncedValidator(validator, 500);

    const cancelled = debounced("old");
    const latest = debounced("new");

    jest.advanceTimersByTime(500);

    await expect(cancelled).resolves.toEqual({
      isValid: false,
      message: "Validation cancelled",
      cancelled: true,
    });
    await expect(latest).resolves.toEqual({ isValid: true, message: "" });
  });
});
