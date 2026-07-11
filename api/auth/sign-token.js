/**
 * api/auth/sign-token.js
 *
 * Secure JWT token signing endpoint with proper key management and algorithm validation.
 * Prevents algorithm confusion attacks and enforces cryptographic security.
 */

import { JWTSigningService } from '../../src/utils/jwtSigningService.js';

const isWrongMethod = (req) => req.method !== 'POST';
const isPayloadInvalid = (req) => {
  const { payload } = req.body;
  return !payload || typeof payload !== 'object';
};
const isSecretMissing = () => !process.env.JWT_SECRET || !process.env.JWT_SECRET.trim();

const REQUEST_VALIDATORS = [
  { test: isWrongMethod, status: 405, message: 'Method not allowed' },
  { test: isPayloadInvalid, status: 400, message: 'Payload must be a JSON object' },
  { test: isSecretMissing, status: 500, message: 'Server configuration error' },
];

function findValidationFailure(req) {
  return REQUEST_VALIDATORS.find((validator) => validator.test(req)) || null;
}

function createConfiguredSigningService() {
  return new JWTSigningService({
    secret: process.env.JWT_SECRET,
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  });
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    if (failure.status === 500) {
      console.error('[SECURITY ERROR] JWT_SECRET is not configured');
    }
    return res.status(failure.status).json({ message: failure.message });
  }

  try {
    const { payload, options } = req.body;
    const jwtService = createConfiguredSigningService();
    const token = jwtService.signToken(payload, options || {});

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
