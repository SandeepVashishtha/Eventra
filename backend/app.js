import express from 'express';
import { attachRateLimiters, loginLimiter, registerLimiter, reservationLimiter, productLimiter, generalLimiter } from './middleware/rateLimiter.js';

const app = express();
attachRateLimiters(app);

app.use(express.json());

app.post('/api/auth/login', loginLimiter, (req, res) => {
  res.json({ success: true, message: 'login ok' });
});

app.post('/api/auth/register', registerLimiter, (req, res) => {
  res.json({ success: true, message: 'register ok' });
});

app.post('/api/reservations', reservationLimiter, (req, res) => {
  res.json({ success: true, message: 'reservation ok' });
});

app.post('/api/products', productLimiter, (req, res) => {
  res.json({ success: true, message: 'product ok' });
});

app.post('/api/contact', generalLimiter, (req, res) => {
  res.json({ success: true, message: 'contact ok' });
});

export default app;
