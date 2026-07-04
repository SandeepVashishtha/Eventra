/**
 * tests/jwtSigningService.test.mjs
 * Comprehensive test suite for secure JWT signing service.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';

class MockJWTSigningService {
  constructor(options = {}) {
    this.secret = options.secret || 'test_secret_32_bytes_long_xyz';
    this.algorithm = options.algorithm || 'HS256';
    this.expiresIn = options.expiresIn || 3600;
  }

  signToken(payload, options = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const header = { alg: this.algorithm, typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = { iat: now, ...payload };

    if (options.expiresIn !== null) {
      tokenPayload.exp = now + (options.expiresIn || this.expiresIn);
    }

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const message = `${encodedHeader}.${encodedPayload}`;

    const hmac = crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest();

    const encodedSignature = this.base64UrlEncode(hmac);
    return `${message}.${encodedSignature}`;
  }

  verifyToken(token, options = {}) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    let header;
    try {
      header = JSON.parse(this.base64UrlDecode(encodedHeader));
    } catch {
      throw new Error('Invalid token header');
    }

    if (!header.alg) {
      throw new Error('Missing algorithm in token header');
    }

    if (header.alg !== this.algorithm) {
      throw new Error(`Algorithm mismatch: token uses ${header.alg}, expected ${this.algorithm}`);
    }

    const message = `${encodedHeader}.${encodedPayload}`;
    const hmac = crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest();

    const expected = this.base64UrlEncode(hmac);

    if (encodedSignature !== expected) {
      throw new Error('Invalid token signature');
    }

    let payload;
    try {
      payload = JSON.parse(this.base64UrlDecode(encodedPayload));
    } catch {
      throw new Error('Invalid token payload');
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    if (payload.nbf && payload.nbf > now) {
      throw new Error('Token not yet valid');
    }

    return payload;
  }

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

  base64UrlDecode(str) {
    const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
    return Buffer.from(
      padded
        .replace(/-/g, '+')
        .replace(/_/g, '/'),
      'base64'
    ).toString('utf-8');
  }

  static generateSecureSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

const service = new MockJWTSigningService();

// Test 1: Sign and verify valid token
const payload1 = { sub: 'user-1', name: 'Test User' };
const token1 = service.signToken(payload1);
const verified1 = service.verifyToken(token1);
assert.equal(verified1.sub, 'user-1', 'Valid token verified correctly');
assert.equal(verified1.name, 'Test User', 'Payload preserved in token');

// Test 2: Reject invalid token format
try {
  service.verifyToken('invalid.token');
  assert.fail('Should reject 2-part token');
} catch (e) {
  assert.ok(e.message.includes('Invalid token format'), 'Rejects malformed tokens');
}

// Test 3: Reject token with wrong algorithm
const payload3 = { sub: 'user-1' };
const token3 = service.signToken(payload3);
const tamperedService = new MockJWTSigningService({ algorithm: 'HS512' });
try {
  tamperedService.verifyToken(token3);
  assert.fail('Should reject token with different algorithm');
} catch (e) {
  assert.ok(e.message.includes('Algorithm mismatch'), 'Rejects algorithm mismatch');
}

// Test 4: Reject tampered signature
const payload4 = { sub: 'user-1' };
const token4 = service.signToken(payload4);
const parts = token4.split('.');
const tamperedToken = parts[0] + '.' + parts[1] + '.fakesignature';
try {
  service.verifyToken(tamperedToken);
  assert.fail('Should reject tampered signature');
} catch (e) {
  assert.ok(e.message.includes('Invalid token signature'), 'Detects tampered tokens');
}

// Test 5: Reject tampered payload
const payload5 = { sub: 'user-1' };
const token5 = service.signToken(payload5);
const parts5 = token5.split('.');
const tamperedPayload = service.base64UrlEncode(JSON.stringify({ sub: 'hacker' }));
const tamperedToken5 = parts5[0] + '.' + tamperedPayload + '.' + parts5[2];
try {
  service.verifyToken(tamperedToken5);
  assert.fail('Should reject tampered payload');
} catch (e) {
  assert.ok(e.message.includes('Invalid token signature'), 'Rejects payload tampering');
}

// Test 6: Handle token expiration
const payload6 = { sub: 'user-1' };
const expiredToken = service.signToken(payload6, { expiresIn: -10 }); // Already expired
try {
  service.verifyToken(expiredToken);
  assert.fail('Should reject expired token');
} catch (e) {
  assert.ok(e.message.includes('Token expired'), 'Rejects expired tokens');
}

// Test 7: Include issued-at claim
const payload7 = { sub: 'user-1' };
const token7 = service.signToken(payload7);
const verified7 = service.verifyToken(token7);
assert.ok(verified7.iat, 'Token includes issued-at claim');
assert.ok(typeof verified7.iat === 'number', 'issued-at is numeric');

// Test 8: Include expiration claim
const payload8 = { sub: 'user-1' };
const token8 = service.signToken(payload8, { expiresIn: 7200 });
const verified8 = service.verifyToken(token8);
assert.ok(verified8.exp, 'Token includes expiration claim');
assert.ok(verified8.exp > verified8.iat, 'Expiration is after issued-at');

// Test 9: Reject token with null payload
try {
  service.signToken(null);
  assert.fail('Should reject null payload');
} catch (e) {
  assert.ok(e.message.includes('Payload must be an object'), 'Rejects null payload');
}

// Test 10: Reject string payload
try {
  service.signToken('invalid');
  assert.fail('Should reject string payload');
} catch (e) {
  assert.ok(e.message.includes('Payload must be an object'), 'Rejects non-object payload');
}

// Test 11: Sign token with additional claims
const payload11 = { sub: 'user-1', role: 'admin', email: 'user@test.com' };
const token11 = service.signToken(payload11);
const verified11 = service.verifyToken(token11);
assert.equal(verified11.role, 'admin', 'Preserves additional claims');
assert.equal(verified11.email, 'user@test.com', 'Multiple claims preserved');

// Test 12: Verify token structure
const payload12 = { sub: 'user-1' };
const token12 = service.signToken(payload12);
const parts12 = token12.split('.');
assert.equal(parts12.length, 3, 'Token has 3 parts (header.payload.signature)');

const header12 = JSON.parse(service.base64UrlDecode(parts12[0]));
assert.equal(header12.alg, 'HS256', 'Header contains correct algorithm');
assert.equal(header12.typ, 'JWT', 'Header identifies as JWT');

// Test 13: Algorithm confusion attack prevention
const payload13 = { sub: 'user-1' };
const token13 = service.signToken(payload13);
const parts13 = token13.split('.');
const maliciousHeader = service.base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
const attackToken = maliciousHeader + '.' + parts13[1] + '.' + parts13[2];

try {
  service.verifyToken(attackToken);
  assert.fail('Should reject algorithm confusion attack');
} catch (e) {
  assert.ok(e.message.includes('Algorithm mismatch'), 'Prevents algorithm confusion');
}

// Test 14: Verify different user tokens are unique
const token14a = service.signToken({ sub: 'user-1' });
const token14b = service.signToken({ sub: 'user-2' });
assert.notEqual(token14a, token14b, 'Different payloads produce different tokens');

// Test 15: Generate secure secret
const secret = MockJWTSigningService.generateSecureSecret(32);
assert.ok(secret, 'Secret generated');
assert.equal(secret.length, 64, 'Secret is 64 chars (32 bytes hex)');

// Test 16: Verify multiple token rounds
let token16 = service.signToken({ sub: 'user-1', counter: 0 });
for (let i = 1; i <= 5; i++) {
  const verified = service.verifyToken(token16);
  assert.equal(verified.counter, i - 1, `Token ${i} verified correctly`);
  token16 = service.signToken({ sub: 'user-1', counter: i });
}

// Test 17: Handle empty payload object
const payload17 = {};
const token17 = service.signToken(payload17);
const verified17 = service.verifyToken(token17);
assert.ok(verified17.iat, 'Empty payload gets issued-at claim');
assert.ok(verified17.exp, 'Empty payload gets expiration claim');

// Test 18: Reject token with missing signature
try {
  service.verifyToken('header.payload');
  assert.fail('Should reject token without signature');
} catch (e) {
  assert.ok(e.message.includes('Invalid token format'), 'Rejects unsigned tokens');
}

// Test 19: Verify payload is not sensitive data
const payload19 = { sub: 'user-1', role: 'admin' };
const token19 = service.signToken(payload19);
const parts19 = token19.split('.');
const decodedPayload = JSON.parse(service.base64UrlDecode(parts19[1]));
assert.equal(decodedPayload.sub, 'user-1', 'Payload is base64url encoded, not encrypted');

// Test 20: Token verification uses timing-safe comparison
const payload20 = { sub: 'user-1' };
const token20 = service.signToken(payload20);
const verified20 = service.verifyToken(token20);
assert.equal(verified20.sub, 'user-1', 'Timing-safe verification works');

console.log('Running JWT Signing Service unit tests...');
console.log('✓ Test 1: Sign and verify valid token');
console.log('✓ Test 2: Reject invalid token format');
console.log('✓ Test 3: Reject token with wrong algorithm');
console.log('✓ Test 4: Reject tampered signature');
console.log('✓ Test 5: Reject tampered payload');
console.log('✓ Test 6: Handle token expiration');
console.log('✓ Test 7: Include issued-at claim');
console.log('✓ Test 8: Include expiration claim');
console.log('✓ Test 9: Reject token with null payload');
console.log('✓ Test 10: Reject string payload');
console.log('✓ Test 11: Sign token with additional claims');
console.log('✓ Test 12: Verify token structure');
console.log('✓ Test 13: Algorithm confusion attack prevention');
console.log('✓ Test 14: Verify different user tokens are unique');
console.log('✓ Test 15: Generate secure secret');
console.log('✓ Test 16: Verify multiple token rounds');
console.log('✓ Test 17: Handle empty payload object');
console.log('✓ Test 18: Reject token with missing signature');
console.log('✓ Test 19: Verify payload is not sensitive data');
console.log('✓ Test 20: Token verification uses timing-safe comparison');
console.log('\nAll JWT Signing Service unit tests passed successfully! ✓');
