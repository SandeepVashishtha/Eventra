import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import { attachRateLimiters, loginLimiter } from './rateLimiter.js';

test('login limiter returns a JSON 429 response with retry-after headers', async () => {
  const app = express();
  app.set('trust proxy', 1);
  app.use('/api/auth/login', loginLimiter);
  app.post('/api/auth/login', (_req, res) => {
    res.json({ success: true, message: 'ok' });
  });

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    for (let index = 0; index < 5; index += 1) {
      const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
      });
      assert.equal(response.status, 200, `Request ${index + 1} should be allowed`);
    }

    const blockedResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
    });
    const payload = await blockedResponse.json();

    assert.equal(blockedResponse.status, 429);
    assert.equal(payload.success, false);
    assert.equal(payload.message, 'Too many requests. Please try again later.');
    assert.ok(blockedResponse.headers.get('retry-after'));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
