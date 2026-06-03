export const normalizeStatusString = (status) => {
  if (!status || typeof status !== 'string') return null;

  const normalized = status.trim().toLowerCase();

  const statusMap = {
    upcoming: "upcoming",
    live: "live",
    ongoing: "live",
    "in progress": "live",
    completed: "completed",
    ended: "completed",
    past: "completed",
    done: "completed",
  };

  return statusMap[normalized] || null;
};

export const computeEventStatus = (event) => {
  if (!event || !event.date) {
    return "upcoming";
  }

  const now = new Date();
  const eventDate = new Date(event.date);

  // Prevent silent logic failures on malformed backend dates
  if (isNaN(eventDate.getTime())) {
    return "upcoming"; 
  }

  // Treat the full event day as active
  const endOfDay = new Date(eventDate);
  endOfDay.setHours(23, 59, 59, 999);

  if (now < eventDate) {
    return "upcoming";
  }

  if (now >= eventDate && now <= endOfDay) {
    return "live";
  }

  return "completed";
};