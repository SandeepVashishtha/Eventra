/**
 * INTEGRATION GUIDE: Post-Event Feedback System
 * 
 * This guide shows how to integrate the feedback system across your app.
 */

// ============================================================================
// 1. IN EVENT CARD (src/Pages/Events/EventCard.js)
// ============================================================================

/*
At the top of EventCard.js, add:

import { FeedbackButton } from "../../components/feedback";

Then in the action buttons section (around where bookmark/share buttons are):

<FeedbackButton event={event} className="ml-2" />

Or if you want to show it in the status area instead:

{isPastEvent && <FeedbackButton event={event} />}
*/

// ============================================================================
// 2. IN EVENT DETAILS PAGE (src/Pages/Events/EventDetails.jsx)
// ============================================================================

/*
Add to the top:

import { FeedbackButton, FeedbackSummary } from "../../components/feedback";

Then add the button in your detail page header/actions:

<FeedbackButton event={event} className="w-full sm:w-auto" />

And add the summary below event description or in a dedicated section:

{event && <FeedbackSummary eventId={event.id} />}
*/

// ============================================================================
// 3. IN SAVED EVENTS PAGE (src/Pages/SavedEventsPage.jsx)
// ============================================================================

/*
import { FeedbackButton, FeedbackSummary } from "../../components/feedback";

For each past event in your list, add the button and summary:

{isPastEvent && (
  <>
    <FeedbackButton event={event} />
    <FeedbackSummary eventId={event.id} compact={true} />
  </>
)}
*/

// ============================================================================
// 4. IN USER DASHBOARD (src/Pages/UserDashboard.js)
// ============================================================================

/*
Show attended events with feedback option:

import { FeedbackButton } from "../../components/feedback";

<section className="mt-8">
  <h2 className="text-2xl font-bold mb-4">Past Events</h2>
  <div className="grid gap-4">
    {pastEvents.map((event) => (
      <div key={event.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
        <div>
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleDateString()}</p>
        </div>
        <FeedbackButton event={event} />
      </div>
    ))}
  </div>
</section>
*/

// ============================================================================
// 5. ACCESSING FEEDBACK DATA PROGRAMMATICALLY
// ============================================================================

/*
In any component, you can access feedback data:

import {
  getEventFeedback,
  getAverageRating,
  getRecommendationStats,
  getTagStats,
  getUserFeedback,
  hasUserSubmittedFeedback,
} from "../../utils/feedbackUtils";

// Get all feedback for an event
const allFeedback = getEventFeedback(eventId);

// Get statistics
const stats = getAverageRating(eventId);
console.log(stats.average, stats.count);

// Check if user submitted feedback
const hasSubmitted = hasUserSubmittedFeedback(eventId);

// Get recommendation percentage
const recommendations = getRecommendationStats(eventId);
console.log(recommendations.percentage);

// Get popular tags
const tags = getTagStats(eventId);
console.log(tags); // { "Great Speaker": 5, "Well Organized": 3, ... }
*/

// ============================================================================
// 6. FUTURE ADMIN ANALYTICS DASHBOARD
// ============================================================================

/*
Create a new page: src/Pages/Admin/FeedbackAnalytics.jsx

This page would:
- Show average ratings across all events
- Display trending tags
- Show recommendation trends
- Export feedback as CSV

import { exportFeedbackAsCSV, getEventFeedback } from "../../utils/feedbackUtils";

const handleExport = (eventId) => {
  const csv = exportFeedbackAsCSV(eventId);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `feedback-${eventId}.csv`;
  a.click();
};
*/

// ============================================================================
// 7. STYLING NOTES
// ============================================================================

/*
- All components use Tailwind CSS with dark mode support
- Uses lucide-react for icons (Star, MessageSquare, ThumbsUp, ThumbsDown)
- Uses framer-motion for smooth animations
- Uses react-toastify for notifications (ensure ToastContainer is in App.jsx)

localStorage key: 'eventra_feedback'
Feedback object structure:
{
  eventId: string,
  rating: 1-5,
  comment: string (optional),
  tags: string[] (optional),
  recommend: boolean (optional),
  userId: string,
  submittedAt: ISO timestamp
}
*/

// ============================================================================
// 8. TESTING THE FEATURE
// ============================================================================

/*
In your browser console:

// Save test feedback
const { saveFeedback } = await import('./src/utils/feedbackUtils.js');
saveFeedback('test-event-1', {
  rating: 5,
  comment: 'Amazing event!',
  tags: ['Great Speaker', 'Well Organized'],
  recommend: true,
  userId: 'test-user'
});

// View feedback
const { getEventFeedback } = await import('./src/utils/feedbackUtils.js');
console.log(getEventFeedback('test-event-1'));

// Get stats
const { getAverageRating } = await import('./src/utils/feedbackUtils.js');
console.log(getAverageRating('test-event-1'));
*/

// ============================================================================
// 9. PHASE 2 ENHANCEMENTS (Not in MVP)
// ============================================================================

/*
These features can be added later:

1. Backend sync:
   - Move feedback from localStorage to database
   - Real-time updates across users
   - User authentication for feedback attribution

2. Analytics:
   - Sentiment analysis of comments
   - Trending tags over time
   - Export to Excel/PDF reports
   - Dashboard for organizers

3. Social features:
   - Publicly visible feedback (with user permission)
   - Feedback notifications for organizers
   - Response/reply system for organizers

4. Advanced features:
   - AI summaries of feedback
   - Anomaly detection (spam flagging)
   - Comparison with similar events
   - Feedback templates per event type

5. Notifications:
   - Email summary of feedback
   - Real-time notification when feedback submitted
   - Weekly digest for organizers
*/

export const FeedbackIntegrationGuide = "See comments above for implementation details";


### API Rate Limiting Configuration
- Enforce a 60-second cooldown window for authentication requests.
