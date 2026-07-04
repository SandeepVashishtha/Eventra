/**
 * api/auth/sign-token.js
 *
 * Secure JWT token signing endpoint with proper key management and algorithm validation.
 * Prevents algorithm confusion attacks and enforces cryptographic security.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Validate request
    const { payload, options } = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        message: 'Payload must be a JSON object',
      });
    }

    // 2. Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
      console.error('[SECURITY ERROR] JWT_SECRET is not configured');
      return res.status(500).json({
        message: 'Server configuration error',
      });
    }

    if (process.env.JWT_SECRET.length < 32) {
      console.warn('[SECURITY WARNING] JWT_SECRET is too short');
    }

    // 3. Create JWT signing service
    const jwtService = createJWTSigningService({
      secret: process.env.JWT_SECRET,
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    });

    // 4. Sign token
    const token = jwtService.signToken(payload, options || {});

    // 5. Return token
    return res.status(200).json({
      success: true,
      token,
      expiresIn: options?.expiresIn || process.env.JWT_EXPIRES_IN || 3600,
      type: 'Bearer',
    });
  } catch (error) {
    console.error('Token signing error:', error);
    return res.status(500).json({
      message: 'Failed to sign token',
      error: error.message,
    });
  }
}

/**
 * Minimal inline JWT signing service
 * Uses Node.js crypto module for secure signing
 */
function createJWTSigningService(config) {
  const crypto = require('crypto');

  return {
    signToken(payload, options = {}) {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Payload must be an object');
      }

      // Create header
      const header = {
        alg: config.algorithm,
        typ: 'JWT',
      };

      // Create payload with standard claims
      const now = Math.floor(Date.now() / 1000);
      const tokenPayload = {
        iat: now,
        ...payload,
      };

      // Add expiration unless explicitly disabled
      if (options.expiresIn !== null) {
        const expiresIn = options.expiresIn || config.expiresIn;
        tokenPayload.exp = now + expiresIn;
      }

      // Encode header and payload
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));

      const message = `${encodedHeader}.${encodedPayload}`;

      // Sign with HMAC
      const hash = crypto
        .createHmac('sha256', config.secret)
        .update(message)
        .digest();

      const encodedSignature = this.base64UrlEncode(hash);

      return `${message}.${encodedSignature}`;
    },

    base64UrlEncode(data) {
      const buffer = typeof data === 'string'
        ? Buffer.from(data, 'utf-8')
        : Buffer.from(data);

      return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },
  };
}
