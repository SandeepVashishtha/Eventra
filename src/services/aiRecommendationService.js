import { apiUtils } from "../config/api";

// ============================================================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ============================================================================

const CACHE_TTL_MS = 1000 * 60 * 15; // 15 Minutes Cache
const memoryCache = new Map();

class CircuitBreaker {
  constructor(threshold = 3, cooldownMs = 30000) {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
  }

  isOpen() {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.reset();
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

// Deterministic fast hashing for cache lookup
const generateHashKey = (event = {}, profile = {}) => {
  const eventId = event.id || event.title || "unknown_event";
  const profileId = profile.id || "anonymous";
  const interests = Array.isArray(profile.interests) ? profile.interests.join(",") : "";
  const techStack = Array.isArray(profile.techStack) ? profile.techStack.join(",") : "";

  const rawKey = `${eventId}_${profileId}_${interests}_${techStack}`;
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = (hash << 5) - hash + rawKey.charCodeAt(i);
    hash |= 0;
  }
  return `rec_cache_${hash}`;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// 2. PARSING & CLEANING HELPERS
// ============================================================================

/**
 * Strips markdown code fences (```json) if returned by LLM
 */
const cleanAIContent = (rawContent) => {
  if (typeof rawContent !== "string") return "";
  return rawContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
};

/**
 * Parses raw LLM content into clean bullet points
 */
const parseAIResponseToBullets = (rawContent) => {
  const cleaned = cleanAIContent(rawContent);

  // Attempt 1: Parse JSON payload if AI responded in JSON
  try {
    const parsed = JSON.parse(cleaned);
    const list = parsed.bullets || parsed.points || (Array.isArray(parsed) ? parsed : null);
    if (Array.isArray(list) && list.length > 0) {
      return list.slice(0, 3).map((item) => `- ${String(item).replace(/^[-*•\d.\s]+/, "")}`);
    }
  } catch (e) {
    // Not JSON, continue to text parsing
  }

  // Attempt 2: Plain text string processing
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const bullets = lines
    .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
    .filter((line) => line.length > 5)
    .slice(0, 3);

  if (bullets.length > 0) {
    return bullets.map((b) => `- ${b}`);
  }

  // Generic fallback if LLM returned garbage
  return [
    "- Directly aligns with your stated skills and developer interests.",
    "- Great opportunity to gain hands-on experience in this domain.",
    "- Difficulty level matches your current background profile.",
  ];
};

// ============================================================================
// 3. LOCAL HEURISTIC ENGINE (OFFLINE FALLBACK)
// ============================================================================

/**
 * Generates recommendation bullets locally if the AI service is offline or timing out
 */
const generateLocalFallbackInsights = (event = {}, profile = {}) => {
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const techStack = Array.isArray(profile.techStack) ? profile.techStack : [];

  const userTokens = new Set(
    [...interests, ...techStack].map((s) => String(s).toLowerCase().trim())
  );

  const eventText = `${event.title || ""} ${event.category || ""} ${event.description || ""}`.toLowerCase();

  const matchedTokens = [];
  userTokens.forEach((token) => {
    if (token && eventText.includes(token)) {
      matchedTokens.push(token);
    }
  });

  const bullets = [];

  if (matchedTokens.length > 0) {
    const topicList = matchedTokens.slice(0, 3).join(", ");
    bullets.push(`- Direct match with your profile interests in **${topicList}**.`);
  } else {
    bullets.push(`- Great event to explore new concepts in **${event.category || "technology"}**.`);
  }

  if (Array.isArray(profile.eventTypes) && profile.eventTypes.length > 0) {
    bullets.push(`- Fits your preferred event format (${profile.eventTypes.slice(0, 2).join(", ")}).`);
  } else {
    bullets.push(`- Interactive structure suited for practical developer learning.`);
  }

  const level = profile.level || "all skill";
  bullets.push(`- Tailored pace and topic depth for **${level}** level experience.`);

  return bullets.join("\n");
};

// ============================================================================
// 4. MAIN PUBLIC API
// ============================================================================

/**
 * Generates personalized AI event recommendations.
 * Guaranteed to return a formatted string compatible with React UI rendering.
 *
 * @param {Object} event - Event details object
 * @param {Object} profile - User profile object
 * @param {Object} [options] - Optional settings (e.g. { bypassCache: true })
 * @returns {Promise<string>} Formatted bullet points string
 */
export const generateAIInsights = async (event = {}, profile = {}, options = {}) => {
  const cacheKey = generateHashKey(event, profile);

  // 1. Check In-Memory Cache
  if (!options.bypassCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // 2. Check Circuit Breaker State
  if (circuitBreaker.isOpen()) {
    console.warn("[aiRecommendationService] Circuit breaker active. Serving local fallback.");
    return generateLocalFallbackInsights(event, profile);
  }

  // 3. Construct Safe Prompt
  const formattedInterests = Array.isArray(profile.interests) && profile.interests.length
    ? profile.interests.join(", ")
    : "None specified";

  const formattedTechStack = Array.isArray(profile.techStack) && profile.techStack.length
    ? profile.techStack.join(", ")
    : "None specified";

  const formattedEventTypes = Array.isArray(profile.eventTypes) && profile.eventTypes.length
    ? profile.eventTypes.join(", ")
    : "Any";

  const prompt = `
You are an AI event recommendation assistant.

User Profile:
- Interests: ${formattedInterests}
- Tech Stack: ${formattedTechStack}
- Preferred Event Type: ${formattedEventTypes}
- Skill Level: ${profile.level || "Not specified"}

Event:
- Title: ${event.title || "Unknown"}
- Category: ${event.category || "General"}
- Description: ${event.description || "No description available"}

Explain in 3 concise bullet points why this event matches the user.
`;

  // 4. Execute API Request with Exponential Retries
  let retries = 2;
  let delay = 500;

  while (retries >= 0) {
    try {
      const response = await apiUtils.post("/api/ai-recommendations", { prompt });

      // Support both raw Fetch Response objects and pre-parsed Axios/wrapper outputs
      let data;
      if (response && typeof response.json === "function") {
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        data = await response.json();
      } else {
        data = response;
      }

      const rawContent = data?.choices?.[0]?.message?.content || data?.result || data?.content;

      if (!rawContent) {
        throw new Error("Empty AI response payload");
      }

      const bullets = parseAIResponseToBullets(rawContent);
      const resultString = bullets.join("\n");

      // Record Success & Cache
      circuitBreaker.recordSuccess();
      memoryCache.set(cacheKey, { data: resultString, timestamp: Date.now() });

      return resultString;

    } catch (error) {
      retries--;
      if (retries < 0) {
        console.error("[aiRecommendationService] Retries exhausted. Triggering fallback.", error);
        circuitBreaker.recordFailure();
        break;
      }
      await wait(delay);
      delay *= 2; // Exponential backoff
    }
  }

  // 5. Offline Heuristic Fallback on Failure
  return generateLocalFallbackInsights(event, profile);
};

/**
 * Utility to clear recommendation cache on user logout or profile update
 */
export const clearRecommendationCache = () => {
  memoryCache.clear();
};