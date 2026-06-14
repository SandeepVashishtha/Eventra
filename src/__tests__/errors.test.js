import { describe, test, expect, vi } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  errorHandler,
  wrapHandler,
} from "../../api/_lib/errors.js";

function mockReq() {
  return {};
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("AppError", () => {
  test("creates error with all properties", () => {
    const err = new AppError(400, "Bad request", "BAD_REQUEST", { field: "name" });
    expect(err.status).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.meta).toEqual({ field: "name" });
    expect(err.name).toBe("AppError");
    expect(err.timestamp).toBeDefined();
  });

  test("toJSON returns serializable object", () => {
    const err = new AppError(404, "Not found", "NOT_FOUND");
    const json = err.toJSON();
    expect(json.error).toBe("Not found");
    expect(json.code).toBe("NOT_FOUND");
    expect(json.status).toBe(404);
    expect(json.timestamp).toBeDefined();
    expect(json.meta).toBeUndefined();
  });

  test("toJSON includes meta when present", () => {
    const err = new AppError(400, "Bad", "BAD", { retryAfter: 30 });
    const json = err.toJSON();
    expect(json.meta).toEqual({ retryAfter: 30 });
  });
});

describe("Error subclasses", () => {
  test("ValidationError sets 400 status", () => {
    const err = new ValidationError("Invalid input", ["email"]);
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.meta.fields).toEqual(["email"]);
  });

  test("AuthenticationError sets 401 status", () => {
    const err = new AuthenticationError();
    expect(err.status).toBe(401);
    expect(err.code).toBe("AUTHENTICATION_ERROR");
  });

  test("AuthenticationError with custom message", () => {
    const err = new AuthenticationError("Custom auth message");
    expect(err.message).toBe("Custom auth message");
  });

  test("ForbiddenError sets 403 status", () => {
    const err = new ForbiddenError();
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  test("ForbiddenError with custom message", () => {
    const err = new ForbiddenError("Custom forbidden");
    expect(err.message).toBe("Custom forbidden");
  });

  test("NotFoundError sets 404 status", () => {
    const err = new NotFoundError("Event");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Event not found");
    expect(err.code).toBe("NOT_FOUND");
  });

  test("NotFoundError uses default message", () => {
    const err = new NotFoundError();
    expect(err.message).toBe("Resource not found");
  });

  test("ConflictError sets 409 status", () => {
    const err = new ConflictError("Duplicate entry");
    expect(err.status).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  test("ConflictError with custom code", () => {
    const err = new ConflictError("Capacity full", "CAPACITY_FULL");
    expect(err.code).toBe("CAPACITY_FULL");
  });

  test("RateLimitError sets 429 status", () => {
    const err = new RateLimitError("Too fast");
    expect(err.status).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(err.meta.retryAfter).toBe(60);
  });

  test("RateLimitError with custom retryAfter", () => {
    const err = new RateLimitError("Slow down", 120);
    expect(err.meta.retryAfter).toBe(120);
  });

  test("ServiceUnavailableError sets 503 status", () => {
    const err = new ServiceUnavailableError("Down for maintenance");
    expect(err.status).toBe(503);
    expect(err.code).toBe("SERVICE_UNAVAILABLE");
  });
});

describe("errorHandler", () => {
  test("handles AppError with correct status and body", () => {
    const err = new NotFoundError("Event");
    const req = mockReq();
    const res = mockRes();
    errorHandler(err, req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Event not found",
      code: "NOT_FOUND",
    }));
  });

  test("handles CAPACITY_FULL error code", () => {
    const err = { code: "CAPACITY_FULL" };
    const res = mockRes();
    errorHandler(err, mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("handles DUPLICATE_REGISTRATION error code", () => {
    const err = { code: "DUPLICATE_REGISTRATION" };
    const res = mockRes();
    errorHandler(err, mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("handles 429 status from plain errors", () => {
    const err = { status: 429, message: "Too fast" };
    const res = mockRes();
    errorHandler(err, mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  test("handles unknown errors with 500", () => {
    const err = new Error("Something broke");
    const res = mockRes();
    errorHandler(err, mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("wrapHandler", () => {
  test("wraps a successful handler", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = wrapHandler(handler);
    const req = mockReq();
    const res = mockRes();
    await wrapped(req, res);
    expect(handler).toHaveBeenCalledWith(req, res);
  });

  test("catches errors from wrapped handler", async () => {
    const handler = vi.fn().mockRejectedValue(new NotFoundError("Event"));
    const wrapped = wrapHandler(handler);
    const res = mockRes();
    await wrapped(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("passes through non-AppError to errorHandler", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("Generic"));
    const wrapped = wrapHandler(handler);
    const res = mockRes();
    await wrapped(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
