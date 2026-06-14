export const getDraftLocation = (loc) => {
  if (!loc) return { name: "", address: "", coordinates: { latitude: "", longitude: "" } };
  if (typeof loc === "string") return { name: loc, address: "", coordinates: { latitude: "", longitude: "" } };
  
  const lat = loc.coordinates && loc.coordinates.latitude !== undefined ? loc.coordinates.latitude : "";
  const lng = loc.coordinates && loc.coordinates.longitude !== undefined ? loc.coordinates.longitude : "";
  
  return {
    name: loc.name ? loc.name : "",
    address: loc.address ? loc.address : "",
    coordinates: { latitude: lat, longitude: lng },
  };
};

export const getDraftTiers = (tiers) => {
  if (!Array.isArray(tiers)) return [{ name: "General Admission", price: 0, capacity: "", description: "Standard event access" }];
  return tiers.map(t => ({ name: t.name || "", price: t.price ?? 0, capacity: t.capacity ?? "", description: t.description || "" }));
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

  return {
    isMultiDay: isMulti,
    date: isMulti ? "" : pStart,
    startDate: isMulti ? pStart : "",
    endDate: isMulti ? pEnd : "",
    startTime: parseTimeString(startD),
    endTime: parseTimeString(endD),
    registrationStart: parseDateString(evt.registrationStart),
    registrationEnd: parseDateString(evt.registrationEnd),
  };
};

export const createDuplicateDraft = (sourceEvent) => {
  const title = sourceEvent.title ? `Copy of ${sourceEvent.title}` : "";
  const timezone = sourceEvent.timezone ? sourceEvent.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isPublic = sourceEvent.isPublic !== undefined ? sourceEvent.isPublic : true;
  const requiresApproval = sourceEvent.requiresApproval !== undefined ? sourceEvent.requiresApproval : false;
  const bannerPreview = sourceEvent.image ? sourceEvent.image : (sourceEvent.banner ? sourceEvent.banner : "");
  
  return {
    title,
    description: sourceEvent.description ? sourceEvent.description : "",
    category: sourceEvent.category ? sourceEvent.category : "",
    ...getDraftDates(sourceEvent),
    timezone,
    location: getDraftLocation(sourceEvent.location),
    isVirtual: Boolean(sourceEvent.virtualLink),
    virtualLink: sourceEvent.virtualLink ? sourceEvent.virtualLink : "",
    capacity: sourceEvent.capacity != null ? sourceEvent.capacity : "",
    isPublic,
    requiresApproval,
    tags: Array.isArray(sourceEvent.tags) ? sourceEvent.tags : [],
    ticketTiers: getDraftTiers(sourceEvent.ticketTiers),
    banner: null,
    bannerPreview,
  };
};