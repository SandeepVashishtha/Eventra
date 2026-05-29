# Keyboard Navigation and Accessibility Guidelines

Support screen reader focus states by making elements keyboard-navigable.

## Implementation
```jsx
<div 
  tabIndex={0}
  onKeyDown={(e) => { if(e.key === 'Enter') handleNavigation(); }}
/>
```