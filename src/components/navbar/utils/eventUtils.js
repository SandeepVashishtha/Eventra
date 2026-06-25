export const normalizeStatusString = (status) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

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
  const now = new Date();

  const eventDate = new Date(event.date);

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
