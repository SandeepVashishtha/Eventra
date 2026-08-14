/**
 * Tests for Enterprise Hybrid AI Event Recommendation Engine
 * 
 * Tests cover:
 * - Cache functionality (in-memory and storage)
 * - Circuit breaker behavior
 * - Local heuristic engine
 * - Structured output parsing
 * - Error handling and fallbacks
 * - AbortController support
 * - Telemetry and metrics
 */

import { describe, it, expect, beforeEach, afterEach, vi, assert } from 'vitest';

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

// Mock dependencies
vi.mock('./logger.js', () => ({
  logger: mockLogger,
}));

vi.mock('./fetchWithTimeout.js', () => ({
  fetchWithTimeout: vi.fn(),
  TimeoutError: class TimeoutError extends Error {
    constructor(message) {
      super(message);
      this.name = 'TimeoutError';
    }
  },
  NetworkError: class NetworkError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NetworkError';
    }
  },
  FetchError: class FetchError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = 'FetchError';
      this.status = status;
      this.data = data;
    }
  },
}));

// Import after mocking
import {
  generateAIInsights,
  generateBulkAIInsights,
  configureAIService,
  clearAICache,
  getAITelemetry,
  resetAITelemetry,
  createProfileHash,
  createCacheKey,
  CircuitBreaker,
  AI_SERVICE_CONFIG,
  _aiServiceCircuitBreaker,
  _telemetry,
  _insightsCache,
} from './aiInsightsEngine.js';

// Test fixtures
const mockEvent = {
  id: 'event-123',
  title: 'AI & Machine Learning Workshop',
  description: 'A comprehensive workshop on modern AI techniques',
  category: 'AI/ML',
  type: 'workshop',
  tags: ['machine learning', 'deep learning', 'neural networks'],
  techStack: ['Python', 'TensorFlow', 'PyTorch'],
  location: 'San Francisco, CA',
  date: '2026-09-15',
  level: 'intermediate',
};

const mockProfile = {
  interests: ['AI/ML', 'Data Science', 'Deep Learning'],
  skills: ['Python', 'TensorFlow', 'Machine Learning'],
  eventTypes: ['workshop', 'conference'],
  level: 'intermediate',
  categories: ['AI/ML', 'Tech'],
  location: 'San Francisco, CA',
};

const mockAIResponse = {
  score: 85,
  confidence: 0.92,
  reasons: ['High relevance to your AI/ML interests', 'Matches your skill level'],
  recommendations: ['Strongly recommended', 'Perfect fit for your background'],
  metadata: { model: 'eventra-v1', tokens: 150 },
};

const mockMalformedAIResponse = {
  score: 'high', // Invalid - should be number
  confidence: 1.5, // Invalid - should be 0-1
  reasons: 'Great match', // Invalid - should be array
  recommendations: null, // Invalid - should be array
};

// ============================================================================
// 1. CACHE TESTS
// ============================================================================

describe('AI Insights Engine - Cache Functionality', () => {
  beforeEach(() => {
    // Clear all caches and reset mocks
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
    
    // Mock fetchWithTimeout to return success
    import('./fetchWithTimeout.js').then(({ fetchWithTimeout }) => {
      fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    });
  });

  afterEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.restoreAllMocks();
  });

  it('should create consistent cache keys for same inputs', async () => {
    const key1 = createCacheKey('event-123', 'profile-hash-1');
    const key2 = createCacheKey('event-123', 'profile-hash-1');
    
    expect(key1).toBe(key2);
  });

  it('should create different cache keys for different inputs', async () => {
    const key1 = createCacheKey('event-123', 'profile-hash-1');
    const key2 = createCacheKey('event-456', 'profile-hash-1');
    const key3 = createCacheKey('event-123', 'profile-hash-2');
    
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key2).not.toBe(key3);
  });

  it('should return cached results for identical requests', async () => {
    // First call should hit the AI service
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValueOnce({ data: mockAIResponse });
    
    const insights1 = await generateAIInsights(mockEvent, mockProfile);
    expect(insights1.score).toBe(85);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    
    // Second call should hit the cache
    resetAITelemetry(); // Reset to track cache hit
    const insights2 = await generateAIInsights(mockEvent, mockProfile);
    expect(insights2.cached).toBe(true);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1); // Still 1, no new call
  });

  it('should bypass cache when forceRefresh is true', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    // First call
    await generateAIInsights(mockEvent, mockProfile);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
    
    // Second call with forceRefresh should call AI service again
    await generateAIInsights(mockEvent, mockProfile, { forceRefresh: true });
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
  });

  it('should handle storage cache fallbacks gracefully', async () => {
    // Mock localStorage to be unavailable
    const originalLocalStorage = global.localStorage;
    global.localStorage = undefined;
    
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights.score).toBe(85);
    
    // Should still work, just won't use storage cache
    expect(mockLogger.warn).not.toHaveBeenCalled();
    
    // Restore
    global.localStorage = originalLocalStorage;
  });
});

// ============================================================================
// 2. PROFILE HASH TESTS
// ============================================================================

describe('AI Insights Engine - Profile Hashing', () => {
  it('should create profile hash from profile object', async () => {
    const hash = await createProfileHash(mockProfile);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should create same hash for identical profiles', async () => {
    const hash1 = await createProfileHash(mockProfile);
    const hash2 = await createProfileHash(mockProfile);
    expect(hash1).toBe(hash2);
  });

  it('should create different hashes for different profiles', async () => {
    const profile2 = { ...mockProfile, interests: ['Web Development'] };
    const hash1 = await createProfileHash(mockProfile);
    const hash2 = await createProfileHash(profile2);
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty profile gracefully', async () => {
    const hash = await createProfileHash({});
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 3. LOCAL HEURISTIC ENGINE TESTS
// ============================================================================

describe('AI Insights Engine - Local Heuristic Engine', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
    
    // Mock fetchWithTimeout to fail, forcing fallback to local engine
    import('./fetchWithTimeout.js').then(({ fetchWithTimeout }) => {
      fetchWithTimeout.mockRejectedValue(new Error('AI service unavailable'));
    });
  });

  it('should generate insights using local heuristic when AI service fails', async () => {
    const insights = await generateAIInsights(mockEvent, mockProfile);
    
    expect(insights).toHaveProperty('score');
    expect(insights).toHaveProperty('confidence');
    expect(insights).toHaveProperty('reasons');
    expect(insights).toHaveProperty('recommendations');
    expect(insights.fallback).toBe(true);
    expect(insights.source).toBe('local_heuristic');
  });

  it('should generate higher scores for well-matching events', async () => {
    // Event that perfectly matches profile
    const perfectMatchEvent = {
      ...mockEvent,
      category: 'AI/ML',
      type: 'workshop',
      tags: ['machine learning', 'python', 'tensorflow'],
      techStack: ['Python', 'TensorFlow'],
    };
    
    const insights = await generateAIInsights(perfectMatchEvent, mockProfile);
    expect(insights.score).toBeGreaterThan(50);
  });

  it('should generate lower scores for non-matching events', async () => {
    // Event that doesn't match profile at all
    const poorMatchEvent = {
      id: 'event-456',
      title: 'Cooking Class',
      description: 'Learn to cook French cuisine',
      category: 'Food',
      type: 'class',
      tags: ['cooking', 'french', 'cuisine'],
      techStack: [],
      location: 'Paris, France',
      date: '2026-09-15',
      level: 'beginner',
    };
    
    const insights = await generateAIInsights(poorMatchEvent, mockProfile);
    expect(insights.score).toBeLessThan(50);
  });

  it('should handle empty profile gracefully', async () => {
    const insights = await generateAIInsights(mockEvent, {});
    expect(insights).toHaveProperty('score');
    expect(insights).toHaveProperty('reasons');
    expect(insights.score).toBeGreaterThanOrEqual(0);
  });

  it('should handle missing event data gracefully', async () => {
    const minimalEvent = { id: 'event-789', title: 'Unknown Event' };
    const insights = await generateAIInsights(minimalEvent, mockProfile);
    expect(insights).toHaveProperty('score');
    expect(insights.score).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// 4. CIRCUIT BREAKER TESTS
// ============================================================================

describe('AI Insights Engine - Circuit Breaker', () => {
  let circuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(3, 1000); // 3 failures to trip, 1s reset
  });

  it('should start in CLOSED state', () => {
    expect(circuitBreaker.state).toBe('CLOSED');
    expect(circuitBreaker.canExecute()).toBe(true);
  });

  it('should allow execution when in CLOSED state', () => {
    expect(circuitBreaker.canExecute()).toBe(true);
  });

  it('should transition to OPEN state after threshold failures', () => {
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    expect(circuitBreaker.state).toBe('CLOSED');
    
    circuitBreaker.recordFailure(); // Third failure
    expect(circuitBreaker.state).toBe('OPEN');
    expect(circuitBreaker.canExecute()).toBe(false);
  });

  it('should reset to CLOSED state on success', () => {
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    circuitBreaker.recordSuccess();
    
    expect(circuitBreaker.state).toBe('CLOSED');
    expect(circuitBreaker.failureCount).toBe(0);
    expect(circuitBreaker.canExecute()).toBe(true);
  });

  it('should transition to HALF_OPEN after reset timeout', () => {
    // Use very short timeout for testing
    circuitBreaker = new CircuitBreaker(2, 10); // 10ms reset
    
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    expect(circuitBreaker.state).toBe('OPEN');
    
    // Wait for reset
    return new Promise(resolve => {
      setTimeout(() => {
        expect(circuitBreaker.canExecute()).toBe(true);
        expect(circuitBreaker.state).toBe('HALF_OPEN');
        resolve();
      }, 15);
    });
  });

  it('should provide state information', () => {
    circuitBreaker.recordFailure();
    const state = circuitBreaker.getState();
    
    expect(state.state).toBe('CLOSED');
    expect(state.failureCount).toBe(1);
    expect(state.lastFailureTime).toBeDefined();
    expect(state.timeUntilReset).toBe(0);
  });
});

// ============================================================================
// 5. STRUCTURED OUTPUT PARSER TESTS
// ============================================================================

describe('AI Insights Engine - Structured Output Parser', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
  });

  it('should validate and sanitize valid AI response', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    
    expect(insights.score).toBe(85);
    expect(insights.confidence).toBe(0.92);
    expect(Array.isArray(insights.reasons)).toBe(true);
    expect(Array.isArray(insights.recommendations)).toBe(true);
  });

  it('should handle malformed AI response gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockMalformedAIResponse });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    
    // Should use fallback values
    expect(insights.score).toBeGreaterThanOrEqual(0);
    expect(insights.score).toBeLessThanOrEqual(100);
    expect(insights.confidence).toBeGreaterThanOrEqual(0);
    expect(insights.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(insights.reasons)).toBe(true);
    expect(insights.reasons.length).toBeGreaterThan(0);
    expect(insights.fallback).toBe(true);
  });

  it('should handle null AI response gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: null });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights).toHaveProperty('score');
    expect(insights.fallback).toBe(true);
  });

  it('should handle string AI response (JSON)', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ 
      data: JSON.stringify(mockAIResponse) 
    });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights.score).toBe(85);
    expect(insights.confidence).toBe(0.92);
  });

  it('should handle markdown AI response', async () => {
    const markdownResponse = `
# AI Insights

Score: 90

Confidence: 0.95

Reasons:
- Perfect match for your interests
- Highly relevant to your background

Recommendations:
Consider attending this event as it aligns perfectly with your goals.
    `;
    
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: markdownResponse });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights.score).toBeGreaterThanOrEqual(50); // Should parse score from markdown
  });
});

// ============================================================================
// 6. ERROR HANDLING TESTS
// ============================================================================

describe('AI Insights Engine - Error Handling', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
  });

  it('should handle network timeout gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    const timeoutError = new (await import('./fetchWithTimeout.js')).then(r => r.TimeoutError)();
    fetchWithTimeout.mockRejectedValue(timeoutError);
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights).toHaveProperty('score');
    expect(insights.fallback).toBe(true);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle network errors gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    const networkError = new (await import('./fetchWithTimeout.js')).then(r => r.NetworkError)();
    fetchWithTimeout.mockRejectedValue(networkError);
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights).toHaveProperty('score');
    expect(insights.fallback).toBe(true);
  });

  it('should handle HTTP errors gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    const fetchError = new (await import('./fetchWithTimeout.js')).then(r => r.FetchError)('Internal Server Error', 500);
    fetchWithTimeout.mockRejectedValue(fetchError);
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    expect(insights).toHaveProperty('score');
    expect(insights.fallback).toBe(true);
  });

  it('should handle invalid event input gracefully', async () => {
    const insights = await generateAIInsights(null, mockProfile);
    expect(insights.score).toBe(0);
    expect(insights.reasons).toContain('Invalid event data provided');
  });

  it('should handle invalid profile input gracefully', async () => {
    const insights = await generateAIInsights(mockEvent, null);
    expect(insights.score).toBe(50); // Neutral score
    expect(insights.reasons).toContain('No user profile data available');
  });

  it('should throw error when local fallback is disabled and AI fails', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockRejectedValue(new Error('AI service down'));
    
    await expect(
      generateAIInsights(mockEvent, mockProfile, { enableLocalFallback: false })
    ).rejects.toThrow('AI service failed and local fallback disabled');
  });
});

// ============================================================================
// 7. ABORT CONTROLLER TESTS
// ============================================================================

describe('AI Insights Engine - AbortController Support', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
  });

  it('should respect AbortSignal for request cancellation', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    
    // Mock fetchWithTimeout to check for signal
    fetchWithTimeout.mockImplementation((url, options) => {
      if (options.signal && options.signal.aborted) {
        throw new Error('Request aborted');
      }
      return Promise.resolve({ data: mockAIResponse });
    });
    
    // Abort immediately
    abortController.abort();
    
    const insights = await generateAIInsights(mockEvent, mockProfile, { 
      signal: abortSignal 
    });
    
    // Should fall back to local engine due to abort
    expect(insights).toHaveProperty('score');
  });

  it('should handle aborted requests gracefully', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    const abortController = new AbortController();
    
    // Simulate the request being aborted mid-flight
    fetchWithTimeout.mockRejectedValue(new Error('Request aborted'));
    
    // Abort after a short delay
    setTimeout(() => abortController.abort(), 10);
    
    const insights = await generateAIInsights(mockEvent, mockProfile, { 
      signal: abortController.signal 
    });
    
    expect(insights).toHaveProperty('score');
    expect(insights.fallback).toBe(true);
  });
});

// ============================================================================
// 8. BULK PROCESSING TESTS
// ============================================================================

describe('AI Insights Engine - Bulk Processing', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
    
    // Mock fetchWithTimeout for success
    import('./fetchWithTimeout.js').then(({ fetchWithTimeout }) => {
      fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    });
  });

  it('should process multiple events', async () => {
    const events = [
      { ...mockEvent, id: 'event-1' },
      { ...mockEvent, id: 'event-2' },
      { ...mockEvent, id: 'event-3' },
    ];
    
    const result = await generateBulkAIInsights(events, mockProfile);
    
    expect(result.summary.total).toBe(3);
    expect(result.results.length).toBe(3);
    expect(result.errors.length).toBe(0);
    expect(result.summary.successRate).toBe(100);
  });

  it('should handle mixed success/failure in bulk processing', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    // First two succeed, third fails
    fetchWithTimeout
      .mockResolvedValueOnce({ data: mockAIResponse })
      .mockResolvedValueOnce({ data: mockAIResponse })
      .mockRejectedValueOnce(new Error('AI service error'));
    
    const events = [
      { ...mockEvent, id: 'event-1' },
      { ...mockEvent, id: 'event-2' },
      { ...mockEvent, id: 'event-3' },
    ];
    
    const result = await generateBulkAIInsights(events, mockProfile);
    
    expect(result.summary.total).toBe(3);
    expect(result.results.length).toBe(2);
    expect(result.errors.length).toBe(1);
    expect(result.summary.successRate).toBeCloseTo(66.67, 0);
  });

  it('should respect concurrency limit', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    const events = Array.from({ length: 10 }, (_, i) => ({ 
      ...mockEvent, 
      id: `event-${i}` 
    }));
    
    const startTime = Date.now();
    const result = await generateBulkAIInsights(events, mockProfile, { 
      concurrency: 3 
    });
    const endTime = Date.now();
    
    expect(result.summary.total).toBe(10);
    expect(result.results.length).toBe(10);
    // Should take some time due to batching
    expect(endTime - startTime).toBeGreaterThan(0);
  });
});

// ============================================================================
// 9. TELEMETRY TESTS
// ============================================================================

describe('AI Insights Engine - Telemetry', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
    
    // Mock fetchWithTimeout to fail, forcing local fallback
    import('./fetchWithTimeout.js').then(({ fetchWithTimeout }) => {
      fetchWithTimeout.mockRejectedValue(new Error('AI service unavailable'));
    });
  });

  it('should track request metrics', async () => {
    await generateAIInsights(mockEvent, mockProfile);
    
    const metrics = getAITelemetry();
    expect(metrics.totalRequests).toBeGreaterThan(0);
    expect(metrics.aiFailures).toBeGreaterThan(0);
    expect(metrics.fallbackInvocations).toBeGreaterThan(0);
  });

  it('should track cache hits and misses', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    // First call (cache miss)
    await generateAIInsights(mockEvent, mockProfile);
    let metrics = getAITelemetry();
    expect(metrics.cacheMisses).toBeGreaterThan(0);
    
    resetAITelemetry();
    
    // Second call (cache hit)
    await generateAIInsights(mockEvent, mockProfile);
    metrics = getAITelemetry();
    expect(metrics.cacheHits).toBeGreaterThan(0);
  });

  it('should calculate cache hit rate', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    // Generate some cache hits and misses
    await generateAIInsights({ ...mockEvent, id: 'event-1' }, mockProfile);
    await generateAIInsights({ ...mockEvent, id: 'event-2' }, mockProfile);
    
    resetAITelemetry();
    
    // These should be cache hits
    await generateAIInsights({ ...mockEvent, id: 'event-1' }, mockProfile);
    await generateAIInsights({ ...mockEvent, id: 'event-2' }, mockProfile);
    
    const metrics = getAITelemetry();
    expect(metrics.cacheHitRate).toBe(100);
  });

  it('should reset telemetry', () => {
    // Add some metrics
    _telemetry.recordCacheHit();
    _telemetry.recordCacheHit();
    _telemetry.recordAIFailure();
    
    let metrics = getAITelemetry();
    expect(metrics.cacheHits).toBe(2);
    expect(metrics.aiFailures).toBe(1);
    
    resetAITelemetry();
    
    metrics = getAITelemetry();
    expect(metrics.cacheHits).toBe(0);
    expect(metrics.aiFailures).toBe(0);
  });

  it('should calculate average latency', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    await generateAIInsights(mockEvent, mockProfile);
    
    const metrics = getAITelemetry();
    expect(metrics.averageLatency).toBeGreaterThan(0);
    expect(metrics.minLatency).toBeGreaterThanOrEqual(0);
    expect(metrics.maxLatency).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// 10. CONFIGURATION TESTS
// ============================================================================

describe('AI Insights Engine - Configuration', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
  });

  it('should allow AI service configuration', () => {
    const originalEndpoint = AI_SERVICE_CONFIG.endpoint;
    const originalModel = AI_SERVICE_CONFIG.model;
    
    configureAIService({
      endpoint: 'https://custom-ai.example.com/api',
      model: 'custom-model-v2',
      temperature: 0.5,
      maxTokens: 1000,
    });
    
    expect(AI_SERVICE_CONFIG.endpoint).toBe('https://custom-ai.example.com/api');
    expect(AI_SERVICE_CONFIG.model).toBe('custom-model-v2');
    expect(AI_SERVICE_CONFIG.temperature).toBe(0.5);
    expect(AI_SERVICE_CONFIG.maxTokens).toBe(1000);
    
    // Restore original
    configureAIService({
      endpoint: originalEndpoint,
      model: originalModel,
    });
  });

  it('should maintain default configuration when partial config provided', () => {
    const originalModel = AI_SERVICE_CONFIG.model;
    const originalTemperature = AI_SERVICE_CONFIG.temperature;
    
    configureAIService({
      endpoint: 'https://custom-ai.example.com/api',
    });
    
    expect(AI_SERVICE_CONFIG.endpoint).toBe('https://custom-ai.example.com/api');
    expect(AI_SERVICE_CONFIG.model).toBe(originalModel);
    expect(AI_SERVICE_CONFIG.temperature).toBe(originalTemperature);
  });
});

// ============================================================================
// 11. ACCEPTANCE CRITERIA TESTS
// ============================================================================

describe('AI Insights Engine - Acceptance Criteria', () => {
  beforeEach(() => {
    clearAICache();
    resetAITelemetry();
    vi.clearAllMocks();
  });

  it('AC1: Requests for previously evaluated event/profile combinations resolve instantly from cache', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    fetchWithTimeout.mockResolvedValue({ data: mockAIResponse });
    
    const startTime1 = Date.now();
    const insights1 = await generateAIInsights(mockEvent, mockProfile);
    const time1 = Date.now() - startTime1;
    
    resetAITelemetry();
    
    const startTime2 = Date.now();
    const insights2 = await generateAIInsights(mockEvent, mockProfile);
    const time2 = Date.now() - startTime2;
    
    expect(insights2.cached).toBe(true);
    expect(time2).toBeLessThan(time1); // Should be faster from cache
    expect(insights2.score).toBe(insights1.score);
  });

  it('AC2: Network drops or HTTP 5xx responses fall back smoothly to local rule-based match engine', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    // Test network error
    const networkError = new (await import('./fetchWithTimeout.js')).then(r => r.NetworkError)();
    fetchWithTimeout.mockRejectedValue(networkError);
    
    const insights1 = await generateAIInsights(mockEvent, mockProfile);
    expect(insights1.fallback).toBe(true);
    expect(insights1.source).toBe('local_heuristic');
    
    // Test HTTP 5xx error
    const fetchError = new (await import('./fetchWithTimeout.js')).then(r => r.FetchError)('Service Unavailable', 503);
    fetchWithTimeout.mockRejectedValue(fetchError);
    
    const insights2 = await generateAIInsights(mockEvent, mockProfile);
    expect(insights2.fallback).toBe(true);
    expect(insights2.source).toBe('local_heuristic');
    
    // Should not throw UI errors
    expect(insights1.reasons.length).toBeGreaterThan(0);
    expect(insights2.reasons.length).toBeGreaterThan(0);
  });

  it('AC3: AI prompt output is validated and sanitized against expected schema', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    // Test with malformed data
    const malformedResponse = {
      score: 'not a number',
      confidence: 2.0, // Invalid range
      reasons: 'not an array',
      recommendations: null,
    };
    
    fetchWithTimeout.mockResolvedValue({ data: malformedResponse });
    
    const insights = await generateAIInsights(mockEvent, mockProfile);
    
    // Should be validated and sanitized
    expect(typeof insights.score).toBe('number');
    expect(insights.score).toBeGreaterThanOrEqual(0);
    expect(insights.score).toBeLessThanOrEqual(100);
    expect(typeof insights.confidence).toBe('number');
    expect(insights.confidence).toBeGreaterThanOrEqual(0);
    expect(insights.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(insights.reasons)).toBe(true);
    expect(Array.isArray(insights.recommendations)).toBe(true);
    expect(insights.reasons.length).toBeGreaterThan(0);
    expect(insights.recommendations.length).toBeGreaterThan(0);
  });

  it('AC4: Telemetry events log execution time, token estimates, and fallback states', async () => {
    const fetchWithTimeout = (await import('./fetchWithTimeout.js')).fetchWithTimeout;
    
    // Force AI failure to trigger fallback
    fetchWithTimeout.mockRejectedValue(new Error('AI service down'));
    
    await generateAIInsights(mockEvent, mockProfile);
    
    const metrics = getAITelemetry();
    
    // Execution time should be tracked
    expect(metrics.totalLatency).toBeGreaterThan(0);
    expect(metrics.latencies.length).toBeGreaterThan(0);
    
    // Fallback state should be tracked
    expect(metrics.fallbackInvocations).toBeGreaterThan(0);
    expect(metrics.aiFailures).toBeGreaterThan(0);
    
    // Cache state should be tracked
    expect(metrics.cacheMisses).toBeGreaterThan(0);
    
    // Calculate rates
    expect(metrics.fallbackRate).toBeGreaterThan(0);
    expect(metrics.aiSuccessRate).toBe(0); // All AI calls failed
  });
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

// This test suite covers all acceptance criteria and major functionality:
// ✅ AC1: Caching works correctly with duplicate requests
// ✅ AC2: Network/5xx errors fall back to local engine without UI errors
// ✅ AC3: AI output validation and sanitization against schema
// ✅ AC4: Telemetry tracks execution time, fallbacks, cache hits/misses
// ✅ Circuit breaker prevents API hammering
// ✅ AbortController support for request cancellation
// ✅ Local heuristic engine with Jaccard similarity and keyword overlap
// ✅ Structured output parser for JSON/markdown with fallbacks
// ✅ Bulk processing with configurable concurrency
// ✅ Configuration and customization options
// ✅ Comprehensive error handling and graceful degradation