import { parseTimeString } from "./timezoneUtils.js";

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

export const buildEventPayload = (formData) => {
  let coordinates = null;
  if (formData.location?.coordinates?.latitude && formData.location?.coordinates?.longitude) {
    coordinates = validateCoordinates(
      formData.location?.coordinates?.latitude,
      formData.location?.coordinates?.longitude
    );
  }

  const eventStartDate = new Date(
    `${formData.isMultiDay ? formData.startDate : formData.date}T${formData.startTime}`
  );
  const eventEndDate = new Date(
    `${formData.isMultiDay ? formData.endDate : formData.date}T${formData.endTime}`
  );

  if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
    throw new Error("Invalid date or time format");
  }

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    startDate: eventStartDate.toISOString(),
    endDate: eventEndDate.toISOString(),
    timezone: formData.timezone,
    location: formData.isVirtual
      ? null
      : {
          name: formData.location.name.trim(),
          address: formData.location.address?.trim() || "",
          coordinates: coordinates,
        },
    isVirtual: formData.isVirtual,
    virtualLink: formData.isVirtual ? formData.virtualLink.trim() : null,
    capacity: formData.capacity ? Number(formData.capacity) : null,
    isPublic: formData.isPublic,
    requiresApproval: formData.requiresApproval,
    registrationStart: formData.registrationStart
      ? new Date(formData.registrationStart).toISOString()
      : null,
    registrationEnd: formData.registrationEnd
      ? new Date(formData.registrationEnd).toISOString()
      : null,
    category: formData.category,
    tags: formData.tags.filter((tag) => tag.trim()),
    ticketTiers: formData.ticketTiers
      .filter((tier) => tier.name.trim())
      .map((tier) => ({
        name: tier.name.trim(),
        price: Number(tier.price) || 0,
        capacity: tier.capacity ? Number(tier.capacity) : null,
        description: tier.description?.trim() || "",
      })),
    venueMap: formData.venueMap || [],
  };
};
