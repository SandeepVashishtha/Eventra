import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  createValidationResponse,
  normalizeValidationApiResponse,
  validationLoadingResponse,
} from "../src/utils/validationApi.js";

describe("validationApi response helpers", () => {
  it("builds valid and invalid validation responses", () => {
    assert.deepEqual(createValidationResponse(true), {
      isValid: true,
      message: "",
      isLoading: false,
    });

    assert.deepEqual(createValidationResponse(false, "Email is taken"), {
      isValid: false,
      message: "Email is taken",
      isLoading: false,
    });
  });

  it("preserves extra metadata on validation responses", () => {
    assert.deepEqual(
      createValidationResponse(true, "", { status: 200, data: { available: true } }),
      {
        isValid: true,
        message: "",
        isLoading: false,
        status: 200,
        data: { available: true },
      },
    );
  });

  it("returns a loading response for async UI states", () => {
    assert.deepEqual(validationLoadingResponse(), {
      isValid: false,
      message: "Validating...",
      isLoading: true,
    });
  });

  it("normalizes boolean API payloads", () => {
    assert.deepEqual(
      normalizeValidationApiResponse(true, {
        validMessage: "Looks good",
        invalidMessage: "Not allowed",
      }),
      {
        isValid: true,
        message: "",
        isLoading: false,
        data: true,
      },
    );

    assert.deepEqual(
      normalizeValidationApiResponse(false, {
        validMessage: "Looks good",
        invalidMessage: "Not allowed",
      }),
      {
        isValid: false,
        message: "Not allowed",
        isLoading: false,
        data: false,
      },
    );
  });

  it("normalizes isValid, valid, and availability fields", () => {
    assert.equal(
      normalizeValidationApiResponse({ isValid: false, message: "Taken" }).isValid,
      false,
    );
    assert.equal(normalizeValidationApiResponse({ valid: true }).isValid, true);
    assert.equal(
      normalizeValidationApiResponse({ available: false }, { availabilityField: "available" })
        .isValid,
      false,
    );
  });
});

console.log("validationApi tests passed ✓");
