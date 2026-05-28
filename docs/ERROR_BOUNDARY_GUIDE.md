# Error Boundary Quick Reference Guide

## Using the Error Boundary

### Basic Setup
```jsx
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  );
}
```

### Sectional Error Boundaries
```jsx
import SectionErrorBoundary from "./components/common/SectionErrorBoundary";

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary label="Analytics Dashboard">
        <AnalyticsComponent />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary label="Charts" silent>
        <ChartsComponent />
      </SectionErrorBoundary>
    </div>
  );
}
```

## Error Recovery Actions

### Users Can:
1. **Reload Page** - Full page reload (fastest recovery)
2. **Try Again** - Soft retry without reload (preserves session, max 3 attempts)
3. **Reset Cache** - Clears localStorage, preserves auth tokens
4. **View Diagnostics** - See detailed error information
5. **Copy Report** - Copy diagnostic report to clipboard

### Recovery Flow
```
Error Occurs
    ↓
Error Boundary Catches
    ↓
Show Modal with Options
    ↓
User Selects Action
    ↓
Action Executes with Feedback
    ↓
App Recovers or Reloads
```

## What Gets Preserved

### Always Preserved
- `eventra_user` - User session data
- `eventra_token` - Authentication token
- `eventra_refresh_token` - Refresh token
- `eventra_theme` - Theme preference
- `eventra_preferences` - User preferences

### Cleared on Cache Reset
- Browser cache
- SessionStorage
- App-specific localStorage entries
- Service worker cache

### Never Cleared
- Cookies (except session-dependent)
- IndexedDB (if used)
- Auth tokens (explicitly preserved)

## Diagnostic Information Captured

The diagnostic report includes:
- ✅ Error ID (unique reference)
- ✅ Timestamp and URL
- ✅ User Agent and Browser Info
- ✅ Screen Resolution and Device Pixel Ratio
- ✅ Online/Offline Status
- ✅ Full Stack Trace
- ✅ React Component Stack
- ✅ localStorage Snapshot
- ✅ sessionStorage Snapshot
- ✅ Browser Capabilities

## Error Logging

### Automatic Logging
```javascript
// In errorLogger.js
logError(error, errorInfo, extra);
```

### What Gets Logged
1. **Console** - Always logged to browser console
2. **localStorage** - Persisted under `eventra_error_log`
3. **Sentry** - Production only (if DSN configured)

### Accessing Error Log
```javascript
import { getErrorLog, clearErrorLog } from "../utils/errorLogger";

// Retrieve last 10 errors
const errors = getErrorLog();

// Clear error history
clearErrorLog();
```

## Mobile Optimization

### Touch Targets
- All buttons: minimum 44-48px height
- Touch-friendly padding on all interactive elements
- Larger text sizes on small screens

### Responsive Breakpoints
- **Desktop** (1920px+): Full UI with side-by-side buttons
- **Tablet** (768px): Adjusted spacing, grid layouts
- **Mobile** (540px): Stacked buttons, full width
- **Small Mobile** (360px): Compact layout, reduced padding

### Testing on Mobile
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device or custom dimensions
4. Test all recovery actions
```

## Accessibility Features

### Keyboard Navigation
- Tab through all buttons and controls
- Enter/Space to activate buttons
- Esc to close modals (future enhancement)

### Screen Reader Support
- All buttons have descriptive ARIA labels
- Status updates announced via `aria-live`
- Modal properly marked with `role="alertdialog"`
- Hidden elements marked with `aria-hidden`

### Focus Management
- Clear focus visible outlines on all buttons
- Logical tab order
- Focus states properly styled

### Reduced Motion
- Animations disabled for `prefers-reduced-motion`
- Smooth transitions maintained
- No involuntary motion

## Common Issues & Solutions

### Issue: "Try Again" button doesn't work
**Solution**: If clicked 3+ times, auto-upgrades to hard reload. Check browser console for errors.

### Issue: Copy Report button doesn't work
**Solution**: May need clipboard permissions. Try manual copy (select all, Ctrl+C).

### Issue: Cache Reset didn't solve the problem
**Solution**: Try full reload. If issue persists, report with diagnostic report.

### Issue: Can't see diagnostics on mobile
**Solution**: Tap "View Diagnostics" button. On small screens, content scrolls within panel.

## Development Tips

### Testing Error Boundary
```javascript
// Temporarily add error in component
useEffect(() => {
  throw new Error("Test error boundary");
}, []);

// Or create test component
function ErrorTest() {
  throw new Error("Deliberate error for testing");
}
```

### Viewing Error Logs
```javascript
// In browser console
localStorage.getItem('eventra_error_log') // Eventra errors
localStorage.getItem('app_error_log')     // Story-Spark-AI errors

// Parse and view
JSON.parse(localStorage.getItem('eventra_error_log'))
```

### Debugging State Recovery
```javascript
// Check if state was recovered
console.log(window.__EVENTRA_RECOVERED_STATE__);
console.log(window.__EVENTRA_APP_STATE__);

// View state snapshot
const snapshot = sessionStorage.getItem('eventra_state_snapshot');
console.log(JSON.parse(snapshot));
```

## Performance Checklist

- ✅ Animations use GPU acceleration
- ✅ No unnecessary re-renders
- ✅ Error logs capped at 10 entries max
- ✅ Diagnostics load on demand
- ✅ Minimal CSS footprint

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest | ✅ Full |
| Firefox | Latest | ✅ Full |
| Safari | Latest | ✅ Full |
| Edge | Latest | ✅ Full |
| Mobile Browsers | Latest | ✅ Full |
| IE 11 | - | ⚠️ Partial |

## Best Practices

1. **Use ErrorBoundary at multiple levels**
   - Root level for critical errors
   - Section level for isolated features

2. **Don't suppress errors silently**
   - Use error logs for debugging
   - Report patterns to development team

3. **Preserve user sessions**
   - Always keep auth tokens safe
   - Cache reset preserves preferences

4. **Test recovery actions**
   - Verify soft retry works
   - Confirm cache reset maintains auth
   - Test on various devices

5. **Monitor error patterns**
   - Review localStorage error logs
   - Set up Sentry alerts for production
   - Investigate recurring errors

## Quick Troubleshooting

```
Issue                          | Quick Fix
-------------------------------|----------------------------------
App won't respond             | Click "Try Again" (soft retry)
Still not working?            | Click "Reset Cache"
Still broken?                 | Click "Reload Page"
Need to report bug?           | Click "Copy Diagnostic Report"
Want more info?               | Click "View Diagnostics"
Mobile buttons too small?     | This is fixed! (min 48px now)
Can't read on phone?          | Diagnostics scroll within panel
```

## Support Resources

- **Eventra Project**: [/story-website/Eventra/](../Eventra/)
- **Story-Spark-AI Project**: [/story-website/story-spark-ai/](../story-spark-ai/)
- **Error Logger**: [src/utils/errorLogger.js](../Eventra/src/utils/errorLogger.js)
- **Error Boundary**: [src/components/common/ErrorBoundary.jsx](../Eventra/src/components/common/ErrorBoundary.jsx)

---

**Last Updated**: May 2026 | **Program**: GSSOC'26
