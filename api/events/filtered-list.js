/**
 * api/events/filtered-list.js
 *
 * Secure events listing endpoint that filters out draft/unpublished events
 * from unauthenticated users while allowing organizers to see their own drafts.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Extract user context
    const userId = req.session?.user?.id || req.user?.id;
    const isAuthenticated = !!userId;

    // 2. Get pagination parameters
    const page = parseInt(req.query.page || '0', 10);
    const size = parseInt(req.query.size || '20', 10);

    if (page < 0 || size <= 0 || size > 100) {
      return res.status(400).json({
        message: 'Invalid pagination parameters',
      });
    }

    // 3. Fetch events from database
    const events = await fetchEvents(page, size, isAuthenticated, userId);

    if (!events) {
      return res.status(500).json({ message: 'Failed to fetch events' });
    }

    // 4. Filter events based on visibility rules
    const filtered = filterEventsByVisibility(events, userId, isAuthenticated);

    // 5. Return filtered response
    return res.status(200).json({
      success: true,
      content: filtered,
      page,
      size,
      count: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Events listing error:', error);
    return res.status(500).json({
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
}

/**
 * Fetch events from database
 * Query should only return published events for unauthenticated users
 */
async function fetchEvents(page, size, isAuthenticated, userId) {
  // In production, this would call a database query:
  // If unauthenticated:
  //   SELECT * FROM events WHERE status = 'PUBLISHED' ORDER BY startDate ASC LIMIT size OFFSET page*size
  // If authenticated:
  //   SELECT * FROM events WHERE status = 'PUBLISHED' OR (status IN ('DRAFT', 'ARCHIVED', 'CANCELLED') AND organiserId = userId)
  //   ORDER BY startDate ASC LIMIT size OFFSET page*size

  // Mock implementation
  const mockEvents = [
    {
      id: 'event-1',
      title: 'Public Conference',
      status: 'PUBLISHED',
      organiserId: 'org-1',
      eventDate: '2026-08-15',
    },
    {
      id: 'event-2',
      title: 'Draft Event',
      status: 'DRAFT',
      organiserId: userId || 'org-2',
      eventDate: '2026-09-01',
    },
    {
      id: 'event-3',
      title: 'Another Public Event',
      status: 'PUBLISHED',
      organiserId: 'org-3',
      eventDate: '2026-08-20',
    },
  ];

  return mockEvents;
}

/**
 * Filter events based on visibility rules
 */
function filterEventsByVisibility(events, userId, isAuthenticated) {
  const PUBLIC_STATUSES = ['PUBLISHED', 'COMPLETED'];
  const ORGANIZER_STATUSES = ['DRAFT', 'ARCHIVED'];

  return events.filter(event => {
    // Public events visible to everyone
    if (PUBLIC_STATUSES.includes(event.status)) {
      return true;
    }

    // Organizer-only events visible only to creator
    if (ORGANIZER_STATUSES.includes(event.status)) {
      return isAuthenticated && userId === event.organiserId;
    }

    // Cancelled events visible only to organizer
    if (event.status === 'CANCELLED') {
      return isAuthenticated && userId === event.organiserId;
    }

    return false;
  });
}
