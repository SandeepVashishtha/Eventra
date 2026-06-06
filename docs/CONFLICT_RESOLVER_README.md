# Event Conflict Resolver - What's Included

## What You Get

### Components
- ✅ **EventConflictModal.jsx** - Modal UI showing conflicts + alternatives
- ✅ **EventConflictModal.test.jsx** - 24 comprehensive tests

### Utilities
- ✅ **conflictDetection.js** - Timezone-aware overlap detection
- ✅ **conflictDetection.test.js** - 30+ tests for detection logic

### Integration
- ✅ **EventRegistration.js** - Already integrated with modal
- ✅ **useEventRegistration.js** - Hook with conflict detection

### Documentation
- ✅ **EVENT_CONFLICT_RESOLVER.md** - Full technical guide
- ✅ **CONFLICT_RESOLVER_EXAMPLES.jsx** - 5 real-world usage examples

## 30-Second Start

```jsx
import { checkRegistrationConflict, suggestAlternativeEvents } from '../utils/conflictDetection';
import EventConflictModal from '../components/EventConflictModal';

// Check for conflicts
const { hasConflict, conflicts } = checkRegistrationConflict(newEvent, userRegistrations);

if (hasConflict) {
  // Get alternatives
  const suggestions = suggestAlternativeEvents(newEvent, allEvents, userRegistrations);
  
  // Show modal
  setShowModal(true);
  setConflicts(conflicts);
  setSuggestions(suggestions);
  return;
}

// No conflicts - register
register(newEvent);
```

Render the modal:
```jsx
<EventConflictModal
  isOpen={showModal}
  newEvent={event}
  conflictingEvents={conflicts}
  suggestedEvents={suggestions}
  onCancel={() => setShowModal(false)}
  onProceed={() => register(event)}
  onSelectAlternative={(alt) => navigate(`/events/${alt.id}/register`)}
/>
```

## How It Works

1. User tries to register → Check for overlapping times with existing registrations
2. Overlap found → Show modal with:
   - What events conflict
   - Why they can't both be attended
   - Suggested non-conflicting alternatives
3. User decides → Cancel, Proceed Anyway, or Switch to Alternative

## Key Features

- ✅ Timezone-aware (handles cross-timezone conflicts correctly)
- ✅ Smart suggestions (prioritizes similar event categories)
- ✅ Offline support (works without network)
- ✅ Accessible (keyboard nav, screen readers, WCAG AA)
- ✅ Dark mode
- ✅ Mobile-friendly
- ✅ Fully tested (54+ tests)

## API Reference

```javascript
// Check if events overlap
checkRegistrationConflict(newEvent, registeredEvents) 
→ { hasConflict: boolean, conflicts: Array }

// Get non-conflicting alternatives
suggestAlternativeEvents(event, allEvents, registeredEvents, fallback?, max?, tz?)
→ Array of suggested events

// Direct overlap test
doEventsOverlap(event1, event2, fallback?, tz?)
→ boolean

// Find all conflicting events
findConflictingEvents(newEvent, registeredEvents, fallback?, tz?)
→ Array
```

## Files Location

```
src/
  ├── components/
  │   ├── EventConflictModal.jsx           (UI component)
  │   └── EventConflictModal.test.jsx      (tests)
  ├── utils/
  │   ├── conflictDetection.js             (detection logic)
  │   └── conflictDetection.test.js        (tests)
  ├── Pages/Events/
  │   └── EventRegistration.js             (integration example)
  └── hooks/
      └── useEventRegistration.js          (hook with conflict check)

docs/
  ├── EVENT_CONFLICT_RESOLVER.md           (full docs)
  └── CONFLICT_RESOLVER_EXAMPLES.jsx       (usage examples)
```

## Common Use Cases

### 1. Simple Check Only (No UI)
```javascript
const { hasConflict } = checkRegistrationConflict(event, myEvents);
if (hasConflict) alert('Cannot register - conflicts with existing event');
```

### 2. Show Warning Badge
```javascript
{checkRegistrationConflict(event, myEvents).hasConflict && (
  <div className="text-red-600">⚠️ Conflicts with your schedule</div>
)}
```

### 3. Full Modal Experience
See CONFLICT_RESOLVER_EXAMPLES.jsx for code

## Testing

```bash
# Run all conflict tests
npm test -- --grep "conflict"

# Run component tests only
npm test -- EventConflictModal.test.jsx

# Run utility tests only
npm test -- conflictDetection.test.js
```

## Troubleshooting

**Modal not appearing?**
- Check `showModal` state is true
- Verify `hasConflict` returned true
- Inspect DOM for `[role="dialog"]`

**Conflicts not detected?**
- Ensure event has: `date`, `time`, `durationMinutes`
- Verify `myEvents` is array of events
- Test with hardcoded events

**Suggestions not showing?**
- Check API call succeeded
- Verify non-conflicting alternatives exist
- Check `conflictData.suggestions` in modal props

## That's It!

The system is production-ready. Start with the examples, customize to your needs, write tests, ship it.

See CONFLICT_RESOLVER_EXAMPLES.jsx for 5 real-world patterns you can copy/paste.
