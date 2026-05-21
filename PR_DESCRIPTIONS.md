# PR: Add calendar synchronization support (#1340)

### Suggested PR Title
`feat: add calendar synchronization support and monthly grid view (#1340)`

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

## Are these changes tested?

Yes, they have been validated:
1. **Interactive Monthly Grid Walks**: Navigated forward and backward across different calendar months, verifying correct layout spacing, leap year boundaries, and weekday offsets.
2. **Context Integration**: Registered for mock events and confirmed they populate automatically as colored indicators in the calendar grid.
3. **Export Integration**: Checked that selected event sync buttons direct properly to Google Calendar / local `.ics` downloads.
4. **Fast Build Verification**: Compiled successfully via `npm run build:fast` with zero failures.

## Are there any user-facing changes?

Yes. Users can now click or navigate to `/my-calendar` to access their synced registration schedule, view registered events in a beautiful grid, and manage calendar syncing options.
```
