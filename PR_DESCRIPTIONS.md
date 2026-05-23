# PR: Add calendar synchronization support (#1340)

### Suggested PR Title
`feat: add calendar synchronization support and monthly grid view (#1340)`
# PR: Build personalized event recommendation module (#1339)

### Suggested PR Title
`feat: build personalized event recommendation module and dynamic carousel (#1339)`

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

## Are these changes tested?

Yes, they have been validated:
1. **Interactive Monthly Grid Walks**: Navigated forward and backward across different calendar months, verifying correct layout spacing, leap year boundaries, and weekday offsets.
2. **Context Integration**: Registered for mock events and confirmed they populate automatically as colored indicators in the calendar grid.
3. **Export Integration**: Checked that selected event sync buttons direct properly to Google Calendar / local `.ics` downloads.
4. **Fast Build Verification**: Compiled successfully via `npm run build:fast` with zero failures.

## Are there any user-facing changes?

Yes. Users can now click or navigate to `/my-calendar` to access their synced registration schedule, view registered events in a beautiful grid, and manage calendar syncing options.
1. **Personalization Verification**: Verified that visiting an event of category "Coding" ranks and presents other "Coding" or related technical hackathons at the top of the recommendation deck.
2. **Carousel Controls**: Tested sliding forward/backward via left/right buttons.
3. **Fast Build Verification**: Compiled the workspace via `npm run build:fast` successfully.

## Are there any user-facing changes?

Yes. Users will now experience a premium "Personalized Recommendations" section at the bottom of every event details layout.
```
