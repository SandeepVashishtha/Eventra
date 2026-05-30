import crypto from "node:crypto";
import { createClient } from "redis";

const REVOCATION_KEY_PREFIX = "eventra:revoked:";
const DEFAULT_MEMORY_PREFIX = "memory:";

class TokenRevocationStoreError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "TokenRevocationStoreError";
    this.cause = cause;
  }
}

const createTokenIdentifier = (token, decodedToken = {}) => {
  if (decodedToken?.jti && String(decodedToken.jti).trim()) {
    return `jti:${String(decodedToken.jti).trim()}`;
  }

  return `sha256:${crypto.createHash("sha256").update(token).digest("hex")}`;
};

const getTokenTtlSeconds = (decodedToken = {}) => {
  const expiresAt = Number(decodedToken.exp);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  const ttlSeconds = expiresAt - Math.floor(Date.now() / 1000);
  return ttlSeconds > 0 ? ttlSeconds : 1;
};

const createMemoryBackend = () => {
  const revokedTokens = new Map();

  return {
    async revoke(key, ttlSeconds) {
      revokedTokens.set(key, Date.now() + ttlSeconds * 1000);
    },
    async isRevoked(key) {
      const expiresAt = revokedTokens.get(key);
      if (!expiresAt) {
        return false;
      }

      if (expiresAt <= Date.now()) {
        revokedTokens.delete(key);
        return false;
      }

      return true;
    },
    async clear() {
      revokedTokens.clear();
    },
  };
};

const createRedisBackend = (redisUrl) => {
  let clientPromise = null;

  const getClient = async () => {
    if (!clientPromise) {
      const client = createClient({ url: redisUrl });

      client.on("error", (error) => {
        console.error("[TokenRevocation] Redis client error:", error);
      });

      clientPromise = client
        .connect()
        .then(() => client)
        .catch((error) => {
          clientPromise = null;
          throw new TokenRevocationStoreError(
            "Failed to connect to the Redis revocation store.",
            error
          );
        });
    }

    return clientPromise;
  };

  return {
    async revoke(key, ttlSeconds) {
      try {
        const client = await getClient();
        await client.set(`${REVOCATION_KEY_PREFIX}${key}`, "1", { EX: ttlSeconds });
      } catch (error) {
        if (error instanceof TokenRevocationStoreError) {
          throw error;
        }

        throw new TokenRevocationStoreError(
          "Failed to write revoked token to the Redis revocation store.",
          error
        );
      }
    },
    async isRevoked(key) {
      try {
        const client = await getClient();
        const exists = await client.exists(`${REVOCATION_KEY_PREFIX}${key}`);
        return exists === 1;
      } catch (error) {
        if (error instanceof TokenRevocationStoreError) {
          throw error;
        }

        throw new TokenRevocationStoreError(
          "Failed to read token revocation state from Redis.",
          error
        );
      }
    },
    async clear() {
      try {
        const client = await getClient();
        const keys = await client.keys(`${REVOCATION_KEY_PREFIX}*`);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } catch (error) {
        if (error instanceof TokenRevocationStoreError) {
          throw error;
        }

        throw new TokenRevocationStoreError(
          "Failed to clear the Redis revocation store.",
          error
        );
      }
    },
  };
};

const resolveBackend = () => {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (redisUrl) {
    return createRedisBackend(redisUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new TokenRevocationStoreError(
      "Missing required environment variable: REDIS_URL. Eventra cannot start without centralized token revocation storage."
    );
  }

  return createMemoryBackend();
};

const defaultBackend = resolveBackend();

const createTokenRevocationService = (backend = defaultBackend) => {
  const buildKey = (token, decodedToken) => createTokenIdentifier(token, decodedToken);

  return {
    async revokeToken(token, decodedToken = {}) {
      const ttlSeconds = getTokenTtlSeconds(decodedToken);

      if (!ttlSeconds) {
        throw new TokenRevocationStoreError(
          "Cannot revoke a token without a valid expiration timestamp."
        );
      }

      await backend.revoke(buildKey(token, decodedToken), ttlSeconds);
    },
    async isTokenRevoked(token, decodedToken = {}) {
      return backend.isRevoked(buildKey(token, decodedToken));
    },
    async clearForTests() {
      if (typeof backend.clear === "function") {
        await backend.clear();
      }
    },
  };
};

const tokenRevocationService = createTokenRevocationService();

export {
  TokenRevocationStoreError,
  createTokenRevocationService,
  tokenRevocationService,
  createTokenIdentifier,
  getTokenTtlSeconds,
  REVOCATION_KEY_PREFIX,
  DEFAULT_MEMORY_PREFIX,
};