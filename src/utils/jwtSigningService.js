/**
 * jwtSigningService.js
 *
 * Secure JWT token signing and validation service.
 * Implements proper key management, algorithm whitelisting, and cryptographic security.
 */

import crypto from 'node:crypto';

/**
 * Allowed JWT signing algorithms
 * Restricted to secure algorithms that prevent algorithm confusion attacks
 */
const ALLOWED_ALGORITHMS = [
  'HS256', // HMAC with SHA-256
  'HS384', // HMAC with SHA-384
  'HS512', // HMAC with SHA-512
  'RS256', // RSA with SHA-256
  'RS384', // RSA with SHA-384
  'RS512', // RSA with SHA-512
  'ES256', // ECDSA with SHA-256
  'ES384', // ECDSA with SHA-384
  'ES512', // ECDSA with SHA-512
];

/**
 * Algorithm families for validation
 */
const ALGORITHM_FAMILIES = {
  HS: 'symmetric',
  RS: 'asymmetric',
  ES: 'asymmetric',
};

class JWTSigningService {
  constructor(options = {}) {
    this.secret = options.secret || process.env.JWT_SECRET;
    this.privateKey = options.privateKey;
    this.publicKey = options.publicKey;
    this.algorithm = options.algorithm || 'HS256';
    this.expiresIn = options.expiresIn || 3600;

    this.validateConfiguration();
  }

  /**
   * Validate symmetric (HMAC) key configuration
   */
  validateSymmetricConfiguration() {
    if (!this.algorithm.startsWith('HS')) {
      return;
    }

    if (!this.secret) {
      throw new Error('JWT_SECRET is required for HMAC algorithms');
    }

    if (this.secret.length < 32) {
      console.warn('[SECURITY WARNING] JWT_SECRET is too short. Minimum 32 bytes recommended.');
    }
  }

  /**
   * Validate asymmetric (RSA/ECDSA) key configuration
   */
  validateAsymmetricConfiguration() {
    const isAsymmetric = this.algorithm.startsWith('RS') || this.algorithm.startsWith('ES');
    if (!isAsymmetric) {
      return;
    }

    if (!this.privateKey) {
      throw new Error('Private key is required for asymmetric algorithms');
    }
    if (!this.publicKey) {
      throw new Error('Public key is required for asymmetric algorithms');
    }
  }

  /**
   * Validate the configured algorithm is on the whitelist
   */
  validateAlgorithmWhitelisted() {
    if (!ALLOWED_ALGORITHMS.includes(this.algorithm)) {
      throw new Error(`Algorithm ${this.algorithm} is not whitelisted. Allowed: ${ALLOWED_ALGORITHMS.join(', ')}`);
    }
  }

  /**
   * Validate service configuration for security
   */
  validateConfiguration() {
    this.validateSymmetricConfiguration();
    this.validateAsymmetricConfiguration();
    this.validateAlgorithmWhitelisted();
  }

  /**
   * Build the JWT header, including an optional key ID for key rotation
   */
  buildHeader(options) {
    const header = {
      alg: this.algorithm,
      typ: 'JWT',
    };

    if (options.keyId) {
      header.kid = options.keyId;
    }

    return header;
  }

  /**
   * Build the token payload with standard claims (iat, exp, nbf)
   */
  buildTokenPayload(payload, options) {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      iat: now,
      ...payload,
    };

    if (options.expiresIn !== null) {
      const expiresIn = options.expiresIn || this.expiresIn;
      tokenPayload.exp = now + expiresIn;
    }

    if (options.notBefore) {
      tokenPayload.nbf = now + options.notBefore;
    }

    return tokenPayload;
  }

  /**
   * Sign a message using the configured algorithm family
   */
  signMessage(message) {
    const signers = {
      HS: () => this.signHMAC(message),
      RS: () => this.signRSA(message),
      ES: () => this.signECDSA(message),
    };

    const family = this.algorithm.slice(0, 2);
    if (!signers[family]) {
      throw new Error(`Unsupported algorithm: ${this.algorithm}`);
    }

    return signers[family]();
  }

  /**
   * Sign a JWT token with payload
   */
  signToken(payload, options = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const header = this.buildHeader(options);
    const tokenPayload = this.buildTokenPayload(payload, options);

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const message = `${encodedHeader}.${encodedPayload}`;

    const signature = this.signMessage(message);

    return `${message}.${signature}`;
  }

  /**
   * Sign message with HMAC
   */
  signHMAC(message) {
    const hash = crypto
      .createHmac(this.getHashAlgorithm(), this.secret)
      .update(message)
      .digest();

    return this.base64UrlEncode(hash);
  }

  /**
   * Sign message with RSA
   */
  signRSA(message) {
    const signer = crypto.createSign(this.getHashAlgorithm());
    signer.update(message);
    const signature = signer.sign(this.privateKey);
    return this.base64UrlEncode(signature);
  }

  /**
   * Sign message with ECDSA
   */
  signECDSA(message) {
    const signer = crypto.createSign(this.getHashAlgorithm());
    signer.update(message);
    const signature = signer.sign(this.privateKey);
    return this.base64UrlEncode(signature);
  }

  /**
   * Split and decode a token into its three constituent parts
   */
  splitTokenParts(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    return parts;
  }

  /**
   * Decode and validate the token header, enforcing algorithm safety
   */
  decodeAndValidateHeader(encodedHeader) {
    let header;
    try {
      header = JSON.parse(this.base64UrlDecode(encodedHeader));
    } catch {
      throw new Error('Invalid token header');
    }

    if (!header.alg) {
      throw new Error('Missing algorithm in token header');
    }

    // Prevent algorithm confusion attack
    if (header.alg !== this.algorithm) {
      throw new Error(`Algorithm mismatch: token uses ${header.alg}, expected ${this.algorithm}`);
    }

    if (!ALLOWED_ALGORITHMS.includes(header.alg)) {
      throw new Error(`Algorithm ${header.alg} is not whitelisted`);
    }

    return header;
  }

  /**
   * Verify the token signature using the algorithm family's verifier
   */
  verifySignature(algorithm, message, encodedSignature) {
    const verifiers = {
      HS: () => this.verifyHMACSignature(message, encodedSignature),
      RS: () => this.verifyRSASignature(message, encodedSignature),
      ES: () => this.verifyECDSASignature(message, encodedSignature),
    };

    const family = algorithm.slice(0, 2);
    const isValid = verifiers[family] ? verifiers[family]() : false;

    if (!isValid) {
      throw new Error('Invalid token signature');
    }
  }

  /**
   * Decode and parse the token payload
   */
  decodeAndValidatePayload(encodedPayload) {
    try {
      return JSON.parse(this.base64UrlDecode(encodedPayload));
    } catch {
      throw new Error('Invalid token payload');
    }
  }

  /**
   * Validate standard time-based claims (exp, nbf, iat)
   */
  validateClaims(payload) {
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    if (payload.nbf && payload.nbf > now) {
      throw new Error('Token not yet valid');
    }

    if (payload.iat && payload.iat > now + 60) {
      throw new Error('Token issued in the future (clock skew)');
    }
  }

  /**
   * Verify a JWT token
   */
  verifyToken(token, options = {}) {
    const [encodedHeader, encodedPayload, encodedSignature] = this.splitTokenParts(token);
    const header = this.decodeAndValidateHeader(encodedHeader);

    const message = `${encodedHeader}.${encodedPayload}`;
    this.verifySignature(header.alg, message, encodedSignature);

    const payload = this.decodeAndValidatePayload(encodedPayload);
    this.validateClaims(payload);

    return payload;
  }

  /**
   * Verify HMAC signature
   */
  verifyHMACSignature(message, encodedSignature) {
    const expected = this.signHMAC(message);
    return crypto.timingSafeEqual(
      Buffer.from(encodedSignature),
      Buffer.from(expected)
    );
  }

  /**
   * Verify RSA signature
   */
  verifyRSASignature(message, encodedSignature) {
    const verifier = crypto.createVerify(this.getHashAlgorithm());
    verifier.update(message);
    const signature = this.base64UrlDecode(encodedSignature);
    return verifier.verify(this.publicKey, signature);
  }

  /**
   * Verify ECDSA signature
   */
  verifyECDSASignature(message, encodedSignature) {
    const verifier = crypto.createVerify(this.getHashAlgorithm());
    verifier.update(message);
    const signature = this.base64UrlDecode(encodedSignature);
    return verifier.verify(this.publicKey, signature);
  }

  /**
   * Get hash algorithm name from JWT algorithm
   */
  getHashAlgorithm() {
    const lastThreeChars = this.algorithm.slice(-3);
    if (lastThreeChars === '256') return 'sha256';
    if (lastThreeChars === '384') return 'sha384';
    if (lastThreeChars === '512') return 'sha512';
    throw new Error(`Unknown hash algorithm for ${this.algorithm}`);
  }

  /**
   * Base64URL encode
   */
  base64UrlEncode(data) {
    const buffer = typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data);

    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64URL decode
   */
  base64UrlDecode(str) {
    const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
    return Buffer.from(
      padded
        .replace(/-/g, '+')
        .replace(/_/g, '/'),
      'base64'
    ).toString('utf-8');
  }

  /**
   * Generate secure random secret
   */
  static generateSecureSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Get algorithm family
   */
  static getAlgorithmFamily(algorithm) {
    const firstTwoChars = algorithm.slice(0, 2);
    return ALGORITHM_FAMILIES[firstTwoChars];
  }

  /**
   * List allowed algorithms
   */
  static getAllowedAlgorithms() {
    return [...ALLOWED_ALGORITHMS];
  }
}

export const jwtSigningService = new JWTSigningService();
export { JWTSigningService };
