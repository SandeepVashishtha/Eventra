export const DEFAULT_EVENTS_PER_PAGE = 6;
export const EVENTS_PER_PAGE_OPTIONS = [6, 9, 12];

export const getTotalPages = (totalEvents, eventsPerPage) => {
  if (totalEvents <= 0) {
    return 1;
  }

  return Math.ceil(totalEvents / eventsPerPage);
};

export const clampPage = (page, totalPages) => {
  return Math.min(Math.max(page, 1), totalPages);
};

export const getPaginatedEvents = (events, currentPage, eventsPerPage) => {
  const startIndex = (currentPage - 1) * eventsPerPage;
  return events.slice(startIndex, startIndex + eventsPerPage);
};

export const getVisiblePaginationPages = (currentPage, totalPages, siblingCount = 2) => {
  const firstVisiblePage = Math.max(1, currentPage - siblingCount);
  const lastVisiblePage = Math.min(totalPages, currentPage + siblingCount);

  return {
    firstVisiblePage,
    lastVisiblePage,
    pages: Array.from(
      { length: lastVisiblePage - firstVisiblePage + 1 },
      (_, index) => firstVisiblePage + index
    ),
  };
};

export const getEventDateTime = (event) => {
  if (!event?.date) return null;
  const time = event.time || "23:59";
  const parsed = new Date(`${event.date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? new Date(event.date) : parsed;
};

export const getEventTimingStatus = (event, now = new Date()) => {
  const eventDateTime = getEventDateTime(event);
  if (!eventDateTime) {
    return event?.status === "past" ? "past" : "upcoming";
  }
  return eventDateTime < now ? "past" : "upcoming";
};

export const filterEventsByType = (events, filterType, now = new Date()) => {
  return events.filter((event) => {
    if (filterType === "all") return true;
    if (filterType === "upcoming" || filterType === "past") {
      return getEventTimingStatus(event, now) === filterType;
    }
    return event.type === filterType;
  });
};

export const sortEventsByDate = (events, sortType) => {
  const sorted = [...events];

  if (sortType === "Newest") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortType === "Upcoming") {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return sorted;
};
