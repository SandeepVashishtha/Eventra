# Enterprise Hybrid AI Event Recommendation Engine

The `aiInsightsEngine.js` module provides an enterprise-grade, multi-tiered recommendation engine for generating AI-powered event insights. It addresses the limitations of direct AI proxy API calls by implementing caching, offline fallback, circuit breaking, and comprehensive telemetry.

## Features

### 1. Deterministically Hash-Based In-Memory & Storage Cache
- **In-Memory LRU Cache**: Fast, size-limited cache for frequently accessed event/profile combinations
- **Persistent Storage Cache**: Uses localStorage for cross-session caching with configurable TTL
- **Deterministic Hashing**: Consistent cache keys based on event ID and profile content hash
- **Configurable TTL**: Separate TTLs for memory (15 min) and storage (24 hours) caches
- **Cache Size Limits**: Prevents memory bloat with automatic LRU eviction

### 2. Offline Local Heuristic Engine
- **Jaccard Similarity**: Calculates set-based similarity between event tags and user interests
- **Keyword Overlap Scoring**: Measures keyword relevance between event content and user profile
- **Category & Type Matching**: Direct matching of event categories and types to user preferences
- **Interaction-Based Scoring**: Uses user's historical interactions for collaborative filtering
- **Weighted Scoring Algorithm**: Combines multiple factors with configurable weights

### 3. Circuit Breaker & Retries
- **Exponential Backoff**: Configurable retry delays with jitter
- **Circuit Breaker Pattern**: Prevents API hammering during outages
  - **CLOSED**: Normal operation
  - **OPEN**: Blocks requests after threshold failures
  - **HALF_OPEN**: Allows test requests after reset timeout
- **Configurable Thresholds**: Set failure count and reset timeouts
- **Automatic Recovery**: Self-healing after service recovery

### 4. Structured Output Parser
- **JSON Validation**: Validates AI responses against expected schema
- **Markdown Parsing**: Extracts structured data from markdown responses
- **Plain Text Fallback**: Handles unstructured text responses gracefully
- **Schema Validation**: Ensures all required fields are present and valid
- **Data Sanitization**: Cleans and normalizes AI-generated data

### 5. Telemetry & Latency Tracking
- **Request Metrics**: Tracks total requests, cache hits/misses
- **AI Service Metrics**: Monitors success/failure rates
- **Fallback Metrics**: Tracks local engine invocations
- **Latency Tracking**: Records min/max/average response times
- **Rate Calculations**: Computes hit rates, success rates, fallback rates
- **Loggable Metrics**: Easy-to-read console output

### 6. AbortController Support
- **Request Cancellation**: Supports AbortSignal for user-initiated cancellation
- **Rapid Event Switching**: Handles UI scenarios where users change events quickly
- **Resource Cleanup**: Proper cleanup of aborted requests

## Installation

The engine is automatically available when you import from `aiInsightsEngine.js`. No additional dependencies are required.

```javascript
import { generateAIInsights } from './utils/aiInsightsEngine.js';
```

## Basic Usage

### Single Event Insights

```javascript
import { generateAIInsights } from './utils/aiInsightsEngine.js';

const event = {
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

const userProfile = {
  interests: ['AI/ML', 'Data Science', 'Deep Learning'],
  skills: ['Python', 'TensorFlow', 'Machine Learning'],
  eventTypes: ['workshop', 'conference'],
  level: 'intermediate',
  categories: ['AI/ML', 'Tech'],
  location: 'San Francisco, CA',
};

// Generate insights
const insights = await generateAIInsights(event, userProfile);

console.log(`Recommendation Score: ${insights.score}/100`);
console.log(`Confidence: ${(insights.confidence * 100).toFixed(1)}%`);
console.log(`Source: ${insights.source}`);
console.log(`Fallback: ${insights.fallback ? 'Yes' : 'No'}`);
console.log(`Reasons: ${insights.reasons.join(', ')}`);
console.log(`Recommendations: ${insights.recommendations.join(', ')}`);
```

### Bulk Processing

```javascript
import { generateBulkAIInsights } from './utils/aiInsightsEngine.js';

const events = [
  { id: 'event-1', title: 'AI Workshop', category: 'AI/ML' },
  { id: 'event-2', title: 'Web Dev Conference', category: 'Web' },
  { id: 'event-3', title: 'Data Science Summit', category: 'Data' },
];

const results = await generateBulkAIInsights(events, userProfile, {
  concurrency: 5, // Process 5 events concurrently
  timeout: 15000, // 15 second timeout per event
});

console.log(`Processed ${results.summary.total} events`);
console.log(`Successes: ${results.results.length}`);
console.log(`Failures: ${results.errors.length}`);
console.log(`Success Rate: ${results.summary.successRate.toFixed(1)}%`);
```

## Configuration

### AI Service Configuration

```javascript
import { configureAIService, AI_SERVICE_CONFIG } from './utils/aiInsightsEngine.js';

// Configure the AI service
configureAIService({
  endpoint: 'https://your-ai-service.example.com/api/v1/insights',
  apiKey: 'your-api-key-here',
  model: 'eventra-recommendation-v2',
  temperature: 0.3, // Lower for more deterministic results
  maxTokens: 500,  // Maximum tokens in response
});

// Access current configuration
console.log(AI_SERVICE_CONFIG.endpoint);
console.log(AI_SERVICE_CONFIG.model);
```

### Per-Request Options

```javascript
const insights = await generateAIInsights(event, profile, {
  // Request timeout
  timeout: 15000, // 15 seconds (default)
  
  // Retry configuration
  retries: 3,      // Maximum retry attempts (default)
  retryDelay: 1000, // Base delay in ms (default)
  
  // Caching
  forceRefresh: true,  // Bypass cache
  
  // Fallback
  enableLocalFallback: true, // Enable local engine fallback (default)
  
  // Cancellation
  signal: abortController.signal, // AbortSignal for cancellation
});
```

## Advanced Usage

### Cache Management

```javascript
import { clearAICache } from './utils/aiInsightsEngine.js';

// Clear all caches (in-memory and storage)
clearAICache();

// Clear only when needed (e.g., user logout, data refresh)
// This prevents serving stale insights after profile changes
```

### Telemetry Monitoring

```javascript
import { getAITelemetry, logAITelemetry, resetAITelemetry } from './utils/aiInsightsEngine.js';

// Get current metrics
const metrics = getAITelemetry();
console.log('Cache Hit Rate:', metrics.cacheHitRate.toFixed(1) + '%');
console.log('AI Success Rate:', metrics.aiSuccessRate.toFixed(1) + '%');
console.log('Average Latency:', metrics.averageLatency.toFixed(0) + 'ms');
console.log('Fallback Rate:', metrics.fallbackRate.toFixed(1) + '%');

// Log formatted metrics
logAITelemetry();

// Reset metrics (e.g., for testing)
resetAITelemetry();
```

### Circuit Breaker Monitoring

```javascript
import { CircuitBreaker } from './utils/aiInsightsEngine.js';

// Create custom circuit breaker
const customBreaker = new CircuitBreaker(5, 30000); // 5 failures, 30s reset

console.log('Current state:', customBreaker.getState());
// { state: 'CLOSED', failureCount: 0, lastFailureTime: null, timeUntilReset: 0 }
```

### Profile Hashing

```javascript
import { createProfileHash } from './utils/aiInsightsEngine.js';

// Create stable hash for user profile (useful for cache key generation)
const hash = await createProfileHash(userProfile);
console.log('Profile hash:', hash);
```

## Response Structure

The `generateAIInsights` function returns an object with the following structure:

```javascript
{
  // Core metrics
  score: 85,              // Recommendation score (0-100)
  confidence: 0.92,       // Confidence in the score (0-1)
  
  // Content
  reasons: ['High relevance to your AI/ML interests', 'Matches your skill level'],
  recommendations: ['Strongly recommended', 'Perfect fit for your background'],
  
  // Metadata
  fallback: false,        // Whether local fallback was used
  source: 'ai_service',   // 'ai_service' | 'local_heuristic' | 'schema_validation_fallback' | ...
  cached: false,          // Whether response came from cache
  
  // Additional details
  metadata: {
    calculationTime: 42,   // Time taken to generate insights
    validationTimestamp: 1234567890,
    validated: true,
    // ... other metadata from AI service
  }
}
```

## Error Handling

The engine is designed to never throw errors that would break the UI:

```javascript
// Network errors
try {
  const insights = await generateAIInsights(event, profile);
  // Always succeeds, returns fallback insights on error
  console.log(insights.reasons); // User-friendly reasons
} catch (error) {
  // This will never be reached - errors are caught internally
}

// Force error throwing (advanced use case)
const insights = await generateAIInsights(event, profile, {
  enableLocalFallback: false // Will throw if AI service fails
});
```

## Integration with Existing Code

### Replacing Direct AI Calls

**Before:**
```javascript
// Direct AI proxy call - no caching, no fallback
const insights = await callAIProxy(event, profile);
```

**After:**
```javascript
// Enterprise hybrid engine - caching, fallback, circuit breaking
import { generateAIInsights } from './utils/aiInsightsEngine.js';

const insights = await generateAIInsights(event, profile);
```

### Enhancing Existing Recommendations

```javascript
import { buildPersonalizedRecommendations } from './utils/recommendationEngine.js';
import { generateAIInsights } from './utils/aiInsightsEngine.js';

// Combine rule-based and AI recommendations
const ruleBasedRecommendations = buildPersonalizedRecommendations({
  events,
  userProfile,
  limit: 10,
});

// Enhance with AI insights
const enhancedRecommendations = await Promise.all(
  ruleBasedRecommendations.map(async (event) => {
    const insights = await generateAIInsights(event, userProfile);
    return {
      ...event,
      aiScore: insights.score,
      aiConfidence: insights.confidence,
      aiReasons: insights.reasons,
      // Combine scores
      combinedScore: (event.recommendationScore * 0.7) + (insights.score * 0.3),
    };
  })
);

// Sort by combined score
const finalRecommendations = enhancedRecommendations
  .sort((a, b) => b.combinedScore - a.combinedScore)
  .slice(0, 10);
```

## Performance Optimization

### Caching Strategies

1. **In-Memory Cache**: Fast access for currently active event/profile combinations
2. **Storage Cache**: Persists across page refreshes and browser sessions
3. **Smart Cache Keys**: Uses deterministic hashing of event ID and profile content
4. **Automatic Invalidation**: Cache entries expire based on TTL

### Batch Processing

- Use `generateBulkAIInsights` for processing multiple events
- Configurable concurrency prevents overwhelming the AI service
- Automatic delays between batches prevent rate limiting

### Circuit Breaker Benefits

- Prevents API hammering during outages
- Allows graceful degradation to local engine
- Automatic recovery when service becomes available
- Configurable thresholds for different failure scenarios

## Testing

The engine includes comprehensive test coverage:

```bash
# Run tests
npm test -- --testNamePattern="AI Insights Engine"

# Or run specific test files
npm test -- aiInsightsEngine.test.js
```

Tests cover:
- Cache functionality (in-memory and storage)
- Profile hashing consistency
- Circuit breaker behavior
- Local heuristic engine accuracy
- Structured output parsing
- Error handling and fallbacks
- AbortController support
- Bulk processing
- Telemetry accuracy
- All acceptance criteria

## Acceptance Criteria Compliance

| Criteria | Status | Implementation |
|----------|--------|----------------|
| ✅ Requests for previously evaluated event/profile combinations resolve instantly from cache | ✅ Implemented | LRU cache with deterministic keys |
| ✅ Network drops or HTTP 5xx responses fall back smoothly to local rule-based match engine | ✅ Implemented | Circuit breaker + local engine fallback |
| ✅ AI prompt output is validated and sanitized against expected schema | ✅ Implemented | Schema validation + data sanitization |
| ✅ Telemetry events log execution time, token estimates, and fallback states | ✅ Implemented | Comprehensive telemetry collection |

## Best Practices

1. **Configure AI Service**: Set up the AI service endpoint and API keys
2. **Use Caching**: Leverage built-in caching for duplicate requests
3. **Handle Fallbacks Gracefully**: Always show user-friendly content from fallback
4. **Monitor Telemetry**: Regularly check metrics for performance issues
5. **Tune Parameters**: Adjust timeouts, retries, and thresholds based on your AI service
6. **Clear Cache on Profile Changes**: Call `clearAICache()` when user profile changes significantly
7. **Use Bulk Processing**: For processing many events, use `generateBulkAIInsights`

## Troubleshooting

### AI Service Connection Issues

```javascript
// Check configuration
console.log(AI_SERVICE_CONFIG);

// Test connectivity
try {
  await generateAIInsights(event, profile, { enableLocalFallback: false });
  console.log('AI service is accessible');
} catch (error) {
  console.error('AI service error:', error.message);
}

// Check circuit breaker state
console.log(_aiServiceCircuitBreaker.getState());
```

### Low Cache Hit Rate

- Ensure event IDs are stable and unique
- Verify profile data is consistent between calls
- Check that cache TTLs are appropriate for your use case
- Consider increasing cache size limits

### High Fallback Rate

- Check AI service availability and configuration
- Review error logs for patterns
- Verify network connectivity
- Consider increasing retry counts or timeouts

## Migration Guide

### From Direct AI Calls

**Before:**
```javascript
async function getAIInsights(event, profile) {
  const response = await fetch('/api/ai/insights', {
    method: 'POST',
    body: JSON.stringify({ event, profile }),
  });
  return response.json();
}
```

**After:**
```javascript
import { generateAIInsights } from './utils/aiInsightsEngine.js';

async function getAIInsights(event, profile) {
  return generateAIInsights(event, profile);
}
```

### From Existing Recommendation System

**Before:**
```javascript
import { calculateRecommendationScore } from './utils/recommendationEngine.js';

const score = calculateRecommendationScore(event, profile);
```

**After:**
```javascript
import { generateAIInsights } from './utils/aiInsightsEngine.js';

const insights = await generateAIInsights(event, profile);
const score = insights.score;
const reasons = insights.reasons; // Bonus: now you have reasons!
```

## API Reference

### Functions

#### `generateAIInsights(event, profile, options)`
Generate AI insights for a single event.

#### `generateBulkAIInsights(events, profile, options)`
Generate AI insights for multiple events with configurable concurrency.

#### `configureAIService(config)`
Configure the AI service endpoint and parameters.

#### `clearAICache()`
Clear all AI insights caches (in-memory and storage).

#### `getAITelemetry()`
Get current telemetry metrics.

#### `logAITelemetry()`
Log current telemetry metrics to console.

#### `resetAITelemetry()`
Reset all telemetry metrics.

#### `createProfileHash(profile)`
Create a deterministic hash from a user profile.

#### `createCacheKey(eventId, profileHash)`
Create a cache key from event ID and profile hash.

### Classes

#### `CircuitBreaker`
Implements the circuit breaker pattern for fault tolerance.

### Constants

#### `AI_SERVICE_CONFIG`
Current AI service configuration object.

## License

This code is part of the Eventra project and is licensed under the same terms as the main project.