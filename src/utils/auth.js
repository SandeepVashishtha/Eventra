import crypto from 'crypto'; export function verifyToken(a, b) { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
