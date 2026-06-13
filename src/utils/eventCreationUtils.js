import { parseTimeString } from "./timezoneUtils";

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const parsed = parseTimeString(timeStr);
  if (!parsed) return 0;

  return parsed.hours * 60 + parsed.minutes;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
};

export const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  return null;
};