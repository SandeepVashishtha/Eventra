# Request Signing

## Overview

This feature adds request signing support for sensitive API operations.

The implementation uses:

- HMAC SHA-256 signatures
- Timestamp validation
- Nonce generation
- Replay attack prevention

## Flow

1. Client generates timestamp.
2. Client generates nonce.
3. Client signs payload using HMAC-SHA256.
4. Signature is sent with request headers.
5. Server validates:
   - Timestamp freshness
   - Nonce uniqueness
   - Signature integrity

## Security Benefits

- Prevents replay attacks
- Detects payload tampering
- Rejects expired requests
- Adds an additional security layer beyond authentication

## Future Improvements

- Redis-backed nonce storage
- Automatic key rotation
- Endpoint-level signature enforcement
- Security monitoring integration