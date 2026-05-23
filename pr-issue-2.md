# Pull Request: Refactor Form Inputs for Accessibility and Contrast (#Issue2)

## Description
This PR addresses poor text-to-background contrast ratios and static color designs in forms (such as Sign-in, Sign-up, Recovery, and Feedback) by integrating theme-specific variables (`var(--input-bg)`, `var(--input-text)`) and modern, desaturated SaaS-style components.

## Changes Made
- **[MODIFY] `src/index.css`**:
  - Integrated desaturated light/dark theme variables for backgrounds, sidebars, borders, active focus accents (`var(--color-primary)`), and soft scrollbars.
  - Modernized global `.btn-primary`, `.btn-secondary`, and `.text-gradient` elements to use CSS variables, ensuring excellent contrast in both light and dark environments.
- **[MODIFY] `src/components/auth/Auth.css`**:
  - Replaced the high-intensity background gradient on authorization pages with `var(--bg-gradient)`.
  - Refactored form groups, input boxes, selectors, and dynamic indicators to adapt correctly to the active theme.
  - Implemented an elegant, high-contrast input focus ring (`rgba(59, 130, 246, 0.15)`) to improve focus visibility.
- **[MODIFY] `src/Pages/Feedback/FeedbackPage.css`**:
  - Converted form textareas, inputs, floating labels, selects, and submit button properties to respect the theme system, ensuring excellent legibility in all layouts.
  - Modernized the sidebar with a professional desaturated background (`var(--bg-secondary)`).
- **[MODIFY] `src/App.css`**:
  - Replaced saturated backgrounds and cards across primary pages (Events, Hackathons, Projects) with modern SaaS layout spacing and dynamic, light-slate card grids.

## Verification and Testing
- **Theme Accessibility**: Validated input text readability and placeholder contrast across Light and Dark theme selections.
- **Build Status**: Verified that the application compiles cleanly without any errors.
