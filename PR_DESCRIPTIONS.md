# PR: Build personalized event recommendation module (#1339)

### Suggested PR Title
`feat: build personalized event recommendation module and dynamic carousel (#1339)`

### PR Description
```markdown
## Which issue does this PR close?

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
1. **Personalization Verification**: Verified that visiting an event of category "Coding" ranks and presents other "Coding" or related technical hackathons at the top of the recommendation deck.
2. **Carousel Controls**: Tested sliding forward/backward via left/right buttons.
3. **Fast Build Verification**: Compiled the workspace via `npm run build:fast` successfully.

## Are there any user-facing changes?

Yes. Users will now experience a premium "Personalized Recommendations" section at the bottom of every event details layout.
```
