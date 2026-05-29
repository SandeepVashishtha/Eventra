# Mobile Grid Responsiveness Guidelines

To prevent column overlapping in the Event Details view component on mobile viewports:

## Styling Fix
Implement the following media query rule in `src/styles/eventDetails.css`:
```css
@media (max-width: 767px) {
  .event-details-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
```