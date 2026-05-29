# Event Loading Skeletons Guide

Provide animated placeholder layouts while data is resolved from backend endpoints.

## Component Structure
```jsx
const CardSkeleton = () => (
  <div className="skeleton-card animate-pulse">
    <div className="skeleton-thumbnail" />
    <div className="skeleton-title" />
  </div>
);
```