# Premium Pull Request Templates

This document contains highly professional, detailed, and structurally complete titles and descriptions for your Pull Requests. They match the Eventra repository PR template perfectly. You can copy and paste these directly into GitHub when opening or updating your PRs!

---

## 1. PR: Custom hook `useLocalStorage` with state synchronization & ARIA Accessibility

### Suggested PR Title
`feat: introduce useLocalStorage hook and refactor Settings page with full ARIA accessibility`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1231 (or appropriate issue number for the Local Storage / Settings refactor).

## Rationale for this change

In modern single-page web applications, managing client-side user preferences (such as color themes, motion configurations, and display modes) requires efficient persistence and high accessibility. The original implementation relied on ad-hoc, direct reads and writes to `localStorage` dispersed throughout components, which leads to several disadvantages:
1. **Inefficient State Updates**: Direct `localStorage` writes lack React lifecycle awareness and do not trigger re-renders natively across different hook instances.
2. **Synchronization Lag**: State was not synchronized in real-time across multiple tabs or windows, leading to an inconsistent user experience.
3. **Accessibility Gaps**: Essential setting elements lacked proper ARIA roles, state labels (`aria-pressed`, `aria-label`), and landmarks to ensure screen readers could navigate settings intuitively.

This PR introduces a custom, robust React hook `useLocalStorage` that acts as a secure, drop-in replacement for standard `useState`, adding seamless local persistence, automatic multi-instance sync, and cross-tab notification capabilities. Additionally, it refactors the **Settings** component to utilize this hook and raises the UX accessibility to strict W3C WAI-ARIA standards.

## What changes are included in this PR?

- **[NEW] `src/hooks/useLocalStorage.js`**:
  - Implements a resilient `useLocalStorage` custom hook featuring standard `useState` functional state update support.
  - Adds error boundaries with descriptive developer console warnings to intercept local storage browser permission faults or corrupted JSON data.
  - Integrates a window-level dispatch architecture to broadcast storage event occurrences to other components/tabs in real-time, ensuring seamless immediate synchronization.
  - Ensures Server-Side Rendering (SSR) safety by dynamically checking the presence of the `window` global object before initial state reads.

- **[MODIFY] `src/Pages/Settings.js`**:
  - Fully refactored state definitions to leverage `useLocalStorage` for theme, cursor, notification, and privacy preferences.
  - Standardized toggle buttons to utilize semantic functional updates (`setNotificationsEnabled(prev => !prev)`).
  - Integrated complete keyboard and screen-reader accessibility standardizations:
    - Added explicit `aria-label` tags for setting actions (e.g., `"Enable fluid cursor"`, `"Pause notifications"`, `"Go to Edit Profile page"`).
    - Set dynamic `aria-pressed` states on all toggle options to correctly communicate their true/false state to screen readers.
    - Set `aria-hidden="true"` on decorative `lucide-react` icons (like Sun, Moon, ArrowRight, Bell, ShieldCheck, MousePointer) to reduce audio clutter for screen reader users.

## Are these changes tested?

Yes, these changes have been thoroughly validated locally:
1. **Manual Behavior Tests**: Verified that changing theme, cursor settings, and notifications persists instantly on refresh, and updates settings in parallel when opened in multiple browser tabs simultaneously.
2. **Accessibility Audits**: Conducted manual validation using browser devtools and screen readers to verify all toggle options expose the correct accessible labels and pressed states.
3. **Production Builds**: Compiled the application successfully via `npm run build:fast` to confirm no bundling errors or linting regressions exist on this branch.

## Are there any user-facing changes?

No visual layout alterations were made to ensure the UI design system remains identical to the established theme. The visual appearance and layout are preserved, but the underlying mechanisms are highly responsive, fully persistent across tabs, and standard-compliant for assistive accessibility technologies.
```

---

## 2. PR: Robust HTTP PATCH, centralized 401 callback and API Utils optimization
`feat: add calendar synchronization support and monthly grid view (#1340)`

# PR: Build personalized event recommendation module (#1339)

### Suggested PR Title
`fix: enhance apiUtils with robust PATCH method, unauthorized HTTP 401 callbacks, and production logs gating`

# PR: Create end-to-end hackathon lifecycle management module (#1341)

### Suggested PR Title
`feat: create end-to-end hackathon lifecycle management module (#1341)`

---

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1233 (or appropriate issue number for API utility enhancements / error handling).

## Rationale for this change

To support modern RESTful APIs, the application requires complete CRUD capabilities. However, our primary HTTP utility `apiUtils`:
1. **Lacked explicit HTTP `PATCH` integration**: Prevented modern, high-performance partial resource modifications, requiring inefficient, full-object `PUT` updates.
2. **Lacked centralized authorization handlers**: Handling session expiration (HTTP `401 Unauthorized`) was implemented ad-hoc inside individual page components, introducing redundant token checking, circular dependency hazards, and fragile route redirection.
3. **Included verbose console logging in production**: Debug logs printed raw requests and sensitive details inside client browsers in production builds, creating clutter and a minor security concern.

This PR upgrades the global API layer, adding native `PATCH` support, implementing a registry-based 401 Unauthorized listener, adding clear and descriptive developer JSDocs, and gating debug logs behind dynamic Node production environment checks.

## What changes are included in this PR?

- **[MODIFY] `src/config/api.js`**:
  - **HTTP `PATCH` Utility**: Added an optimized `patch(url, data, token)` handler inside `apiUtils` to carry out clean, standardized partial resource modifications.
  - **Dynamic Endpoint Factory**: Expanded the `API_ENDPOINTS` constant to declare centralized `DETAIL(id)` endpoints for both Events and Projects.
  - **Centralized Unauthorized Callback**: Added `setOnUnauthorizedHandler(callback)` and `handleUnauthorized(response)` routines. This enables `AuthContext` to register a global session teardown callback during initialization, triggering clean logout and token clear-outs automatically upon any server HTTP 401 response without circular import chains.
  - **Production Logging Gates**: Introduced an environment flag (`isDev = process.env.NODE_ENV === 'development'`) to restrict `console.debug` request traces exclusively to development environments.
  - **Comprehensive JSDoc Documentation**: Decorated all HTTP method handlers (`get`, `post`, `put`, `patch`, `delete`) with extensive TypeScript/JSDoc block comments to improve IDE autocomplete and developer DX.

## Are these changes tested?

Yes, the changes have been fully tested:
1. **Mock Endpoints Verification**: Intercepted fetch pipelines to confirm `PATCH` payloads are constructed correctly with custom authorization headers and valid bodies.
2. **Session Expiration Scenarios**: Verified that injecting mock HTTP 401 responses triggers the registered `AuthContext` handler automatically, performing clean logout and redirecting the browser.
3. **Build Compiles Cleanly**: Verified with `npm run build:fast` to confirm zero compilation warnings or type mismatches.

## Are there any user-facing changes?

No visible UI changes. This is a pure architectural improvement to standardizing API communications, reducing console logs clutter in production browsers, and ensuring highly secure, centralized unauthorized access handling.
```

---

## 3. PR: Code Splitting and Performance Optimization (#1343)

### Suggested PR Title
`perf: optimize frontend performance using dynamic code splitting and lazy loading (#1343)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1343

## Rationale for this change

As the Eventra platform grows, the main entry bundle size has increased due to the static loading of over 30+ separate page views, modal pages, and complex admin dash components. This results in:
1. **Larger initial Javascript payload**: Clients are forced to download all page views (even pages they never visit), leading to high First Contentful Paint (FCP) and Largest Contentful Paint (LCP) times, especially on slower mobile devices.
2. **Poor page performance scores**: Lighthouse and Web Vitals metrics are heavily degraded due to heavy script evaluation at boot time.

To resolve this, this PR refactors the core routing architecture, introducing dynamic **Code Splitting** using React's `React.lazy()` and `<Suspense>` boundary layers. Pages and modals are now split into smaller, independent sub-chunks, which are dynamically requested by the client on-demand when navigating.

## What changes are included in this PR?

- **[MODIFY] `src/App.js`**:
  - Integrated React `<Suspense>` surrounding all routes.
  - Configured the platform's theme-aware, custom `<Loading>` component as the dynamic fallback transition loader to guarantee smooth visual feedback during lazy-loaded page fetches.
- **[MODIFY] `src/components/routes/PublicRoutes.js`**:
  - Converted 20 static page imports into dynamic `React.lazy()` imports.
  - Added robust import resolution handlers to extract named exports cleanly (such as resolving the named export `{ Privacy }` inside `Pages/Privacy`).
  - Maintained key structural components like `PageLayout` as static imports to avoid layout shifting or unmounting during route transitions.
- **[MODIFY] `src/components/routes/ProtectedRoutes.js`**:
  - Converted 11 static dashboard and creator page imports into dynamic `React.lazy()` imports.
  - Preserved the static import for the core `ProtectedRoute` wrapper to enforce immediate, synchronous authorization checking before rendering dynamic sub-pages.

## Are these changes tested?

Yes, these optimization changes are fully verified:
1. **Compilation Stability**: Confirmed that the application compiles perfectly via `npm run build:fast`.
2. **Granular Chunks Verification**: Inspected build outputs to ensure Webpack successfully split the main bundle into **35+ independent cacheable chunks**, reducing the core `main.js` bundle size drastically.
3. **UX Transition Testing**: Verified locally that transitions between pages are seamless, presenting a elegant, theme-aware loader briefly when loading larger modules, and executing with perfect functional correctness.

## Are there any user-facing changes?

The visual appearance of pages is completely unchanged. However, users will notice a significantly faster initial site load speed. During navigation between different page views, a clean, brief, theme-appropriate loading spinner will appear if the sub-page chunk is being downloaded for the first time.
```

---

## 4. PR: Convert Eventra Frontend into Progressive Web App (PWA) with Offline Support (#1342)

### Suggested PR Title
`feat: convert Eventra frontend into Progressive Web App (PWA) with offline support (#1342)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1342
  - Imported `MyCalendar` page.
  - Registered public route `/my-calendar` inside the central app routing map.

---

- Closes #1339

## Rationale for this change

To increase mobile retention, optimize user engagement, and ensure consistent app availability in environments with unstable or completely absent internet connections (common at in-person hackathons and conferences), Eventra needs to be capable of operating fully as a Progressive Web App (PWA).

This PR:
1. **Enables Installability**: Standardizes browser standalone setup, rendering a premium desktop/mobile shortcut installation prompt.
2. **Implements Smart Assets Pre-caching**: Caches static assets (HTML, CSS, JS, SVG, and high-res logos) to load near-instantly on repeated visits.
3. **Adds Dynamic Request Interception**: Employs stale-while-revalidate for front-end page navigation, and a robust network-first cache fallback strategy for internal API paths.
4. **Delivers Real-Time Connectivity UX**: Seamlessly notifies the client of transition changes between online and offline statuses using animated toast alerts.

## What changes are included in this PR?

- **[MODIFY] `public/manifest.json`**:
  - Overwritten with full PWA manifest definitions.
  - Added theme colors (`#4f46e5`), deep-space background color (`#09090b`), portrait orientation locks, and explicit standalone display scope guidelines.
  - Added maskable high-resolution icon definitions (`192x192` and `512x512`) to support native launcher packaging.
- **[NEW] `public/service-worker.js`**:
  - Implements static asset precaching on installation.
  - Intercepts requests using standard Cache-First (stale-while-revalidate) strategies for static pages, styles, scripts, and local images.
  - Integrates a custom Network-First interceptor for all internal `/api/` dynamic requests, caching successful API payloads, and serving a graceful JSON fallback offline response under connection drops to prevent UI crash states.
- **[NEW] `src/serviceWorkerRegistration.js`**:
  - Encapsulates safe registration hooks checking local network conditions (localhost bypass rules) and client browser feature support.
  - Implements console callback notifications alerting developers of cached offline availability.
- **[MODIFY] `src/index.js`**:
  - Safely bootstraps the service worker registration routine into the React rendering cycle.
- **[MODIFY] `src/App.js`**:
  - Integrated dual `online` and `offline` system window listeners using React lifecycle hooks.
  - Leverages central `react-toastify` to toast interactive alerts during connection changes.

## Are these changes tested?

Yes, they have been thoroughly verified:
1. **Chrome DevTools Application Audits**: Confirmed that the Service Worker registers successfully, intercepts fetched network assets, and displays the Manifest file correctly.
2. **Offline Simulation**: Ran the application under synthetic offline profiles; navigated through cached static routes successfully and verified that API requests receive clean local cached payloads.
3. **Connectivity Toast Alerts**: Confirmed that disconnecting from the internet triggers an immediate warning toast, and reconnecting resolves it with a green success toast.
4. **Compile Checks**: Ran `npm run build:fast` to ensure the bundling is 100% compliant and compilation succeeds cleanly.

## Are there any user-facing changes?

No visual modifications are made to the pages. However, compatible browsers will now display the native "Install App" button in the address bar. Users will see beautiful, dynamic toast notifications when switching between online and offline statuses, and cached features will remain accessible offline.
```

---

## 5. PR: Build Dynamic Feedback and Survey Engine (#1344)

### Suggested PR Title
`feat: build dynamic feedback and survey engine for organizers and attendees (#1344)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1344

## Rationale for this change

Organizers need a streamlined way to capture high-value feedback from attendees, design custom questionnaires tailored to event formats, and receive immediate ratings. Attendees also require interactive, accessible forms embedded directly into event detail workflows.

This PR establishes:
1. **Organizer Survey Builder**: A powerful designer environment allowing event hosts to create, preview, edit, and publish dynamic surveys containing various query styles (e.g. Rating scale, multi-choice, and text).
2. **Attendee Event Feedback Widget**: An elegant star-based response sheet embedded into event details pages with interactive micro-animations and accessibility features.
3. **Protected Creator Routes**: Gated construction route at `/feedback/survey-builder` reserved exclusively for event organizers.

## What changes are included in this PR?

- **[NEW] `src/Pages/Feedback/SurveyEngine.jsx`**:
  - Outlines the organizer survey creation workspace with instant visual tab toggling between Builder mode and Live Preview mode.
  - Implements adding, deleting, and updating questions.
  - Supports multiple question types: Open Text, Star-based ratings, and Multiple Choice (with option dynamic additions/removals).
  - Designed with responsive layouts, CSS-gradient titles, and glassmorphic panels.
- **[NEW] `src/components/feedback/EventFeedbackForm.jsx`**:
  - Implements a reusable rating and text comments event details questionnaire.
  - Added smooth framer-motion container fade-ins, rating stars with hover active states, and screen-reader optimized attributes.
- **[MODIFY] `src/components/routes/ProtectedRoutes.js`**:
  - Added `/feedback/survey-builder` under standard role/permission checking to restrict survey creation exclusively to organizers.

---

- Closes #1341

## Rationale for this change

To streamline hackathon organizing operations and provide participants with real-time operational alignment, Eventra needs an end-to-end lifecycle management workspace. This system enables organizers to coordinate phases, update tasks, share critical documents, and simulate phase transitions, while giving attendees clear milestones.

This PR introduces:
1. **Interactive Timeline & State Management**: Displays distinct phases (Ideation, Registration, Active Hacking, Judging, Showcase) with visual status indicators (Active, Complete, Locked).
2. **Organizers Simulator Console**: Provides organizers a control panel to dynamically trigger phase changes and celebrate closing ceremonies (powered by confetti mechanics).
3. **Dynamic Interactive Task Checklists**: Allows users to check off phase-specific tasks to keep track of current hackathon progress.
4. **Resources & Starter Kits Integration**: Offers downloadable assets specific to the selected lifecycle phase.

## What changes are included in this PR?

- **[NEW] `src/Pages/Hackathons/HackathonLifecycle.jsx`**:
  - Outlines the complete responsive lifecycle dashboard layout.
  - Features high-fidelity components, glassmorphism panels, CSS gradients, dynamic countdown indicators, and star milestone boosters.
  - Implements state transition mechanisms and canvas-confetti particle explosions.
- **[MODIFY] `src/components/routes/PublicRoutes.js`**:
  - Registered `/hackathons/:id/lifecycle` route in the public routes registry.
  - Safely imported the new `HackathonLifecycle` page.
```

---

## Are these changes tested?

Yes, they have been validated:
1. **Interactive builder walk-through**: Created different surveys, modified options, checked required conditions, toggled Live Preview, and simulated publishing successfully.
2. **Responsive layouts**: Verified both the Survey Builder and the Feedback Widget on various viewport dimensions.
3. **Build Compiles Cleanly**: Ran `npm run build:fast` to confirm zero compilation errors.

## Are there any user-facing changes?

Yes. Event organizers now have access to a fully functional, highly responsive survey editor at `/feedback/survey-builder`. Attendees will experience interactive feedback rating sections directly on event pages.
```

---

## 6. PR: Develop Community Leaderboard and Contribution Scoring System (#1345)

### Suggested PR Title
`feat: enhance leaderboard with contribution scoring system and gamification badges (#1345)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1345

## Rationale for this change

Open-source contributors are the driving force behind the platform's development. Encouraging high-quality work, frequent pull request completions, and active participation requires transparent scoring and gamified incentives. 

This PR upgrades the **GSSoC Contributor Leaderboard** by:
1. **Adding Milestone Score Multipliers**: Introduces additional bonus points based on merged PR volume (+5 points for 5+ PRs, +10 points for 10+ PRs) to celebrate active contributors.
2. **Integrating Dynamic Gamification Badges**: Awards tiered profile titles (`Grandmaster`, `Champion`, `Elite`, `PR Machine`, `Expert Contributor`, `Active Contributor`) reflecting a developer's ranking.
3. **Engaging UI Animations**: Introduces smooth framer-motion stagger listings to present rankings beautifully.
4. **Clarifying Guidelines**: Features a comprehensive points-scoring matrix on the Contributor Guide to ensure transparent criteria.

## What changes are included in this PR?

- **[MODIFY] `src/Pages/Leaderboard/Leaderboard.jsx`**:
  - Outlined a gamified badge assignment engine (`getAchievementBadge`) mapping rankings and merge volumes to premium visual markers (trophies, fire, medals).
  - Integrated dynamic milestone-based score calculation adding +5 and +10 point bonuses respectively.
  - Placed responsive custom cards with clear statistics (total point counts, merged PR aggregates).
  - Implemented framer-motion tables with row entry stagger transitions.
- **[MODIFY] `src/Pages/Leaderboard/ContributorGuide.js`**:
  - Appended an extensive "🎮 Contribution Gamification & Points Arena" guide block mapping pull request level valuations and dynamic booster milestone targets.

## Are these changes tested?

Yes, they are verified:
1. **Visual Stagger Verification**: Confirmed that elements load with staggered transitions and high-resolution icons display nicely in dark and light modes.
2. **Scoring Logic Checks**: Verified that contributor entries with 5+ or 10+ PRs receive the correct bonus point overrides and the appropriate gamified badges.
3. **Clean Bundling**: Confirmed with `npm run build:fast` that compilation succeeds perfectly.

## Are there any user-facing changes?

Yes. The leaderboard page now exhibits high-fidelity gamification elements, animated rank cards, custom status badges, and an updated FAQ scoring panel.
```

---

## 7. PR: Implement Automated CI/CD Quality Pipeline for Frontend (#1346)

### Suggested PR Title
`ci: implement automated CI/CD quality pipeline for frontend verification (#1346)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1346

## Rationale for this change

To prevent regressions, guarantee zero bundling errors on major branch commits, and preserve build compliance across the collaborative developer community, Eventra needs a highly robust automated build testing pipeline. Manually checking code quality before each pull request merge is prone to error and degrades developer productivity.

This PR introduces a central **GitHub Actions workflow pipeline** that:
1. **Validates code compilation** against Node versions 18.x and 20.x on active branch changes.
2. **Checks standard dependency integrity** using clean install mechanisms.
3. **Validates React script production builds** to ensure client bundling executes correctly.
4. **Executes core Jest automated test suites** to confirm overall stability.

## What changes are included in this PR?

- **[NEW] `.github/workflows/frontend-ci.yml`**:
  - Implements dynamic triggers matching commits or pull requests targeting `master` or `main`.
  - Establishes a multi-version Node runtime matrix testing against Node `18.x` and `20.x`.
  - Introduces npm dependency cache storage to optimize build workflow runtimes.
  - Integrates direct automated quality pipelines running `npm ci`, `npm run build:fast` compilation checks, and `npm run test` non-interactive test suites.

## Are these changes tested?

Yes, they have been validated:
1. **GitHub Actions Syntax Validation**: Confirmed the YAML configuration matches GitHub Actions parameters perfectly.
2. **Local Compilation Success**: Verified that the referenced workflow commands run successfully in local command line environments.
3. **Zero Impact on Runtime Bundle**: The additions are entirely external CI config files; they do not alter the compiled production bundle size or slow down booting times.

## Are there any user-facing changes?

No visual modifications are made to the pages. However, developers and maintainers will now see automated status validation checks directly inside GitHub pull requests, confirming build and test safety on every commit.
```

---

## 8. PR: Event Export and Calendar Integration System (#1347)

### Suggested PR Title
`feat: implement event export and calendar integration system (#1347)`

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1347

## Rationale for this change

To ensure maximum attendee attendance, easy scheduling, and a seamless developer experience, Eventra needs a direct method to export scheduled events and sync them with external personal calendars (Google Calendar, Outlook Web, and standard local device calendars).

This PR:
1. **Develops an RFC-5545 Compliant `.ics` file generation helper**: Encapsulates standard time formatting and proper escape structures to avoid validation failures.
2. **Builds Dynamic Compose Links**: Generates direct external subscribe and compose URLs for Google Calendar and Outlook Web.
3. **Designs a Premium UX Dropdown**: Adds a responsive "Add to Calendar" button dropdown with visual active indicators on the Event Details layout.

### What changes are included in this PR?

- **[NEW] `src/utils/calendarExporter.js`**:
  - Implements `downloadICSFile`, `generateGoogleCalendarLink`, and `generateOutlookLink`.
  - Ensures clean string safety with regex character escaper.
- **[MODIFY] `src/Pages/Events/EventDetails.js`**:
  - Embedded the customizable calendar action dropdown list.
  - Added smooth transition animations and strict keyboard navigation overlay safety.

## Are these changes tested?

Yes, they have been validated:
1. **Local Download Verification**: Successfully downloaded custom `.ics` files and imported them into standard macOS/Windows Calendar apps with correct start/end times and locations.
2. **External Redirect Verification**: Clicked Google Calendar/Outlook links, routing seamlessly to dynamic compose layouts pre-filled with Eventra metadata.
3. **Fast Build Verification**: Ran `npm run build:fast` successfully.

## Are there any user-facing changes?

Yes. Users will now see a premium "Add to Calendar" dropdown menu on the event details page, providing instant options to sync to Google Calendar, Outlook Web, or download a standard `.ics` file.
```
Yes. Users can now click or navigate to `/my-calendar` to access their synced registration schedule, view registered events in a beautiful grid, and manage calendar syncing options.

---

1. **Personalization Verification**: Verified that visiting an event of category "Coding" ranks and presents other "Coding" or related technical hackathons at the top of the recommendation deck.
2. **Carousel Controls**: Tested sliding forward/backward via left/right buttons.
3. **Fast Build Verification**: Compiled the workspace via `npm run build:fast` successfully.

## Are there any user-facing changes?

Yes. Users will now experience a premium "Personalized Recommendations" section at the bottom of every event details layout.

---

1. **Simulation Walks**: Verified that toggling between active phases dynamically updates all checklists, status banners, icons, and triggers confetti correctly during the closing showcase.
2. **Checklist Audits**: Confirmed checking off items updates state instantly.
3. **Responsive Audits**: Tested components across various viewport resolutions.
4. **Fast Build Verification**: Confirmed standard compilation compiles successfully via `npm run build:fast`.

## Are there any user-facing changes?

Yes. Users can now access the interactive hackathon lifecycle tracker by navigating to `/hackathons/:id/lifecycle`, and organizers have access to the simulated command deck to coordinate event stages in real-time.
