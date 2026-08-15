import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError, getApiErrorStatus, getApiErrorMessage } from "../src/config/api/errors.js";

describe("getApiErrorStatus / getApiErrorMessage", () => {
  it("reads status and message from ApiError", () => {
    const err = new ApiError("nope", { status: 409, data: { message: "already registered" } });
    assert.equal(getApiErrorStatus(err), 409);
    assert.equal(getApiErrorMessage(err), "already registered");
  });

  it("falls back to Axios-shaped errors", () => {
    const err = { response: { status: 401, data: { message: "login required" } } };
    assert.equal(getApiErrorStatus(err), 401);
    assert.equal(getApiErrorMessage(err), "login required");
  });

  it("returns null when nothing is present", () => {
    assert.equal(getApiErrorStatus({}), null);
    assert.equal(getApiErrorMessage({}), null);
  });
});
