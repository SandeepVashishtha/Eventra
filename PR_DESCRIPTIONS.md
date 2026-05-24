# PR: Add calendar synchronization support (#1340)

### Suggested PR Title
`feat: add calendar synchronization support and monthly grid view (#1340)`

# PR: Build personalized event recommendation module (#1339)

### Suggested PR Title
`feat: build personalized event recommendation module and dynamic carousel (#1339)`

# PR: Create end-to-end hackathon lifecycle management module (#1341)

### Suggested PR Title
`feat: create end-to-end hackathon lifecycle management module (#1341)`

---

### PR Description
```markdown
## Which issue does this PR close?

- Closes #1340

## Rationale for this change

To enhance the developer schedule experience, prevent scheduling conflicts, and help attendees manage registered hackathons and events, Eventra needs a centralized calendar view. 

This PR:
1. **Renders a gorgeous interactive monthly Calendar Grid**: Features seamless navigation between months and years.
2. **Exposes dynamic registration states**: Integrates directly with `MyEventsContext` to retrieve active registered events, displaying visual indicator dots on corresponding schedule dates.
3. **Features Date-Specific Detail drawers**: Select a date to inspect event summaries, location states, and times instantly.
4. **Enables fast export synchronization**: Users can click quick-action buttons to export standard iCal `.ics` files or compose sync URLs to Google Calendar and Outlook Web on the fly.
5. **Provides a clean list view toggle**: Users can toggle between the Grid Schedule and a comprehensive chronological registration listing.

## What changes are included in this PR?

- **[NEW] `src/Pages/Calendar/MyCalendar.jsx`**:
  - Full-fidelity calendar page featuring responsive months, interactive date selection, detail summaries, and export synchronization buttons.
  - Standardized keyboard controls and descriptive ARIA landmarks (`role="grid"`, `role="row"`, `role="gridcell"`).
- **[MODIFY] `src/components/routes/PublicRoutes.js`**:
  - Imported `MyCalendar` page.
  - Registered public route `/my-calendar` inside the central app routing map.

---

- Closes #1339

## Rationale for this change

To enhance attendee engagement, discoverability of niche coding events, and personalization of active hackathons, Eventra needs a dynamic and personalized recommendations system. This increases session duration and helps attendees find relevant activities based on category matches and stored developer interest profiles.

This PR introduces:
1. **Personalization Scoring Engine**: Automatically matches pool events against the current event's category (+10 points) and user preferences/interests (+5 points per tag) to rank recommendations in a custom sorted list.
2. **Gorgeous Reusable Slide Carousel**: A high-fidelity card container displaying recommended events with touch and click navigation (Left/Right slide controls).
3. **Micro-Animations & Premium Layouts**: Smooth scaling, hover state transitions, customized Category tags, and visual indicators.
4. **Embedded Context placement**: Rendered at the bottom of standard Event Details pages.

## What changes are included in this PR?

- **[NEW] `src/components/events/EventRecommendations.jsx`**:
  - Implements a self-contained, responsive recommendation system filtering all mock events, scoring them dynamically, and presenting them inside a sleek, animated grid slider.
  - Supports standard ARIA labels, controls roles, and fully keyboard-accessible slide updates.
- **[MODIFY] `src/Pages/Events/EventDetails.js`**:
  - Safely imported and integrated `<EventRecommendations>` at the bottom of the two-column event info board.

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
1. **Interactive Monthly Grid Walks**: Navigated forward and backward across different calendar months, verifying correct layout spacing, leap year boundaries, and weekday offsets.
2. **Context Integration**: Registered for mock events and confirmed they populate automatically as colored indicators in the calendar grid.
3. **Export Integration**: Checked that selected event sync buttons direct properly to Google Calendar / local `.ics` downloads.
4. **Fast Build Verification**: Compiled successfully via `npm run build:fast` with zero failures.

## Are there any user-facing changes?

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
