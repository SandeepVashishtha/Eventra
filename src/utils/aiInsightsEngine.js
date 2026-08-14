/**
 * Enterprise Hybrid AI Event Recommendation Engine
 * 
 * A multi-tiered recommendation engine with:
 * - Deterministically Hash-Based In-Memory & Storage Cache
 * - Offline Local Heuristic Engine (Jaccard similarity & keyword overlap)
 * - Circuit Breaker & Retries with exponential backoff
 * - Structured Output Parser for JSON/markdown with fallbacks
 * - Telemetry & Latency Tracking
 * - AbortController Support
 * 
 * @module aiInsightsEngine
 */

import { logger } from "./logger.js";
import { fetchWithTimeout, TimeoutError, NetworkError, FetchError } from "./fetchWithTimeout.js";
import { calculateRecommendationScore, buildInteractionProfile, getEventTags, getEventCategory, getEventType, normalizeText, toTokens } from "./recommendationEngine.js";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_AI_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of consecutive failures to trip circuit
const CIRCUIT_BREAKER_RESET_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 500;
const MIN_SCORE_THRESHOLD = 25; // Minimum score for local fallback recommendations

// ============================================================================
// 2. CACHE IMPLEMENTATION
// ============================================================================

/**
 * Simple hash function for cache keys
 * Creates deterministic hash from event ID and profile hash
 */
const createCacheKey = (eventId, profileHash) => {
  const keyString = `${eventId}:${profileHash}`;
  // Simple but effective hash function
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    const char = keyString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ai_insights_${hash}_${keyString.length}`;
};

/**
 * Profile hashing utility - creates a stable hash from user profile data
 */
export const createProfileHash = (profile = {}) => {
  const profileString = JSON.stringify({
    interests: profile.interests,
    skills: profile.skills,
    eventTypes: profile.eventTypes,
    level: profile.level,
    categories: profile.categories,
    location: profile.location,
  });
  
  // Use crypto API if available, fallback to simple hash
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(profileString);
      const hashBuffer = crypto.subtle.digest('SHA-256', data);
      return hashBuffer.then(buf => {
        const hashArray = Array.from(new Uint8Array(buf));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      });
    } catch (e) {
      // Fallback to simple hash
    }
  }
  
  // Simple hash fallback
  let hash = 0;
  for (let i = 0; i < profileString.length; i++) {
    const char = profileString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Promise.resolve(hash.toString(16));
};

/**
 * In-memory cache for AI insights
 */
const _insightsCache = new Map();
const _cacheOrder = [];

/**
 * Storage cache using localStorage when available
 */
const _storageCache = {
  get: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Storage cache read failed:', e);
    }
    return null;
  },
  
  set: (key, value, ttl) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const cacheItem = {
          data: value,
          timestamp: Date.now(),
          ttl: ttl
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
        return true;
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Storage cache write failed:', e);
    }
    return false;
  },
  
  remove: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Storage cache remove failed:', e);
    }
    return false;
  },
  
  clear: () => {
    try {
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ai_insights_')) {
            localStorage.removeItem(key);
          }
        });
        return true;
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Storage cache clear failed:', e);
    }
    return false;
  }
};

/**
 * Get cached insights for event/profile combination
 */
const _getCachedInsights = async (eventId, profileHash) => {
  const cacheKey = createCacheKey(eventId, profileHash);
  
  // Check in-memory cache first
  const memoryCache = _insightsCache.get(cacheKey);
  if (memoryCache && Date.now() - memoryCache.cachedAt <= CACHE_TTL_MS) {
    // Move to end of LRU order
    const idx = _cacheOrder.indexOf(cacheKey);
    if (idx > -1) {
      _cacheOrder.splice(idx, 1);
    }
    _cacheOrder.push(cacheKey);
    
    logger.info(`[AIInsightsEngine] Cache hit for ${eventId}:${profileHash}`);
    return memoryCache.data;
  }
  
  // Check storage cache
  const storageItem = _storageCache.get(cacheKey);
  if (storageItem && Date.now() - storageItem.timestamp <= STORAGE_CACHE_TTL_MS) {
    // Update in-memory cache
    _insightsCache.set(cacheKey, {
      data: storageItem.data,
      cachedAt: Date.now()
    });
    _cacheOrder.push(cacheKey);
    
    // Enforce memory cache size limit
    if (_cacheOrder.length > MAX_CACHE_SIZE) {
      const oldest = _cacheOrder.shift();
      _insightsCache.delete(oldest);
    }
    
    logger.info(`[AIInsightsEngine] Storage cache hit for ${eventId}:${profileHash}`);
    return storageItem.data;
  }
  
  return null;
};

/**
 * Store insights in cache
 */
const _cacheInsights = async (eventId, profileHash, insights) => {
  const cacheKey = createCacheKey(eventId, profileHash);
  
  // Store in memory cache
  _insightsCache.set(cacheKey, {
    data: insights,
    cachedAt: Date.now()
  });
  
  // Update LRU order
  const idx = _cacheOrder.indexOf(cacheKey);
  if (idx > -1) {
    _cacheOrder.splice(idx, 1);
  }
  _cacheOrder.push(cacheKey);
  
  // Enforce memory cache size limit
  if (_cacheOrder.length > MAX_CACHE_SIZE) {
    const oldest = _cacheOrder.shift();
    _insightsCache.delete(oldest);
  }
  
  // Store in persistent storage
  try {
    _storageCache.set(cacheKey, insights, STORAGE_CACHE_TTL_MS);
  } catch (e) {
    logger.warn('[AIInsightsEngine] Failed to persist to storage cache:', e);
  }
  
  logger.info(`[AIInsightsEngine] Cached insights for ${eventId}:${profileHash}`);
};

/**
 * Clear all caches
 */
export const clearAICache = () => {
  _insightsCache.clear();
  _cacheOrder.length = 0;
  _storageCache.clear();
  logger.info('[AIInsightsEngine] All AI insights caches cleared');
};

// ============================================================================
// 3. CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
  constructor(
    threshold = CIRCUIT_BREAKER_THRESHOLD,
    resetTimeout = CIRCUIT_BREAKER_RESET_MS
  ) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      logger.warn(`[AIInsightsEngine] Circuit breaker tripped after ${this.failureCount} consecutive failures`);
    }
  }

  canExecute() {
    if (this.state === 'CLOSED') {
      return true;
    }
    
    if (this.state === 'OPEN') {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state - allow one request through
    return true;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      timeUntilReset: this.state === 'OPEN' 
        ? Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime))
        : 0
    };
  }
}

// Global circuit breaker for AI service
const _aiServiceCircuitBreaker = new CircuitBreaker();

// ============================================================================
// 4. TELEMETRY & METRICS
// ============================================================================

class TelemetryCollector {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      aiSuccesses: 0,
      aiFailures: 0,
      fallbackInvocations: 0,
      totalLatency: 0,
      maxLatency: 0,
      minLatency: Infinity,
      latencies: [],
    };
  }

  recordRequest(startTime, result) {
    const latency = Date.now() - startTime;
    this.metrics.totalRequests++;
    this.metrics.totalLatency += latency;
    this.metrics.latencies.push(latency);
    
    if (latency > this.metrics.maxLatency) {
      this.metrics.maxLatency = latency;
    }
    if (latency < this.metrics.minLatency) {
      this.metrics.minLatency = latency;
    }

    // Keep only last 1000 latencies for memory efficiency
    if (this.metrics.latencies.length > 1000) {
      this.metrics.latencies.shift();
    }
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordAISuccess() {
    this.metrics.aiSuccesses++;
  }

  recordAIFailure() {
    this.metrics.aiFailures++;
  }

  recordFallback() {
    this.metrics.fallbackInvocations++;
  }

  getMetrics() {
    const avgLatency = this.metrics.totalRequests > 0 
      ? this.metrics.totalLatency / this.metrics.totalRequests 
      : 0;
    
    return {
      ...this.metrics,
      averageLatency: avgLatency,
      cacheHitRate: this.metrics.totalRequests > 0 
        ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
        : 0,
      aiSuccessRate: (this.metrics.aiSuccesses + this.metrics.aiFailures) > 0
        ? (this.metrics.aiSuccesses / (this.metrics.aiSuccesses + this.metrics.aiFailures)) * 100
        : 0,
      fallbackRate: this.metrics.totalRequests > 0
        ? (this.metrics.fallbackInvocations / this.metrics.totalRequests) * 100
        : 0,
    };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    logger.info('[AIInsightsEngine] Metrics:', {
      totalRequests: metrics.totalRequests,
      cacheHits: metrics.cacheHits,
      cacheMisses: metrics.cacheMisses,
      cacheHitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
      aiSuccesses: metrics.aiSuccesses,
      aiFailures: metrics.aiFailures,
      aiSuccessRate: `${metrics.aiSuccessRate.toFixed(1)}%`,
      fallbackInvocations: metrics.fallbackInvocations,
      fallbackRate: `${metrics.fallbackRate.toFixed(1)}%`,
      averageLatency: `${metrics.averageLatency.toFixed(0)}ms`,
      minLatency: `${metrics.minLatency === Infinity ? 0 : metrics.minLatency}ms`,
      maxLatency: `${metrics.maxLatency}ms`,
    });
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      aiSuccesses: 0,
      aiFailures: 0,
      fallbackInvocations: 0,
      totalLatency: 0,
      maxLatency: 0,
      minLatency: Infinity,
      latencies: [],
    };
  }
}

const _telemetry = new TelemetryCollector();

/**
 * Get current telemetry metrics
 */
export const getAITelemetry = () => _telemetry.getMetrics();

/**
 * Log current telemetry metrics
 */
export const logAITelemetry = () => _telemetry.logMetrics();

/**
 * Reset telemetry metrics
 */
export const resetAITelemetry = () => _telemetry.reset();

// ============================================================================
// 5. OFFLINE LOCAL HEURISTIC ENGINE
// ============================================================================

/**
 * Calculate Jaccard similarity between two sets
 */
const _calculateJaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return 0;
  
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
};

/**
 * Extract keywords from text using existing tokenization
 */
const _extractKeywords = (text) => {
  return toTokens(text);
};

/**
 * Calculate keyword overlap score
 */
const _calculateKeywordOverlapScore = (eventTexts, profileKeywords) => {
  if (profileKeywords.length === 0) return 0;
  
  const profileKeywordSet = new Set(profileKeywords.map(k => k.toLowerCase()));
  
  let totalScore = 0;
  let keywordCount = 0;
  
  for (const text of eventTexts) {
    const textKeywords = _extractKeywords(text);
    keywordCount += textKeywords.length;
    
    for (const keyword of textKeywords) {
      if (profileKeywordSet.has(keyword)) {
        totalScore += 1;
      }
    }
  }
  
  return keywordCount > 0 ? totalScore / keywordCount : 0;
};

/**
 * Local heuristic engine for offline fallback
 * Calculates insights based on event data and user profile
 */
const _generateLocalInsights = (event, profile = {}, interactionProfile = {}) => {
  const startTime = Date.now();
  
  try {
    const eventTags = getEventTags(event);
    const eventCategory = getEventCategory(event);
    const eventType = getEventType(event);
    
    // Extract profile keywords
    const profileInterests = normalizeText(profile.interests || '');
    const profileSkills = normalizeText(profile.skills || '');
    const profileEventTypes = normalizeText(profile.eventTypes || '');
    const profileLevel = normalizeText(profile.level || '');
    
    const profileKeywords = [
      ..._extractKeywords(profileInterests),
      ..._extractKeywords(profileSkills),
      ..._extractKeywords(profileEventTypes),
      ..._extractKeywords(profileLevel),
    ].filter(Boolean);
    
    // Extract event text for keyword matching
    const eventTexts = [
      event.title || '',
      event.description || '',
      event.category || '',
      event.type || '',
      ...(event.tags || []),
      ...(event.techStack || []),
    ].filter(Boolean);
    
    // Calculate similarity scores
    const eventKeywordSet = new Set(eventTags);
    const profileInterestSet = new Set(_extractKeywords(profileInterests));
    
    const categoryMatch = profileInterests.includes(eventCategory) ? 0.3 : 0;
    const typeMatch = profileEventTypes.includes(eventType) ? 0.2 : 0;
    const jaccardSimilarity = _calculateJaccardSimilarity(eventKeywordSet, profileInterestSet);
    const keywordOverlap = _calculateKeywordOverlapScore(eventTexts, profileKeywords);
    
    // Calculate interaction-based scores
    let interactionScore = 0;
    if (interactionProfile.interactedEvents) {
      const similarityScore = calculateRecommendationScore(
        event, 
        profile, 
        interactionProfile
      ).score / 100; // Normalize to 0-1 range
      interactionScore = similarityScore;
    }
    
    // Weighted overall score (0-1 range)
    const overallScore = (
      categoryMatch * 0.25 +
      typeMatch * 0.15 +
      jaccardSimilarity * 0.25 +
      keywordOverlap * 0.20 +
      interactionScore * 0.15
    );
    
    // Generate insights based on scores
    const insights = {
      score: Math.min(Math.round(overallScore * 100), 100),
      confidence: Math.min(overallScore * 0.8 + 0.2, 1.0), // Slightly lower confidence for local
      fallback: true,
      source: 'local_heuristic',
      reasons: [],
      recommendations: [],
      metadata: {
        calculationTime: Date.now() - startTime,
        categoryMatch,
        typeMatch,
        jaccardSimilarity,
        keywordOverlap,
        interactionScore,
      },
    };
    
    // Add reasons based on matches
    if (categoryMatch > 0) {
      insights.reasons.push(`Matches your interest in ${eventCategory}`);
    }
    if (typeMatch > 0) {
      insights.reasons.push(`Fits your preferred event type: ${eventType}`);
    }
    if (jaccardSimilarity > 0.3) {
      insights.reasons.push(`High similarity to your interests (${Math.round(jaccardSimilarity * 100)}% tag overlap)`);
    }
    if (keywordOverlap > 0.2) {
      insights.reasons.push(`Contains keywords relevant to your profile (${Math.round(keywordOverlap * 100)}% overlap)`);
    }
    
    // Generate recommendations
    if (insights.score >= 70) {
      insights.recommendations.push('Strong match - highly recommended based on your profile');
    } else if (insights.score >= 50) {
      insights.recommendations.push('Good match - aligns well with your interests');
    } else if (insights.score >= MIN_SCORE_THRESHOLD) {
      insights.recommendations.push('Potential match - worth considering');
    }
    
    // Add suggestions for improvement if score is low
    if (insights.score < MIN_SCORE_THRESHOLD) {
      insights.recommendations.push('Consider updating your profile for better recommendations');
    }
    
    logger.info(`[AIInsightsEngine] Local heuristic generated insights with score ${insights.score}`);
    
    return insights;
    
  } catch (error) {
    logger.error('[AIInsightsEngine] Error in local heuristic engine:', error);
    
    // Return minimal fallback
    return {
      score: 0,
      confidence: 0,
      fallback: true,
      source: 'local_heuristic',
      reasons: ['Unable to calculate local insights'],
      recommendations: ['Please try again or update your profile'],
      metadata: { calculationTime: Date.now() - startTime, error: error.message },
    };
  }
};

// ============================================================================
// 6. STRUCTURED OUTPUT PARSER
// ============================================================================

/**
 * Expected schema for AI insights
 */
const AI_INSIGHT_SCHEMA = {
  score: { type: 'number', min: 0, max: 100, required: true },
  confidence: { type: 'number', min: 0, max: 1, required: true },
  reasons: { type: 'array', items: 'string', required: true },
  recommendations: { type: 'array', items: 'string', required: true },
  metadata: { type: 'object', required: false },
};

/**
 * Validate and sanitize AI response against schema
 */
const _validateAISchema = (data, fallbackScore = 50) => {
  if (!data || typeof data !== 'object') {
    return {
      score: fallbackScore,
      confidence: 0.5,
      fallback: true,
      source: 'schema_validation_fallback',
      reasons: ['AI response was invalid or empty'],
      recommendations: ['Using fallback recommendation engine'],
      metadata: { validationError: 'Invalid data type' },
    };
  }
  
  // Check required fields
  const validated = {};
  
  // Validate score
  validated.score = typeof data.score === 'number' && !isNaN(data.score)
    ? Math.min(Math.max(Math.round(data.score), 0), 100)
    : fallbackScore;
  
  // Validate confidence
  validated.confidence = typeof data.confidence === 'number' && !isNaN(data.confidence)
    ? Math.min(Math.max(data.confidence, 0), 1)
    : 0.5;
  
  // Validate reasons array
  validated.reasons = Array.isArray(data.reasons)
    ? data.reasons.filter(r => typeof r === 'string' && r.trim().length > 0)
    : ['AI-generated insights'];
  
  // Validate recommendations array
  validated.recommendations = Array.isArray(data.recommendations)
    ? data.recommendations.filter(r => typeof r === 'string' && r.trim().length > 0)
    : ['Consider this event based on AI analysis'];
  
  // Preserve metadata if valid
  validated.metadata = typeof data.metadata === 'object' && data.metadata !== null
    ? data.metadata
    : {};
  
  // Add validation metadata
  validated.metadata.validationTimestamp = Date.now();
  validated.metadata.validated = true;
  
  return validated;
};

/**
 * Parse AI response from various formats (JSON, markdown, plain text)
 */
const _parseAIResponse = (responseData, fallbackScore = 50) => {
  if (!responseData) {
    return _validateAISchema(null, fallbackScore);
  }
  
  // If already parsed JSON object
  if (typeof responseData === 'object' && !Array.isArray(responseData)) {
    return _validateAISchema(responseData, fallbackScore);
  }
  
  // Try to parse as JSON string
  if (typeof responseData === 'string') {
    try {
      const parsed = JSON.parse(responseData);
      if (typeof parsed === 'object') {
        return _validateAISchema(parsed, fallbackScore);
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Failed to parse AI response as JSON:', e);
    }
    
    // Try to parse as markdown/structured text
    try {
      const structuredData = _parseMarkdownResponse(responseData);
      if (structuredData) {
        return _validateAISchema(structuredData, fallbackScore);
      }
    } catch (e) {
      logger.warn('[AIInsightsEngine] Failed to parse AI response as markdown:', e);
    }
    
    // Fallback: treat as plain text insight
    return {
      score: fallbackScore,
      confidence: 0.3,
      fallback: true,
      source: 'text_parsing_fallback',
      reasons: [responseData.length > 200 ? responseData.substring(0, 200) + '...' : responseData],
      recommendations: ['AI provided text-only response'],
      metadata: { rawResponse: responseData, parsedAs: 'plain_text' },
    };
  }
  
  return _validateAISchema(null, fallbackScore);
};

/**
 * Attempt to parse markdown response into structured format
 */
const _parseMarkdownResponse = (markdown) => {
  const result = {};
  
  // Look for score patterns
  const scoreMatch = markdown.match(/(?:score|rating|match):\s*(\d{1,3})/i);
  if (scoreMatch) {
    result.score = parseInt(scoreMatch[1], 10);
  }
  
  // Look for confidence patterns
  const confidenceMatch = markdown.match(/(?:confidence|certainty):\s*(\d{1,3}(?:\.\d{1,2})?)%?/i);
  if (confidenceMatch) {
    let confidence = parseFloat(confidenceMatch[1]);
    if (confidenceMatch[0].includes('%')) {
      confidence /= 100;
    }
    result.confidence = confidence;
  }
  
  // Look for reasons in lists
  const reasonMatches = markdown.match(/[-*+]\s*(.+)/g);
  if (reasonMatches) {
    result.reasons = reasonMatches.map(r => r.substring(2).trim());
  }
  
  // Look for recommendations
  const recommendationMatches = markdown.match(/(?:recommend|suggest|advice):\s*(.+?)(?:\n|\.|$)/i);
  if (recommendationMatches) {
    result.recommendations = [recommendationMatches[1].trim()];
  }
  
  return Object.keys(result).length > 0 ? result : null;
};

// ============================================================================
// 7. AI SERVICE CLIENT
// ============================================================================

/**
 * Configuration for AI service
 */
export const AI_SERVICE_CONFIG = {
  // Default endpoint - can be configured via environment
  endpoint: import.meta.env?.VITE_AI_INSIGHTS_ENDPOINT || 
           import.meta.env?.REACT_APP_AI_INSIGHTS_ENDPOINT ||
           'https://ai-proxy.eventra.com/api/v1/insights',
  
  // API key for AI service
  apiKey: import.meta.env?.VITE_AI_API_KEY || 
          import.meta.env?.REACT_APP_AI_API_KEY ||
          null,
  
  // Model configuration
  model: 'eventra-recommendation-v1',
  temperature: 0.3, // Lower temperature for more deterministic results
  maxTokens: 500,
};

/**
 * Configure AI service endpoint and settings
 */
export const configureAIService = (config = {}) => {
  AI_SERVICE_CONFIG.endpoint = config.endpoint || AI_SERVICE_CONFIG.endpoint;
  AI_SERVICE_CONFIG.apiKey = config.apiKey || AI_SERVICE_CONFIG.apiKey;
  AI_SERVICE_CONFIG.model = config.model || AI_SERVICE_CONFIG.model;
  AI_SERVICE_CONFIG.temperature = config.temperature !== undefined 
    ? config.temperature 
    : AI_SERVICE_CONFIG.temperature;
  AI_SERVICE_CONFIG.maxTokens = config.maxTokens || AI_SERVICE_CONFIG.maxTokens;
  
  logger.info('[AIInsightsEngine] AI service configured:', {
    endpoint: AI_SERVICE_CONFIG.endpoint,
    model: AI_SERVICE_CONFIG.model,
  });
};

/**
 * Call AI service via proxy API
 */
const _callAIService = async (event, profile, signal = null, options = {}) => {
  const {
    timeout = DEFAULT_AI_TIMEOUT_MS,
    retries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
  } = options;
  
  if (!_aiServiceCircuitBreaker.canExecute()) {
    const state = _aiServiceCircuitBreaker.getState();
    logger.warn(`[AIInsightsEngine] Circuit breaker open, skipping AI call. Time until reset: ${state.timeUntilReset}ms`);
    throw new Error('AI service temporarily unavailable');
  }
  
  try {
    // Build request payload
    const payload = {
      event: _sanitizeEventForAI(event),
      profile: _sanitizeProfileForAI(profile),
      model: AI_SERVICE_CONFIG.model,
      temperature: AI_SERVICE_CONFIG.temperature,
      max_tokens: AI_SERVICE_CONFIG.maxTokens,
    };
    
    // Add API key if configured
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (AI_SERVICE_CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${AI_SERVICE_CONFIG.apiKey}`;
    }
    
    logger.info(`[AIInsightsEngine] Calling AI service at ${AI_SERVICE_CONFIG.endpoint}`);
    
    const { response, data } = await fetchWithTimeout(
      AI_SERVICE_CONFIG.endpoint,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal,
        retries,
        retryDelay,
      },
      timeout
    );
    
    _aiServiceCircuitBreaker.recordSuccess();
    
    return data;
    
  } catch (error) {
    _aiServiceCircuitBreaker.recordFailure();
    
    if (error instanceof TimeoutError) {
      logger.error(`[AIInsightsEngine] AI service request timed out after ${timeout}ms`);
    } else if (error instanceof NetworkError) {
      logger.error('[AIInsightsEngine] AI service network error:', error.message);
    } else if (error instanceof FetchError) {
      logger.error(`[AIInsightsEngine] AI service HTTP error: ${error.status} - ${error.message}`);
    } else {
      logger.error('[AIInsightsEngine] AI service error:', error);
    }
    
    throw error;
  }
};

/**
 * Sanitize event data for AI consumption
 */
const _sanitizeEventForAI = (event) => {
  if (!event) return {};
  
  return {
    id: event.id || event.eventId || '',
    title: event.title || '',
    description: event.description || '',
    category: event.category || '',
    type: event.type || '',
    tags: event.tags || [],
    techStack: event.techStack || [],
    location: event.location || '',
    date: event.date || event.startDate || '',
    level: event.level || '',
    // Include any additional metadata that might be useful
    ...(event.metadata || {}),
  };
};

/**
 * Sanitize profile data for AI consumption
 */
const _sanitizeProfileForAI = (profile) => {
  if (!profile) return {};
  
  return {
    interests: profile.interests || [],
    skills: profile.skills || [],
    eventTypes: profile.eventTypes || [],
    level: profile.level || '',
    categories: profile.categories || [],
    location: profile.location || '',
    // Include interaction history if available
    ...(profile.interactionHistory || {}),
  };
};

// ============================================================================
// 8. MAIN GENERATE AI INSIGHTS FUNCTION
// ============================================================================

/**
 * Generate AI insights for an event based on user profile
 * 
 * This is the main entry point for the Enterprise Hybrid AI Event Recommendation Engine.
 * It implements a multi-tiered approach with caching, circuit breaking, and fallback
 * mechanisms to ensure reliable operation.
 * 
 * @param {Object} event - Event object to generate insights for
 * @param {Object} profile - User profile object
 * @param {Object} [options] - Configuration options
 * @param {AbortSignal} [options.signal] - Abort signal for cancellation
 * @param {number} [options.timeout] - Request timeout in milliseconds
 * @param {number} [options.retries] - Maximum number of retries
 * @param {number} [options.retryDelay] - Base delay between retries in milliseconds
 * @param {boolean} [options.forceRefresh] - Bypass cache and force fresh AI call
 * @param {boolean} [options.enableLocalFallback] - Enable local heuristic fallback (default: true)
 * @returns {Promise<Object>} - AI insights object with score, confidence, reasons, recommendations
 * 
 * @example
 * ```javascript
 * const insights = await generateAIInsights(
 *   event,
 *   userProfile,
 *   { signal: abortController.signal, timeout: 10000 }
 * );
 * 
 * console.log(`Recommendation score: ${insights.score}`);
 * console.log(`Reasons: ${insights.reasons.join(', ')}`);
 * ```
 */
export const generateAIInsights = async (event, profile = {}, options = {}) => {
  const startTime = Date.now();
  
  const {
    signal,
    timeout = DEFAULT_AI_TIMEOUT_MS,
    retries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    forceRefresh = false,
    enableLocalFallback = true,
  } = options;
  
  // Validate inputs
  if (!event || typeof event !== 'object') {
    _telemetry.recordCacheMiss();
    _telemetry.recordFallback();
    logger.error('[AIInsightsEngine] Invalid event parameter');
    return {
      score: 0,
      confidence: 0,
      fallback: true,
      source: 'invalid_input',
      reasons: ['Invalid event data provided'],
      recommendations: ['Please provide valid event data'],
      metadata: { error: 'Invalid event parameter' },
    };
  }
  
  if (!profile || typeof profile !== 'object') {
    _telemetry.recordCacheMiss();
    _telemetry.recordFallback();
    logger.error('[AIInsightsEngine] Invalid profile parameter');
    return {
      score: 50, // Neutral score for empty profile
      confidence: 0.3,
      fallback: true,
      source: 'invalid_input',
      reasons: ['No user profile data available'],
      recommendations: ['Update your profile for personalized recommendations'],
      metadata: { error: 'Invalid profile parameter' },
    };
  }
  
  try {
    // Get event ID for caching
    const eventId = event.id || event.eventId || JSON.stringify(event);
    
    // Create profile hash for cache key
    const profileHash = await createProfileHash(profile);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedInsights = await _getCachedInsights(eventId, profileHash);
      if (cachedInsights) {
        _telemetry.recordCacheHit();
        _telemetry.recordRequest(startTime, 'cache_hit');
        
        logger.info(`[AIInsightsEngine] Cache hit for event ${eventId}`);
        
        return { ...cachedInsights, cached: true };
      }
      _telemetry.recordCacheMiss();
    }
    
    // Build interaction profile for local fallback
    const interactionProfile = buildInteractionProfile(profile);
    
    // Try to call AI service
    try {
      const aiResponse = await _callAIService(event, profile, signal, {
        timeout,
        retries,
        retryDelay,
      });
      
      _telemetry.recordAISuccess();
      
      // Parse and validate AI response
      const insights = _parseAIResponse(aiResponse);
      insights.fallback = false;
      insights.source = 'ai_service';
      insights.cached = false;
      
      // Cache the successful response
      await _cacheInsights(eventId, profileHash, insights);
      
      _telemetry.recordRequest(startTime, 'ai_success');
      
      logger.info(`[AIInsightsEngine] AI service returned score ${insights.score} for event ${eventId}`);
      
      return insights;
      
    } catch (aiError) {
      _telemetry.recordAIFailure();
      
      logger.warn(`[AIInsightsEngine] AI service failed, falling back to local engine: ${aiError.message}`);
      
      // Fall back to local heuristic engine
      if (enableLocalFallback) {
        _telemetry.recordFallback();
        
        const insights = _generateLocalInsights(event, profile, interactionProfile);
        insights.cached = false;
        
        // Only cache fallback results if they meet quality threshold
        if (insights.score >= MIN_SCORE_THRESHOLD) {
          await _cacheInsights(eventId, profileHash, insights);
        }
        
        _telemetry.recordRequest(startTime, 'fallback_success');
        
        return insights;
      } else {
        // No fallback enabled, rethrow the error (outer catch records once)
        throw new Error(`AI service failed and local fallback disabled: ${aiError.message}`);
      }
    }
    
  } catch (error) {
    _telemetry.recordAIFailure();
    _telemetry.recordFallback();
    _telemetry.recordRequest(startTime, 'error');
    
    logger.error('[AIInsightsEngine] Error generating insights:', error);
    
    // Return error-based fallback
    return {
      score: 0,
      confidence: 0,
      fallback: true,
      source: 'error_fallback',
      reasons: ['Error generating insights'],
      recommendations: ['Please try again later'],
      metadata: { 
        error: error.message || 'Unknown error',
        timestamp: Date.now(),
        calculationTime: Date.now() - startTime,
      },
    };
  }
};

/**
 * Generate AI insights for multiple events
 */
export const generateBulkAIInsights = async (events = [], profile = {}, options = {}) => {
  const results = [];
  const errors = [];
  
  const {
    concurrency = 5, // Process 5 events concurrently
    ...individualOptions
  } = options;
  
  logger.info(`[AIInsightsEngine] Processing ${events.length} events with concurrency ${concurrency}`);
  
  // Process events in batches to avoid overwhelming the AI service
  for (let i = 0; i < events.length; i += concurrency) {
    const batch = events.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (event) => {
      try {
        const insights = await generateAIInsights(event, profile, individualOptions);
        return { event, insights, success: true };
      } catch (error) {
        return { 
          event, 
          insights: null, 
          error: error.message,
          success: false 
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(result => {
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
        logger.error(`[AIInsightsEngine] Error processing event: ${result.error}`);
      }
    });
    
    // Small delay between batches to prevent rate limiting
    if (i + concurrency < events.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  logger.info(`[AIInsightsEngine] Completed bulk processing: ${results.length} successes, ${errors.length} failures`);
  
  return {
    results,
    errors,
    summary: {
      total: events.length,
      successes: results.length,
      failures: errors.length,
      successRate: events.length > 0 ? (results.length / events.length) * 100 : 0,
    },
  };
};

// ============================================================================
// 9. EXPORTS
// ============================================================================

export {
  CircuitBreaker,
  createCacheKey,
};

export default {
  generateAIInsights,
  generateBulkAIInsights,
  configureAIService,
  clearAICache,
  getAITelemetry,
  logAITelemetry,
  resetAITelemetry,
  AI_SERVICE_CONFIG,
};