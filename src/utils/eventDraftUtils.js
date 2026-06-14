const getObjValue = (obj, key) => {
  if (!obj) return "";
  if (obj[key] !== undefined) return obj[key];
  return "";
};

const getCoordValue = (loc, key) => {
  if (!loc) return "";
  if (!loc.coordinates) return "";
  if (loc.coordinates[key] !== undefined) return loc.coordinates[key];
  return "";
};

export const getDraftLocation = (loc) => {
  if (!loc) return { name: "", address: "", coordinates: { latitude: "", longitude: "" } };
  if (typeof loc === "string") return { name: loc, address: "", coordinates: { latitude: "", longitude: "" } };
  
  return {
    name: getObjValue(loc, "name"),
    address: getObjValue(loc, "address"),
    coordinates: {
      latitude: getCoordValue(loc, "latitude"),
      longitude: getCoordValue(loc, "longitude"),
    },
  };
};

const createDefaultTier = () => ({
  name: "General Admission",
  price: 0,
  capacity: "",
  description: "Standard event access"
});

const parseTier = (t) => ({
  name: getObjValue(t, "name"),
  price: t.price ?? 0,
  capacity: t.capacity ?? "",
  description: getObjValue(t, "description")
});

export const getDraftTiers = (tiers) => {
  if (!Array.isArray(tiers)) return [createDefaultTier()];
  return tiers.map(parseTier);
};

const parseDateString = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseTimeString = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const getActualStartDate = (evt) => {
  if (evt.startDate) return evt.startDate;
  return evt.date;
};

const getActualEndDate = (evt) => {
  if (evt.endDate) return evt.endDate;
  if (evt.date) return evt.date;
  return evt.startDate;
};

export const getDraftDates = (evt) => {
  const startD = getActualStartDate(evt);
  const endD = getActualEndDate(evt);
  
  const pStart = parseDateString(startD);
  const pEnd = parseDateString(endD);
  
  let isMulti = false;
  if (pStart && pEnd) {
    if (pStart !== pEnd) {
      isMulti = true;
    }
  }

  const isMultiVal = isMulti ? "" : pStart;
  const sDateVal = isMulti ? pStart : "";
  const eDateVal = isMulti ? pEnd : "";

  return {
    isMultiDay: isMulti,
    date: isMultiVal,
    startDate: sDateVal,
    endDate: eDateVal,
    startTime: parseTimeString(startD),
    endTime: parseTimeString(endD),
    registrationStart: parseDateString(evt.registrationStart),
    registrationEnd: parseDateString(evt.registrationEnd),
  };
};

const getDraftTitle = (src) => {
  if (src.title) return `Copy of ${src.title}`;
  return "";
};

const getDraftTimezone = (src) => {
  if (src.timezone) return src.timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getDraftBoolean = (src, key, fallback) => {
  if (src[key] !== undefined) return src[key];
  return fallback;
};

const getDraftBanner = (src) => {
  if (src.image) return src.image;
  if (src.banner) return src.banner;
  return "";
};

const getDraftString = (src, key) => {
  if (src[key]) return src[key];
  return "";
};

const getDraftCapacity = (src) => {
  if (src.capacity != null) return src.capacity;
  return "";
};

const getDraftTags = (src) => {
  if (Array.isArray(src.tags)) return src.tags;
  return [];
};

export const createDuplicateDraft = (sourceEvent) => {
  return {
    title: getDraftTitle(sourceEvent),
    description: getDraftString(sourceEvent, "description"),
    category: getDraftString(sourceEvent, "category"),
    ...getDraftDates(sourceEvent),
    timezone: getDraftTimezone(sourceEvent),
    location: getDraftLocation(sourceEvent.location),
    isVirtual: Boolean(sourceEvent.virtualLink),
    virtualLink: getDraftString(sourceEvent, "virtualLink"),
    capacity: getDraftCapacity(sourceEvent),
    isPublic: getDraftBoolean(sourceEvent, "isPublic", true),
    requiresApproval: getDraftBoolean(sourceEvent, "requiresApproval", false),
    tags: getDraftTags(sourceEvent),
    ticketTiers: getDraftTiers(sourceEvent.ticketTiers),
    banner: null,
    bannerPreview: getDraftBanner(sourceEvent),
  };
};