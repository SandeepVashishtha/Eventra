import { decodeProtectedHeader, importSPKI, importX509, jwtVerify } from "jose";
import { next } from "@vercel/functions";

const PROTECTED_TICKET_PREFIX = "/api/tickets";
const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const SUPPORTED_ALGORITHMS = new Set([
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
]);

const JWT_VERIFY_MATERIAL =
  process.env.JWT_PUBLIC_KEY ||
  process.env.JWT_SECRET ||
  process.env.AUTH_JWT_SECRET ||
  process.env.JWT_VERIFY_KEY ||
  "";

function getToken(request) {
  const authorizationHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((accumulator, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) return accumulator;

      const name = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      if (name) accumulator[name] = decodeURIComponent(value);
      return accumulator;
    }, {});

  const cookieNames = ["token", "authToken", "eventra_token"];
  for (const name of cookieNames) {
    const token = cookies[name];
    if (token) return token;
  }

  return null;
}

function normalizeRoles(payload) {
  const candidates = [payload?.roles, payload?.role, payload?.user?.roles, payload?.user?.role];
  const flattened = candidates.flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return [];
  });

  return flattened.map((role) => String(role).trim().toUpperCase()).filter(Boolean);
}

async function resolveVerificationKey(algorithm) {
  if (!JWT_VERIFY_MATERIAL.trim()) {
    throw new Error("JWT verification key is not configured");
  }

  const material = JWT_VERIFY_MATERIAL.trim();

  if (material.includes("BEGIN PUBLIC KEY") || material.includes("BEGIN RSA PUBLIC KEY")) {
    return importSPKI(material, algorithm);
  }

  if (material.includes("BEGIN CERTIFICATE")) {
    return importX509(material, algorithm);
  }

  if (!algorithm.startsWith("HS")) {
    throw new Error("JWT verification key must be a PEM public key for asymmetric algorithms");
  }

  return new TextEncoder().encode(material);
}

function jsonResponse(status, message) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

async function verifyAdminToken(token) {
  const { alg } = decodeProtectedHeader(token);

  if (!SUPPORTED_ALGORITHMS.has(alg)) {
    throw new Error(`Unsupported JWT algorithm: ${alg}`);
  }

  const key = await resolveVerificationKey(alg);
  const { payload } = await jwtVerify(token, key, {
    algorithms: [alg],
  });

  const roles = normalizeRoles(payload);
  return roles.some((role) => ADMIN_ROLES.has(role));
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);

  if (!pathname.startsWith(PROTECTED_TICKET_PREFIX)) {
    return next();
  }

  if (request.method === "OPTIONS") {
    return next();
  }

  const token = getToken(request);
  if (!token) {
    return jsonResponse(401, "Missing authentication token");
  }

  try {
    const isAuthorized = await verifyAdminToken(token);
    if (!isAuthorized) {
      return jsonResponse(403, "Insufficient role for ticket administration");
    }
  } catch {
    return jsonResponse(401, "Invalid or unverified authentication token");
  }

  return next();
}

export const config = {
  matcher: ["/api/tickets/:path*"],
};
