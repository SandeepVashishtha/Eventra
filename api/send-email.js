// ---------------------------------------------------------------------------
// Serverless email confirmation proxy
//
// Sends event registration confirmation emails via EmailJS server-side so
// the service ID, template ID, and public key are never bundled into the
// frontend JavaScript. All three values are read from server-only environment
// variables (without the REACT_APP_ prefix).
//
// Protected by verifyAuth so only authenticated users can trigger sends.
// Per-user rate limiting (5 sends per minute) prevents spam abuse.
// ---------------------------------------------------------------------------

import { verifyAuth } from "./middleware/auth.js";
import { fetchWithTimeout } from "./lib/fetchWithTimeout.js";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_SENDS = 5;
const rateLimitMap = new Map();
let lastEvictionAt = 0;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_SENDS) return false;
  entry.count += 1;
  return true;
};

const evictStale = () => {
  const now = Date.now();
  if (now - lastEvictionAt < RATE_LIMIT_WINDOW_MS) return;
  lastEvictionAt = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
  }
};

// Basic email format validation — prevents obviously malformed addresses from
// reaching the EmailJS API and consuming quota.
const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

async function handler(req, res) {
  const corsOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  if (corsOrigin !== "*") res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const userId = req.user?.id || req.user?.email || "unknown";
  const authenticatedEmail = typeof req.user?.email === "string" ? req.user.email.trim().toLowerCase() : "";
  evictStale();

  if (!checkRateLimit(userId)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many email requests. Please wait before sending another." });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return res.status(500).json({ error: "Email service is not configured on the server." });
  }

  const { toEmail, toName, eventName, eventDate } = req.body || {};

  if (!toEmail || !isValidEmail(toEmail)) {
    return res.status(400).json({ error: "A valid recipient email address is required." });
  }

  const normalizedRecipientEmail = toEmail.trim().toLowerCase();
  if (!authenticatedEmail || normalizedRecipientEmail !== authenticatedEmail) {
    return res.status(403).json({
      error: "You can only send confirmation emails to your authenticated email address.",
    });
  }

  const recipientName = typeof toName === "string" ? toName.slice(0, 100).trim() : "Participant";
  const eventTitle = typeof eventName === "string" ? eventName.slice(0, 200).trim() : "your event";
  const eventDateStr = typeof eventDate === "string" ? eventDate.slice(0, 50).trim() : "";

  console.info("[send-email] confirmation email requested", {
    userId,
    recipient: normalizedRecipientEmail,
  });

  try {
    const response = await fetchWithTimeout("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: toEmail.trim(),
          to_name: recipientName,
          event_name: eventTitle,
          event_date: eventDateStr,
        },
      }),
    }, 8000);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[send-email] EmailJS error:", response.status, text);
      return res.status(502).json({ error: "Email delivery failed. Please try again later." });
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error("[send-email] Request failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default verifyAuth(handler);
;

