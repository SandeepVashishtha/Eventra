# LocalStorage Fail-Safe Guide

Always wrap standard LocalStorage requests to prevent client crashes under private browsing configurations.

## Implementation
```javascript
try {
  localStorage.setItem(key, val);
} catch (e) {
  // Fallback to memory context storage
}
```