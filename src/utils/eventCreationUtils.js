import { parseTimeString, resolveEventInstant } from "./timezoneUtils.js";

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const parsed = parseTimeString(timeStr);
  if (!parsed) return 0;

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

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

const formatLocalDateTime = (date) => date.toISOString().slice(0, 19);

const buildLocationString = (formData) => {
  if (formData.isVirtual) {
    const link = formData.virtualLink?.trim();
    return link || "Virtual";
  }

  const name = formData.location?.name?.trim() || "";
  const address = formData.location?.address?.trim() || "";
  if (name && address) return `${name}, ${address}`;
  return name || address || "";
};

export const buildEventPayload = (formData) => {
  const eventStartDate = resolveEventInstant(
    formData.isMultiDay ? formData.startDate : formData.date,
    formData.startTime,
    formData.timezone,
  );
  const eventEndDate = resolveEventInstant(
    formData.isMultiDay ? formData.endDate : formData.date,
    formData.endTime,
    formData.timezone,
  );

  if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
    throw new Error("Invalid date or time format");
  }

  const payload = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    location: buildLocationString(formData),
    eventDate: formatLocalDateTime(eventStartDate),
    capacity: formData.capacity ? Number(formData.capacity) : null,
    isPublic: formData.isPublic,
    category: formData.category,
    tags: formData.tags.filter((tag) => tag.trim()),
  };

  const imageUrl = formData.imageUrl?.trim();
  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  return payload;
};
