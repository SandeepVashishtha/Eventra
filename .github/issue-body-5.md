## Target
**File:** `src/utils/feedbackUtils.js` (lines 38-39, 237-246)
**Category:** Performance | **Level:** Intermediate

## The Vulnerability
The `saveFeedback()` function uses `Array.findIndex()` (O(N)) to check if the user already submitted feedback by searching through an array of existing feedback entries:

```js
const existingIndex = eventFeedback.findIndex(
  (f) => f.userId === feedback.userId
);
```

This is called for each feedback submission. When called in batch contexts (e.g., importing feedback from CSV or syncing offline feedback at lines 237-246 where multiple feedback entries are processed sequentially), this creates O(N^2) time complexity — each insert scans the entire growing array.

## The Impact
As feedback for an event grows (e.g., hundreds of entries), saving feedback becomes quadratically slower. For an event with 500 feedback entries, a single save scans up to 500 elements. If multiple saves happen (e.g., during an offline sync), each subsequent save scans more elements. This causes noticeable UI jank on slower devices during batch operations.

## Suggested Fix
Replace the feedback array with a `Map` keyed by `userId` for O(1) lookups during dedup, converting back to array only for serialization. Alternatively, maintain a separate `Set` of userIds that have submitted feedback as an O(1) membership check.
