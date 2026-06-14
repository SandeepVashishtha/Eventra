import { sanitizeSessionState } from "./sessionSanitization";

describe("sanitizeSessionState", () => {
  it("redacts all known sensitive keys regardless of camelCase or snake_case", () => {
    const input = {
      accessToken: "abc",
      refreshToken: "def",
      idToken: "ghi",
      apiKey: "key-123",
      api_key: "key-456",
      bearerToken: "bearer-xyz",
      credential: "cred-value",
      password: "hunter2",
      secret: "top-secret",
      mnemonic: "word1 word2",
      privateKey: "priv-key",
      private_key: "priv-key-2",
      authorization: "Bearer token",
      signingKey: "sig-key",
    };

    const result = sanitizeSessionState(input);

    for (const key of Object.keys(input)) {
      expect(result[key]).toBe("[REDACTED]");
    }
  });

  it("preserves non-sensitive fields untouched", () => {
    const input = { userId: "u-123", eventId: 42, page: "home" };
    const result = sanitizeSessionState(input);
    expect(result).toEqual(input);
  });

  it("recursively sanitizes nested objects", () => {
    const input = {
      user: {
        name: "Alice",
        refreshToken: "nested-token",
      },
    };
    const result = sanitizeSessionState(input);
    expect(result.user.name).toBe("Alice");
    expect(result.user.refreshToken).toBe("[REDACTED]");
  });

  it("sanitizes arrays of objects", () => {
    const input = [{ apiKey: "k1" }, { userId: "u1" }];
    const result = sanitizeSessionState(input);
    expect(result[0].apiKey).toBe("[REDACTED]");
    expect(result[1].userId).toBe("u1");
  });

  it("redacts JWT-structured string values even when the key is not sensitive", () => {
    const jwtLike = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.signature";
    const input = { unknownField: jwtLike };
    const result = sanitizeSessionState(input);
    expect(result.unknownField).toBe("[REDACTED_JWT]");
  });

  it("returns null/undefined unchanged", () => {
    expect(sanitizeSessionState(null)).toBeNull();
    expect(sanitizeSessionState(undefined)).toBeUndefined();
  });
});
