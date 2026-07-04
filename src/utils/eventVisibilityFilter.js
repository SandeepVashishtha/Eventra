/**
 * eventVisibilityFilter.js
 *
 * Enforces event visibility rules based on user authentication and event status.
 * Prevents disclosure of draft/unpublished events to unauthenticated users.
 */

/**
 * Event status constants
 */
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
};

/**
 * Public event statuses visible to unauthenticated users
 */
const PUBLIC_STATUSES = [
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.COMPLETED,
];

/**
 * Organizer-only statuses visible only to event creator
 */
const ORGANIZER_STATUSES = [
  EVENT_STATUS.DRAFT,
  EVENT_STATUS.ARCHIVED,
];

class EventVisibilityFilter {
  /**
   * Check if user can view an event
   */
  canViewEvent(event, currentUserId, isAuthenticated) {
    if (!event) {
      return false;
    }

    // Public events visible to everyone
    if (PUBLIC_STATUSES.includes(event.status)) {
      return true;
    }

    // Organizer-only events visible only to creator
    if (ORGANIZER_STATUSES.includes(event.status)) {
      return isAuthenticated && currentUserId === event.organiserId;
    }

    // Cancelled events visible only to organizer
    if (event.status === EVENT_STATUS.CANCELLED) {
      return isAuthenticated && currentUserId === event.organiserId;
    }

    return false;
  }

  /**
   * Filter array of events based on visibility rules
   */
  filterEvents(events, currentUserId, isAuthenticated) {
    if (!events || !Array.isArray(events)) {
      return [];
    }

    return events.filter(event =>
      this.canViewEvent(event, currentUserId, isAuthenticated)
    );
  }

  /**
   * Filter paginated response
   */
  filterPaginatedResponse(response, currentUserId, isAuthenticated) {
    if (!response) {
      return response;
    }

    // Handle Spring-style page envelope
    if (response.content && Array.isArray(response.content)) {
      const filteredContent = this.filterEvents(
        response.content,
        currentUserId,
        isAuthenticated
      );

      return {
        ...response,
        content: filteredContent,
        // Note: totalElements may now be different from backend count
        // because we're filtering client-side
        filteredCount: filteredContent.length,
      };
    }

    // Handle plain array response
    if (Array.isArray(response)) {
      return this.filterEvents(response, currentUserId, isAuthenticated);
    }

    return response;
  }

  /**
   * Get visibility status message for debugging
   */
  getVisibilityStatus(event, currentUserId, isAuthenticated) {
    if (!event) {
      return 'Invalid event';
    }

    if (PUBLIC_STATUSES.includes(event.status)) {
      return `${event.status} - publicly visible`;
    }

    if (ORGANIZER_STATUSES.includes(event.status)) {
      if (!isAuthenticated) {
        return `${event.status} - hidden from unauthenticated users`;
      }
      if (currentUserId === event.organiserId) {
        return `${event.status} - visible to organizer`;
      }
      return `${event.status} - hidden from other users`;
    }

    if (event.status === EVENT_STATUS.CANCELLED) {
      if (!isAuthenticated) {
        return `${event.status} - hidden from unauthenticated users`;
      }
      if (currentUserId === event.organiserId) {
        return `${event.status} - visible to organizer`;
      }
      return `${event.status} - hidden from other users`;
    }

    return `Unknown status: ${event.status}`;
  }

  /**
   * Validate event status is known
   */
  isValidStatus(status) {
    return Object.values(EVENT_STATUS).includes(status);
  }

  /**
   * Get statuses visible to given user
   */
  getVisibleStatuses(currentUserId, isAuthenticated) {
    if (!isAuthenticated) {
      return [...PUBLIC_STATUSES];
    }

    // Authenticated user sees public events + their own drafts/archived
    return [
      ...PUBLIC_STATUSES,
      ...ORGANIZER_STATUSES,
      EVENT_STATUS.CANCELLED,
    ];
  }
}

export const eventVisibilityFilter = new EventVisibilityFilter();
