/**
 * ============================================================================
 * Eventra Platform - Enterprise AI Recommendation Engine
 * File: api/recommendations.js
 * 
 * Description:
 *   Serverless backend endpoint for AI-powered event recommendations.
 *   Secures the Groq API key, enforces rate limits, screens prompts for
 *   injection attacks, enriches prompts with platform event context (RAG),
 *   executes resilient API calls with exponential backoff & model failover,
 *   and provides structured logging and schema validation.
 * ============================================================================
 */

import { verifyAuth } from "./middleware/auth.js";
import { buildCorsHeaders } from "./auth/cors.js";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

/** Security & Token Guardrails */
const SECURITY_CONFIG = {
  MAX_PROMPT_LENGTH: 2000,
  MIN_PROMPT_LENGTH: 3,
  MAX_ESTIMATED_TOKENS: 600,
  CHARS_PER_TOKEN_ESTIMATE: 4,
  REQUEST_TIMEOUT_MS: 12000,
};

/** AI Models & Gateway Hierarchy */
const MODEL_CONFIG = {
  PRIMARY_MODEL: "llama-3.1-8b-instant",
  FALLBACK_MODEL: "llama-3.1-70b-versatile",
  DEFAULT_TEMPERATURE: 0.6,
  MAX_TOKENS: 1024,
  MAX_RETRIES: 2,
};

/** Rate Limiter Settings */
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute sliding window
  MAX_REQUESTS: 10,     // Max 10 requests per window per user
};

/** High-risk regex patterns for detecting prompt injection and jailbreak attempts */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+instructions/i,
  /you\s+are\s+now\s+a/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /jailbreak/i,
  /override\s+your\s+rules/i,
  /developer\s+mode/i,
  /act\s+as\s+an?\s+unrestricted/i,
  /dan\s+mode/i,
  /bypass\s+safety/i,
  /reveal\s+your\s+(system\s+)?prompt/i,
];

/** Baseline system prompt establishing operating domain and guardrails */
const SYSTEM_PROMPT_BASE =
  "You are an event recommendation assistant for the Eventra platform. " +
  "Your only job is to help users discover, filter, and compare events " +
  "based on their interests, schedule, and preferences. " +
  "Always respond in the context of event recommendations. " +
  "If a request is unrelated to finding or comparing events, politely decline " +
  "and redirect the user to ask an event-related question instead. " +
  "Never generate code, write documents, answer general knowledge questions, " +
  "or fulfill any request that is not directly about helping users with events on Eventra.";


// ============================================================================
// 2. EMBEDDED PLATFORM EVENT CATALOG (FOR MICRO-RAG CONTEXT INJECTION)
// ============================================================================

/**
 * Platform event catalog used to ground AI responses in real, available events.
 */
const EVENTRA_EVENT_CATALOG = [
  {
    id: "evt_101",
    title: "Global Tech Summit 2026",
    category: "Technology",
    date: "2026-09-15",
    location: "San Francisco, CA / Hybrid",
    price: "$299",
    tags: ["tech", "ai", "startups", "software", "networking"],
    description: "Keynotes on artificial intelligence, cloud architecture, and developer tools.",
  },
  {
    id: "evt_102",
    title: "Indie Sound Wave Music Festival",
    category: "Music",
    date: "2026-08-28",
    location: "Austin, TX",
    price: "$85",
    tags: ["music", "concert", "live", "indie", "rock", "outdoor"],
    description: "Multi-stage music festival featuring emerging indie and alternative bands.",
  },
  {
    id: "evt_103",
    title: "Artisanal Food & Craft Beer Expo",
    category: "Food & Drink",
    date: "2026-10-05",
    location: "Chicago, IL",
    price: "$45",
    tags: ["food", "beer", "tasting", "culinary", "craft", "wine"],
    description: "Tasting sessions with regional craft breweries and culinary masterclasses.",
  },
  {
    id: "evt_104",
    title: "Sustainable Architecture & Urban Design Forum",
    category: "Design",
    date: "2026-09-02",
    location: "Online / Virtual",
    price: "Free",
    tags: ["design", "green", "architecture", "sustainability", "webinar"],
    description: "Virtual panel on sustainable building materials and net-zero urban development.",
  },
  {
    id: "evt_105",
    title: "Marathon & Health Expo 2026",
    category: "Sports & Fitness",
    date: "2026-11-12",
    location: "New York, NY",
    price: "$60",
    tags: ["sports", "fitness", "running", "marathon", "health", "wellness"],
    description: "Annual marathon registration, fitness gear showcases, and nutrition workshops.",
  },
  {
    id: "evt_106",
    title: "Startup Pitch Night & Investor Mixer",
    category: "Business",
    date: "2026-08-30",
    location: "Boston, MA",
    price: "$20",
    tags: ["business", "finance", "startup", "investors", "pitch", "venture"],
    description: "Early-stage founders pitch to angel investors followed by open networking.",
  },
];


// ============================================================================
// 3. SECURITY & INPUT SANITIZATION SUITE
// ============================================================================

class SecurityGuard {
  /**
   * Cleans input string by removing non-printable Unicode and ASCII control characters.
   * @param {string} input 
   * @returns {string} Sanitized text string
   */
  static sanitizeText(input) {
    if (typeof input !== "string") return "";
    return input
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width non-joiners/spaces
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove non-printable control characters
      .trim();
  }

  /**
   * Scans input against known prompt injection and jailbreak regex heuristics.
   * @param {string} prompt 
   * @returns {{ safe: boolean, patternMatched?: string }}
   */
  static detectInjection(prompt) {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        return {
          safe: false,
          patternMatched: pattern.source,
        };
      }
    }
    return { safe: true };
  }

  /**
   * Estimates token length based on character density.
   * @param {string} text 
   * @returns {number} Estimated token count
   */
  static estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / SECURITY_CONFIG.CHARS_PER_TOKEN_ESTIMATE);
  }

  /**
   * Complete validation pipeline for incoming user prompts.
   * @param {unknown} rawPrompt 
   * @returns {{ valid: boolean, error?: string, sanitized?: string }}
   */
  static validateUserPrompt(rawPrompt) {
    if (!rawPrompt || typeof rawPrompt !== "string") {
      return { valid: false, error: "Prompt is required and must be a string." };
    }

    const sanitized = this.sanitizeText(rawPrompt);

    if (sanitized.length < SECURITY_CONFIG.MIN_PROMPT_LENGTH) {
      return { valid: false, error: "Prompt is too short to generate recommendations." };
    }

    if (sanitized.length > SECURITY_CONFIG.MAX_PROMPT_LENGTH) {
      return {
        valid: false,
        error: `Prompt must not exceed ${SECURITY_CONFIG.MAX_PROMPT_LENGTH} characters.`,
      };
    }

    const injectionCheck = this.detectInjection(sanitized);
    if (!injectionCheck.safe) {
      return {
        valid: false,
        error: "Prompt contains restricted phrases or instructions.",
      };
    }

    const estimatedTokens = this.estimateTokens(sanitized);
    if (estimatedTokens > SECURITY_CONFIG.MAX_ESTIMATED_TOKENS) {
      return {
        valid: false,
        error: "Prompt complexity exceeds token limits.",
      };
    }

    return { valid: true, sanitized };
  }
}


// ============================================================================
// 4. ADVANCED IN-MEMORY SLIDING WINDOW RATE LIMITER
// ============================================================================

class SlidingWindowRateLimiter {
  constructor(windowMs = RATE_LIMIT_CONFIG.WINDOW_MS, maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();

    // Periodically prune stale entries to prevent memory leaks in warm serverless containers
    this.cleanupInterval = setInterval(() => this.pruneStaleEntries(), this.windowMs);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Evaluates request allowance for a given key.
   * @param {string} key Unique identifier (e.g., user ID or IP)
   * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
   */
  check(key) {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];

    // Retain only timestamps within the active sliding window
    const activeTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

    if (activeTimestamps.length >= this.maxRequests) {
      const oldestTs = activeTimestamps[0];
      const resetMs = oldestTs + this.windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(0, resetMs),
      };
    }

    activeTimestamps.push(now);
    this.store.set(key, activeTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - activeTimestamps.length,
      resetMs: this.windowMs,
    };
  }

  /**
   * Removes keys with no active timestamps.
   */
  pruneStaleEntries() {
    const now = Date.now();
    for (const [key, timestamps] of this.store.entries()) {
      const valid = timestamps.filter((ts) => now - ts < this.windowMs);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, valid);
      }
    }
  }
}

// Global instance retained across warm serverless invocations
const globalRateLimiter = new SlidingWindowRateLimiter();


// ============================================================================
// 5. CONTEXT RETRIEVAL & PROMPT AUGMENTATION (MICRO-RAG)
// ============================================================================

class EventContextEngine {
  /**
   * Matches user prompt against catalog tags and text to locate relevant events.
   * @param {string} userPrompt 
   * @returns {Array<Object>} Relevant event objects
   */
  static retrieveContextEvents(userPrompt) {
    const queryTokens = userPrompt.toLowerCase().split(/\s+/);

    const scoredEvents = EVENTRA_EVENT_CATALOG.map((event) => {
      let score = 0;
      const searchableText = `${event.title} ${event.category} ${event.tags.join(" ")} ${event.description}`.toLowerCase();

      for (const token of queryTokens) {
        if (token.length < 3) continue; // Skip trivial words
        if (event.tags.includes(token)) score += 3;
        if (event.category.toLowerCase().includes(token)) score += 2;
        if (searchableText.includes(token)) score += 1;
      }

      return { event, score };
    });

    // Sort by relevance score
    scoredEvents.sort((a, b) => b.score - a.score);

    // Return top matching events, or a general default sample if no strong match
    const matches = scoredEvents.filter((item) => item.score > 0).map((item) => item.event);
    return matches.length > 0 ? matches.slice(0, 3) : EVENTRA_EVENT_CATALOG.slice(0, 2);
  }

  /**
   * Builds systemic prompt with grounded event context injected.
   * @param {Array<Object>} relevantEvents 
   * @returns {string} Enriched system prompt
   */
  static buildAugmentedSystemPrompt(relevantEvents) {
    if (!relevantEvents || relevantEvents.length === 0) {
      return SYSTEM_PROMPT_BASE;
    }

    const eventListString = relevantEvents
      .map(
        (e) =>
          `- [ID: ${e.id}] "${e.title}" | Category: ${e.category} | Date: ${e.date} | Location: ${e.location} | Price: ${e.price}\n  Details: ${e.description}`
      )
      .join("\n");

    return (
      `${SYSTEM_PROMPT_BASE}\n\n` +
      `GROUND TRUTH EVENTRA CATALOG CONTEXT:\n` +
      `Use these real platform events to ground your recommendations whenever relevant to the user's request:\n` +
      `${eventListString}\n\n` +
      `Guidelines for using context:\n` +
      `1. Prefer recommending events from the list above when they match user intent.\n` +
      `2. Include exact titles, dates, locations, and prices when referencing them.\n` +
      `3. If no catalog events fit, clearly suggest what parameters the user might adjust.`
    );
  }
}


// ============================================================================
// 6. RESILIENT GROQ CLIENT GATEWAY (TIMEOUTS, RETRIES & FAILOVER)
// ============================================================================

class GroqClientError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "GroqClientError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Executes fetch with a hard timeout trigger via AbortController.
 */
async function fetchWithTimeout(resource, options = {}, timeoutMs = SECURITY_CONFIG.REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new GroqClientError(`Gateway request timed out after ${timeoutMs}ms`, 504);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Helper for exponential backoff delays */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends chat completion payload to Groq with retry logic and fallback models.
 */
async function dispatchGroqCompletion({ apiKey, systemPrompt, userPrompt }) {
  let attempt = 0;
  let activeModel = MODEL_CONFIG.PRIMARY_MODEL;
  let lastError = null;

  while (attempt <= MODEL_CONFIG.MAX_RETRIES) {
    try {
      const payload = {
        model: activeModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: MODEL_CONFIG.MAX_TOKENS,
      };

      const response = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        SECURITY_CONFIG.REQUEST_TIMEOUT_MS
      );

      const responseData = await response.json();

      if (!response.ok) {
        // If rate limited (429) or remote server error (5xx), attempt retry with fallback model
        if ([429, 500, 502, 503].includes(response.status) && attempt < MODEL_CONFIG.MAX_RETRIES) {
          console.warn(
            `[Groq API Gateway] Attempt ${attempt + 1} failed with status ${response.status}. Switching model to ${MODEL_CONFIG.FALLBACK_MODEL}...`
          );
          activeModel = MODEL_CONFIG.FALLBACK_MODEL;
          attempt++;
          await delay(Math.pow(2, attempt) * 400); // 800ms, 1600ms backoff
          continue;
        }

        throw new GroqClientError(
          responseData.error?.message || "Groq API request failed.",
          response.status,
          responseData
        );
      }

      return {
        data: responseData,
        modelUsed: activeModel,
        attemptsCount: attempt + 1,
      };
    } catch (err) {
      lastError = err;

      if (err instanceof GroqClientError && err.status < 500 && err.status !== 429) {
        // Non-retryable client error (e.g. 400 Bad Request)
        throw err;
      }

      if (attempt < MODEL_CONFIG.MAX_RETRIES) {
        attempt++;
        activeModel = MODEL_CONFIG.FALLBACK_MODEL;
        await delay(Math.pow(2, attempt) * 400);
        continue;
      }

      break;
    }
  }

  if (lastError instanceof GroqClientError) {
    throw lastError;
  }

  throw new GroqClientError(
    lastError?.message || "AI service temporarily unavailable after retries.",
    503
  );
}


// ============================================================================
// 7. TELEMETRY & AUDIT LOGGING
// ============================================================================

class TelemetryLogger {
  /**
   * Logs structured operational telemetry for log aggregators (CloudWatch, Datadog).
   * @param {string} event 
   * @param {Object} details 
   */
  static info(event, details = {}) {
    const logItem = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      event,
      ...details,
    };
    console.log(JSON.stringify(logItem));
  }

  static error(event, errorObj, details = {}) {
    const logItem = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      event,
      error: {
        name: errorObj.name || "Error",
        message: errorObj.message || "Unknown error",
        status: errorObj.status || 500,
      },
      ...details,
    };
    console.error(JSON.stringify(logItem));
  }
}


// ============================================================================
// 8. MAIN SERVERLESS REQUEST HANDLER
// ============================================================================

/**
 * Main HTTP Handler function.
 * Expects to be wrapped by verifyAuth middleware.
 * 
 * @param {Object} req - Incoming Node/Vercel request
 * @param {Object} res - Outgoing response handle
 */
async function handler(req, res) {
  const startTime = Date.now();

  // --- CORS Header Management ---
  const corsHeaders = buildCorsHeaders(req);
  res.setHeader("Access-Control-Allow-Origin", corsHeaders["Access-Control-Allow-Origin"] || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Authorization"
  );
  res.setHeader("Vary", "Origin");

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Enforce HTTP POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Recommendations endpoint requires POST.",
    });
  }

  // --- User Identity & Rate Limiting ---
  const userId = req.user?.id || req.user?.email || "anonymous_authenticated_user";

  const rateCheck = globalRateLimiter.check(userId);
  res.setHeader("X-RateLimit-Remaining", rateCheck.remaining);

  if (!rateCheck.allowed) {
    TelemetryLogger.info("RATE_LIMIT_EXCEEDED", { userId });
    return res.status(429).json({
      error: "Too many requests. Please wait before asking for more event recommendations.",
      retryAfterMs: rateCheck.resetMs,
    });
  }

  // --- API Key Verification ---
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    TelemetryLogger.error("CONFIG_ERROR", new Error("GROQ_API_KEY environment variable missing."));
    return res.status(500).json({
      error: "Server configuration issue: AI service key not configured.",
    });
  }

  // --- Input Extraction & Security Screening ---
  const rawPrompt = req.body?.prompt;
  const validationResult = SecurityGuard.validateUserPrompt(rawPrompt);

  if (!validationResult.valid) {
    TelemetryLogger.info("INVALID_INPUT_REJECTED", {
      userId,
      reason: validationResult.error,
    });
    return res.status(400).json({ error: validationResult.error });
  }

  const cleanPrompt = validationResult.sanitized;

  try {
    // --- RAG Context Ingestion ---
    const contextEvents = EventContextEngine.retrieveContextEvents(cleanPrompt);
    const augmentedSystemPrompt = EventContextEngine.buildAugmentedSystemPrompt(contextEvents);

    // --- Dispatch Completion Request ---
    const completionResult = await dispatchGroqCompletion({
      apiKey,
      systemPrompt: augmentedSystemPrompt,
      userPrompt: cleanPrompt,
    });

    const durationMs = Date.now() - startTime;

    TelemetryLogger.info("RECOMMENDATION_SUCCESS", {
      userId,
      durationMs,
      modelUsed: completionResult.modelUsed,
      attempts: completionResult.attemptsCount,
      usage: completionResult.data?.usage || null,
      contextEventsInjected: contextEvents.length,
    });

    // --- Return Structured Payload ---
    return res.status(200).json({
      success: true,
      data: completionResult.data,
      meta: {
        latencyMs: durationMs,
        model: completionResult.modelUsed,
        groundedEvents: contextEvents.map((e) => e.id),
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    TelemetryLogger.error("RECOMMENDATION_REQUEST_FAILED", error, { userId, durationMs });

    if (error instanceof GroqClientError) {
      return res.status(error.status).json({
        error: "AI recommendation service error.",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "An internal server error occurred while processing recommendations.",
    });
  }
}

// Wrap handler with authentication verification middleware
export default verifyAuth(handler);