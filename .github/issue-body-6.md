## Target
**File:** `src/utils/registerUtils.js` (lines 40, 53)
**Category:** Performance | **Level:** Intermediate

## The Vulnerability
The `isAlreadyRegistered()` and `saveRegistration()` functions use `Array.includes()` (O(N)) on the event's email array for duplicate checking:

```js
return eventEmails.includes(normalizedEmail);  // line 40
if (!eventEmails.includes(normalizedEmail)) {    // line 53
  registrations[eventId] = [...eventEmails, normalizedEmail];
```

For each event, the list of registered emails grows over time. Using an array for membership testing means every registration check scans the entire list linearly.

## The Impact
If an event has hundreds of registrations, every duplicate check scans all previous entries. During offline sync where multiple registrations may be replayed, this becomes O(N^2) — for 200 registrations, up to 20,000 comparisons. Since this runs synchronously on the main thread, it contributes to UI jank during registration flows.

## Suggested Fix
Use a `Set` for email storage instead of an array. Change the storage structure to use a `Set` serialized as an array for localStorage compatibility, with O(1) `.has()` checks.
