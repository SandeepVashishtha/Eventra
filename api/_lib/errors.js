export class AppError extends Error {
  constructor(status, message, code, meta = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp,
      ...(Object.keys(this.meta).length > 0 && { meta: this.meta }),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = []) {
    super(400, message, "VALIDATION_ERROR", { fields });
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message, code = "CONFLICT") {
    super(409, message, code);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", retryAfter = 60) {
    super(429, message, "RATE_LIMIT_EXCEEDED", { retryAfter });
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable") {
    super(503, message, "SERVICE_UNAVAILABLE");
    this.name = "ServiceUnavailableError";
  }
}

export function errorHandler(err, req, res) {
  if (err instanceof AppError) {
    return res.status(err.status).json(err.toJSON());
  }

  if (err?.code === "CAPACITY_FULL") {
    return res.status(409).json({
      error: "Event is at full capacity",
      code: "CAPACITY_FULL",
    });
  }

  if (err?.code === "DUPLICATE_REGISTRATION" || err?.code === "23505") {
    return res.status(409).json({
      error: "You are already registered for this event",
      code: "DUPLICATE_REGISTRATION",
    });
  }

  if (err?.status === 429 || err?.statusCode === 429) {
    return res.status(429).json({
      error: err.message || "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

export function wrapHandler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      errorHandler(err, req, res);
    }
  };
}
