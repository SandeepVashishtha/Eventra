// serverless backend endpoint for AI recommendations
// Secures the Groq API key from frontend exposure

import { verifyAuth } from "./middleware/auth.js";
import { buildCorsHeaders } from "./auth/cors.js";
import { fetchWithTimeout } from "./lib/fetchWithTimeout.js";
import { checkRateLimit } from "./lib/redisRateLimiter.js";

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

// Hard limit on prompt length. Groq charges per token; an unbounded prompt
// lets an unauthenticated caller exhaust the API quota in a single request.
const MAX_PROMPT_LENGTH = 2000;

// ---------------------------------------------------------------------------
// System prompt
//
// Constrains the LLM to event-recommendation tasks only. Without this,
// any authenticated user can use this endpoint as an unrestricted
// general-purpose AI proxy — generating arbitrary content, consuming quota
// for unintended use cases, or performing prompt-injection attacks.
//
// The system message is the first message in every conversation and
// establishes the model's persona and operating boundaries. Callers
// provide only the user turn; the server always injects this system turn.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT =
  "You are an event recommendation assistant for the Eventra platform. " +
  "Your only job is to help users discover, filter, and compare events " +
  "based on their interests, schedule, and preferences. " +
  "Always respond in the context of event recommendations. " +
  "If a request is unrelated to finding or comparing events, politely decline " +
  "and redirect the user to ask an event-related question instead. " +
  "Never generate code, write documents, answer general knowledge questions, " +
  "or fulfil any request that is not directly about helping users with events on Eventra.";


// ---------------------------------------------------------------------------
// Handler (wrapped by verifyAuth - requires a valid Eventra JWT)
// ---------------------------------------------------------------------------

async function handler(req, res) {
  // Use shared CORS utility (never returns wildcard — maintains credentials safety)
  res.setHeader("Access-Control-Allow-Origin", buildCorsHeaders(req)["Access-Control-Allow-Origin"]);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // req.user is set by verifyAuth after successful JWT verification
  const userId = req.user?.id || req.user?.email || "unknown";

  // Prevents coordinated multi-user attacks from exhausting the Groq API quota.
  const globalLimitResult = await checkRateLimit("ratelimit:ai:global", 60000, 100);
  if (!globalLimitResult.allowed) {
    res.setHeader("X-RateLimit-Limit", "100");
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("Retry-After", String(globalLimitResult.retryAfter));
    return res.status(429).json({
      error: "Service is temporarily busy. Please try again in a moment.",
      retryAfter: globalLimitResult.retryAfter,
    });
  }
  
  // Per-user rate limiting
  const userLimitResult = await checkRateLimit(`ratelimit:ai:user:${userId}`, 60000, 10);
  if (!userLimitResult.allowed) {
    res.setHeader("X-RateLimit-Limit", "10");
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("Retry-After", String(userLimitResult.retryAfter));
    return res.status(429).json({
      error: "Too many requests. Please wait before sending another recommendation request.",
      retryAfter: userLimitResult.retryAfter,
    });
  }

  // Set success headers for the user rate limit
  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", String(userLimitResult.remaining));

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on the server." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Reject oversized prompts before they reach Groq to prevent token-quota drain
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters.`,
      });
    }

    const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          // System message is always injected server-side — callers cannot
          // override it by supplying their own system turn in the request body.
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.7,
      }),
    }, 12000);

    const data = await response.json();

    if (!response.ok) {
      console.error("[Groq Proxy API] Error:", data);
      return res.status(response.status).json({ error: "Groq API request failed.", details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[Groq Proxy API] Request Failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default verifyAuth(handler);



