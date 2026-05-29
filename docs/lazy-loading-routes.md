# Dynamic Routing and Code Splitting Guide

Divide the application footprint using route-level React lazy loading integrations.

## React Split Snippet
```jsx
const SettingsSidebar = React.lazy(() => import('./SettingsSidebar'));
```