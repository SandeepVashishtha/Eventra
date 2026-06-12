/**
 * @fileoverview Validation Utilities Unit Tests
 * @module tests/validation.test
 *
 * Verifies all sync, async, formatting, survey sanitization, and legacy hook-adapter
 * functions exported by the centralized validation system in src/validation.js.
 * Utilizes Vitest mocks to intercept API utility calls and ensure isolated execution.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiUtils } from "./config/api.js";
import {
  emailPattern,
  phonePattern,
  validate,
  toHookValidationResult,
  normalizeValidationResult,
  validateEmailAvailability,
  validatePasswordStrength,
  validatePhoneNumber,
  validateUsernameUnique,
  createCustomAsyncValidator,
  createHookValidator,
  VALIDATION_MESSAGES,
} from "./validation.js";

// Mock the API configuration module to isolate tests from real network and environment checks
vi.mock("./config/api.js", () => ({
  apiUtils: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Validation Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Regular Expression Constants", () => {
    it("should export a valid email regex pattern", () => {
      expect(emailPattern).toBeInstanceOf(RegExp);
      expect(emailPattern.test("test@example.com")).toBe(true);
      expect(emailPattern.test("invalid-email")).toBe(false);
    });

    it("should export a valid phone regex pattern", () => {
      expect(phonePattern).toBeInstanceOf(RegExp);
      expect(phonePattern.test("+15551234567")).toBe(true);
      expect(phonePattern.test("123-456-7890")).toBe(true);
      expect(phonePattern.test("not-a-phone-number-xyz")).toBe(false);
    });
  });

  describe("Synchronous Validators (validate object)", () => {
    describe("email validator", () => {
      it("passes valid emails", () => {
        expect(validate.email("alice@domain.com")).toBe(true);
        expect(validate.email("test.name+filter@domain.co.uk")).toBe(true);
      });

      it("returns error message for invalid formats", () => {
        expect(validate.email("plainaddress")).toBe("Invalid email format");
        expect(validate.email("missingdomain@")).toBe("Invalid email format");
        expect(validate.email("@missingusername.com")).toBe("Invalid email format");
        expect(validate.email(null)).toBe("Invalid email format");
      });

      it("guards against extremely long strings", () => {
        const longEmail = "a".repeat(250) + "@example.com";
        expect(validate.email(longEmail)).toBe("Invalid email format");
      });
    });

    describe("password validator", () => {
      it("passes strong passwords meeting all 5 security criteria", () => {
        expect(validate.password("StrongPass1!")).toBe(true);
        expect(validate.password("aB3$567890")).toBe(true);
      });

      it("fails passwords under 8 characters", () => {
        expect(validate.password("Weak1!")).toBe("Password must be at least 8 characters");
        expect(validate.password("")).toBe("Password must be at least 8 characters");
      });

      it("fails passwords missing uppercase letters", () => {
        expect(validate.password("strongpass1!")).toBe(
          "Password must meet all 5 security criteria: 8+ characters, uppercase, lowercase, number, and special character"
        );
      });

      it("fails passwords missing lowercase letters", () => {
        expect(validate.password("STRONGPASS1!")).toBe(
          "Password must meet all 5 security criteria: 8+ characters, uppercase, lowercase, number, and special character"
        );
      });

      it("fails passwords missing numbers", () => {
        expect(validate.password("StrongPass!")).toBe(
          "Password must meet all 5 security criteria: 8+ characters, uppercase, lowercase, number, and special character"
        );
      });

      it("fails passwords missing special characters", () => {
        expect(validate.password("StrongPass1")).toBe(
          "Password must meet all 5 security criteria: 8+ characters, uppercase, lowercase, number, and special character"
        );
      });
    });

    describe("required validator", () => {
      it("passes non-empty strings", () => {
        expect(validate.required("hello")).toBe(true);
        expect(validate.required("  spaced  ")).toBe(true);
      });

      it("fails empty or whitespace strings", () => {
        expect(validate.required("")).toBe("This field is required");
        expect(validate.required("   ")).toBe("This field is required");
        expect(validate.required(null)).toBe("This field is required");
      });
    });

    describe("usernameOrEmail validator", () => {
      it("passes non-empty credentials", () => {
        expect(validate.usernameOrEmail("alice")).toBe(true);
        expect(validate.usernameOrEmail("alice@domain.com")).toBe(true);
      });

      it("fails empty credentials", () => {
        expect(validate.usernameOrEmail("")).toBe("Email or username is required");
        expect(validate.usernameOrEmail(null)).toBe("Email or username is required");
      });
    });

    describe("firstName & lastName validators", () => {
      it("passes valid names", () => {
        expect(validate.firstName("John")).toBe(true);
        expect(validate.lastName("Doe")).toBe(true);
      });

      it("fails empty names", () => {
        expect(validate.firstName("")).toBe("First name is required");
        expect(validate.lastName("  ")).toBe("Last name is required");
      });

      it("fails short names", () => {
        expect(validate.firstName("A")).toBe("At least 2 characters");
      });

      it("fails excessively long names", () => {
        expect(validate.firstName("A".repeat(51))).toBe("Less than 50 characters");
      });
    });

    describe("phone validator", () => {
      it("passes valid formatted phone numbers", () => {
        expect(validate.phone("+1 555 111 2222")).toBe(true);
        expect(validate.phone("123-456-7890")).toBe(true);
        expect(validate.phone("1234567890")).toBe(true);
      });

      it("fails short phone numbers", () => {
        expect(validate.phone("123456789")).toBe("Phone number is invalid");
      });

      it("fails alphabetic characters", () => {
        expect(validate.phone("123-456-789a")).toBe("Phone number is invalid");
      });
    });

    describe("url validator", () => {
      it("passes valid URLs starting with http or https", () => {
        expect(validate.url("https://example.com")).toBe(true);
        expect(validate.url("http://localhost:3000/path")).toBe(true);
      });

      it("fails empty values", () => {
        expect(validate.url("")).toBe("URL is required");
      });

      it("fails invalid URLs or formats", () => {
        expect(validate.url("ftp://example.com")).toBe(
          "Invalid URL format (must start with http:// or https://)"
        );
        expect(validate.url("example.com")).toBe(
          "Invalid URL format (must start with http:// or https://)"
        );
      });

      it("fails URLs exceeding length limit", () => {
        expect(validate.url("https://example.com/" + "a".repeat(2048))).toBe("URL is too long");
      });
    });

    describe("confirmPassword validator", () => {
      it("passes when passwords match", () => {
        expect(validate.confirmPassword("Password123!", { password: "Password123!" })).toBe(true);
      });

      it("fails when passwords do not match", () => {
        expect(validate.confirmPassword("Password123!", { password: "Different!" })).toBe(
          "Passwords do not match"
        );
      });

      it("fails when confirm password field is empty", () => {
        expect(validate.confirmPassword("", { password: "Password123!" })).toBe(
          "Please confirm your password"
        );
      });
    });

    describe("minLength and maxLength builders", () => {
      it("enforces minimum length restriction", () => {
        const min5 = validate.minLength(5);
        expect(min5("abcde")).toBe(true);
        expect(min5("abcd")).toBe("Minimum 5 characters");
      });

      it("enforces maximum length restriction", () => {
        const max5 = validate.maxLength(5);
        expect(max5("abcde")).toBe(true);
        expect(max5("abcdef")).toBe("Maximum 5 characters");
        expect(max5("")).toBe(true); // Optional field compatibility
      });
    });

    describe("eventCapacity validator", () => {
      it("passes valid positive capacities", () => {
        expect(validate.eventCapacity("100")).toBe(true);
        expect(validate.eventCapacity(50)).toBe(true);
      });

      it("passes when optional / undefined", () => {
        expect(validate.eventCapacity(undefined)).toBe(true);
      });

      it("fails negative or zero capacities", () => {
        expect(validate.eventCapacity("-1")).toBe("Must be a positive number");
        expect(validate.eventCapacity("0")).toBe("Must be a positive number");
      });

      it("fails capacities exceeding the limit", () => {
        expect(validate.eventCapacity("100001")).toBe("Maximum capacity is 100,000");
      });
    });

    describe("ticketTierPrice validator", () => {
      it("passes positive prices and zero", () => {
        expect(validate.ticketTierPrice("0")).toBe(true);
        expect(validate.ticketTierPrice("19.99")).toBe(true);
      });

      it("fails negative prices", () => {
        expect(validate.ticketTierPrice("-0.01")).toBe("Price cannot be negative");
      });
    });

    describe("survey sanitization & HTML detection", () => {
      it("sanitizes survey prompts by stripping HTML and capping length", () => {
        expect(validate.sanitizeSurveyPrompt("Select <b>all</b> options")).toBe(
          "Select all options"
        );
        expect(validate.sanitizeSurveyPrompt("a".repeat(200)).length).toBe(150);
      });

      it("sanitizes survey options by stripping HTML and capping length", () => {
        expect(validate.sanitizeSurveyOption("Option <i>One</i>")).toBe("Option One");
        expect(validate.sanitizeSurveyOption("a".repeat(100)).length).toBe(80);
      });

      it("detects HTML tags in strings", () => {
        expect(validate.detectHTML("<p>Hello</p>")).toBe(true);
        expect(validate.detectHTML("Hello world")).toBe(false);
      });
    });
  });

  describe("Validation Normalizers & Hook Adapters", () => {
    describe("toHookValidationResult", () => {
      it("returns true for valid responses", () => {
        expect(toHookValidationResult({ isValid: true })).toBe(true);
      });

      it("returns message or fallback for invalid responses", () => {
        expect(toHookValidationResult({ isValid: false, message: "Taken" })).toBe("Taken");
        expect(toHookValidationResult({ isValid: false })).toBe(
          VALIDATION_MESSAGES.validationUnavailable
        );
      });
    });

    describe("normalizeValidationResult", () => {
      it("normalizes boolean types", () => {
        expect(normalizeValidationResult(true)).toEqual({
          isValid: true,
          message: "",
          isLoading: false,
        });

        expect(normalizeValidationResult(false, "Fail")).toEqual({
          isValid: false,
          message: "Fail",
          isLoading: false,
        });
      });

      it("normalizes string types", () => {
        expect(normalizeValidationResult("Error message")).toEqual({
          isValid: false,
          message: "Error message",
          isLoading: false,
        });
      });

      it("normalizes object responses", () => {
        const customObj = { isValid: true, message: "Ok" };
        expect(normalizeValidationResult(customObj)).toEqual({
          isValid: true,
          message: "Ok",
          isLoading: false,
        });
      });
    });
  });

  describe("Asynchronous Validators", () => {
    it("validates email format locally before calling the API", async () => {
      const result = await validateEmailAvailability("bad-email");

      expect(result).toEqual({
        isValid: false,
        message: "Invalid email format",
        isLoading: false,
      });
      expect(apiUtils.get).not.toHaveBeenCalled();
    });

    it("checks email availability through the API layer", async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ available: false }),
      });

      const result = await validateEmailAvailability("taken@example.com", {
        messages: { unavailable: "Use another email" },
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Use another email");
      expect(apiUtils.get).toHaveBeenCalledWith(
        "/api/validate/email/taken%40example.com",
        expect.any(Object)
      );
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

      expect(apiUtils.get).not.toHaveBeenCalled();
    });

    it("checks username availability through the API layer", async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ available: true }),
      });

      const result = await validateUsernameUnique("unique_user");

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("");
      expect(apiUtils.get).toHaveBeenCalledWith(
        "/api/validate/username/unique_user",
        expect.any(Object)
      );
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

    it("can validate phone format locally without making API calls", async () => {
      const result = await validatePhoneNumber("+1 555 111 2222", {
        useApi: false,
      });

      expect(result).toEqual({
        isValid: true,
        message: "",
        isLoading: false,
      });
      expect(apiUtils.post).not.toHaveBeenCalled();
    });

    it("can validate phone format with API calls", async () => {
      apiUtils.post.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: true }),
      });

      const result = await validatePhoneNumber("+1 555 111 2222", {
        useApi: true,
      });

      expect(result).toEqual({
        isValid: true,
        message: "",
        isLoading: false,
        data: { valid: true },
      });
      expect(apiUtils.post).toHaveBeenCalledWith(
        "/api/validate/phone",
        { phone: "+1 555 111 2222" },
        expect.any(Object)
      );
    });
  });

  describe("Custom & Hook Validator Adapters", () => {
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
});
