## Target
**File:** `src/utils/recommendationEngine.js` (lines 64-90, 280-291)
**Category:** Performance | **Level:** Intermediate

## The Vulnerability
In `getSimilarityScore()`, the `candidateTags` `Set` is built correctly once (line 69), but inside the `reduce` loop, `getEventTags(event)` is called on every iteration (line 83):

```js
const overlap = getEventTags(event).filter((tag) => candidateTags.has(tag));
```

`getEventTags()` calls `normalizeList()` on `tags`, `techStack`, `title`, AND `description`, each of which calls `toTokens()` → `normalizeText()` → `.split()`, `.replace()`, `.trim()`, etc. This is heavy computation repeated for every interacted event on every scoring call.

Additionally, `getSimilarityScore` is called per-candidate event in `calculateRecommendationScore()` (line 230), which in turn is called per event in `buildPersonalizedRecommendations()` (line 283). So for N candidate events and M interacted events, getEventTags runs N×M times.

## The Impact
With 200 candidate events and 50 interacted events, `getEventTags` runs 10,000 times per recommendation build, each doing multiple string operations (.split, .replace, .trim, .filter). On mobile devices or large datasets, this causes noticeable delays (multiple seconds) in the recommendation UI.

## Suggested Fix
Pre-compute and cache `getEventTags()` for all interacted events before entering the scoring loop. Store the results in a Map keyed by event ID so each event's tags are computed exactly once per recommendation build.
