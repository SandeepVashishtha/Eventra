const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

export const parseEventDateTime = (event) => {
  if (!event?.date) {
    return null;
  }

  const time = event.time?.trim();
  if (time) {
    const match = time.match(TIME_PATTERN);
    if (match) {
      let hours = Number(match[1]);
      const minutes = Number(match[2]);
      const meridiem = match[3].toUpperCase();

      if (meridiem === "PM" && hours < 12) {
        hours += 12;
      } else if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }

      const [year, month, day] = event.date.split("-").map(Number);
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    const parsed = new Date(`${event.date} ${time}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const [year, month, day] = event.date.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

export const getEventTimingStatus = (event, referenceDate = new Date()) => {
  const eventDateTime = parseEventDateTime(event);
  if (!eventDateTime) {
    return event?.status === "past" ? "past" : "upcoming";
  }

  return eventDateTime >= referenceDate ? "upcoming" : "past";
};

export const matchesEventTimingFilter = (event, filterType) => {
  if (filterType === "all") {
    return true;
  }

  if (filterType === "upcoming" || filterType === "past") {
    return getEventTimingStatus(event) === filterType;
  }

  return event.type === filterType;
};
