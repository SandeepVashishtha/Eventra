// serverless backend endpoint for AI recommendations
// Secures the Groq API key from frontend exposure

import { verifyAuth } from "./middleware/auth.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

// Hard limit on prompt length. Groq charges per token; an unbounded prompt
// lets an unauthenticated caller exhaust the API quota in a single request.
const MAX_PROMPT_LENGTH = 2000;

// ---------------------------------------------------------------------------
// Handler (wrapped by verifyAuth and rateLimiter)
// ---------------------------------------------------------------------------

async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGIN || "*"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.REACT_APP_GROQ_API_KEY;

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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt.trim() }],
        temperature: 0.7,
      }),
    });

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

export default verifyAuth(rateLimiter(10)(handler));
