const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

const parseEventDate = (event) => {
  if (!event) return null;
  const dateString = event.startDate || event.date || event.eventDate;
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysUntilEvent = (event) => {
  const eventDate = parseEventDate(event);
  if (!eventDate) return null;
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
};

const getCapacityUtilization = (event) => {
  const attendees = Number(event.attendees || 0);
  const capacity = Number(event.maxAttendees || event.capacity || 0);

  if (capacity <= 0) {
    return 0;
  }

  return clamp01(attendees / capacity);
};

const getTicketTypeScore = (event) => {
  if (event.price === 0 || event.price === "0" || String(event.price).trim() === "") {
    return 0.92;
  }

  const price = Number(event.price);
  if (Number.isNaN(price)) {
    return 0.75;
  }

  if (price <= 50) return 0.88;
  if (price <= 150) return 0.8;
  if (price <= 300) return 0.72;
  return 0.62;
};

const getEventModeScore = (eventMode) => {
  if (!eventMode) return 0.75;
  const mode = String(eventMode).trim().toLowerCase();
  if (mode === "online") return 0.92;
  if (mode === "hybrid") return 0.86;
  return 0.72;
};

const getProximityScore = (event) => {
  const days = getDaysUntilEvent(event);
  if (days === null) return 0.72;
  if (days <= 1) return 0.94;
  if (days <= 4) return 0.88;
  if (days <= 10) return 0.8;
  if (days <= 30) return 0.72;
  if (days <= 90) return 0.64;
  return 0.56;
};

const getReminderEngagementScore = (reminders = []) => {
  const count = Array.isArray(reminders) ? reminders.length : 0;
  if (count >= 3) return 0.98;
  if (count === 2) return 0.94;
  if (count === 1) return 0.88;
  return 0.78;
};

const parseRegistrationDate = (event) => {
  if (!event) return null;
  const dateString = event.registrationDate || event.registrationStart || event.firstRegistrationDate || event.createdAt;
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getRegistrationLeadDays = (event) => {
  const eventDate = parseEventDate(event);
  const registrationDate = parseRegistrationDate(event);
  if (!eventDate || !registrationDate) return null;
  const diffMs = eventDate.getTime() - registrationDate.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
};

const getRegistrationTimingScore = (event) => {
  const leadDays = getRegistrationLeadDays(event);
  if (leadDays === null) return 0.76;
  if (leadDays >= 60) return 0.94;
  if (leadDays >= 30) return 0.9;
  if (leadDays >= 14) return 0.84;
  if (leadDays >= 7) return 0.78;
  if (leadDays >= 3) return 0.7;
  if (leadDays >= 1) return 0.64;
  return 0.56;
};

const getEngagementScore = (event) => {
  const rawEngagement = Number(event.engagementScore ?? event.engagementRate ?? event.engagement ?? NaN);
  if (!Number.isNaN(rawEngagement) && rawEngagement >= 0 && rawEngagement <= 1) {
    return clamp01(rawEngagement);
  }

  if (Number(event.socialShares) >= 10 || Number(event.comments) >= 5) return 0.92;
  if (Number(event.socialShares) >= 5 || Number(event.comments) >= 3) return 0.86;
  return 0.78;
};

const getHistoricalAttendanceScore = (event) => {
  const pastRate = Number(event.pastAttendanceRate);
  if (!Number.isNaN(pastRate) && pastRate >= 0 && pastRate <= 1) {
    return clamp01(pastRate);
  }
  return 0.76;
};

const getWaitlistSize = (event) => {
  return Number(event.waitlistCount ?? event.waitlistSize ?? event.pendingWaitlist ?? 0);
};

const getAttendanceConfidenceLabel = (probability) => {
  if (probability >= 0.85) return "High confidence";
  if (probability >= 0.7) return "Moderate confidence";
  if (probability >= 0.55) return "Low confidence";
  return "Very low confidence";
};

export const computeAttendancePrediction = (event = {}, options = {}) => {
  const reminders = options.reminders || [];
  const capacity = Number(event.maxAttendees || event.capacity || 0);
  const attendees = Number(event.attendees || 0);
  const fillRate = getCapacityUtilization(event);

  const weights = {
    fillRate: 0.30,
    ticket: 0.14,
    eventMode: 0.12,
    proximity: 0.12,
    reminders: 0.14,
    historical: 0.08,
    registrationTiming: 0.07,
    engagement: 0.03,
  };

  const probability = clamp01(
    fillRate * weights.fillRate +
      getTicketTypeScore(event) * weights.ticket +
      getEventModeScore(event.eventMode) * weights.eventMode +
      getProximityScore(event) * weights.proximity +
      getReminderEngagementScore(reminders) * weights.reminders +
      getHistoricalAttendanceScore(event) * weights.historical +
      getRegistrationTimingScore(event) * weights.registrationTiming +
      getEngagementScore(event) * weights.engagement
  );

  const attendanceProbability = Math.round(probability * 100);
  const noShowProbability = Math.round((1 - probability) * 100);
  const predictedAttendees = capacity > 0 ? Math.round(probability * capacity) : attendees;
  const predictedGap = predictedAttendees - attendees;
  const waitlistSize = getWaitlistSize(event);
  const expectedOpenSeats = Math.max(0, capacity - predictedAttendees);
  const expectedNoShowSeats = Math.max(0, attendees - predictedAttendees);

  const recommendedPromotions = waitlistSize > 0
    ? Math.min(waitlistSize, Math.max(0, Math.round(expectedNoShowSeats * 0.8)))
    : 0;

  const projectedFillRate = capacity > 0
    ? Math.round(((attendees + recommendedPromotions) / capacity) * 100)
    : 0;

  const reminderHint = attendanceProbability < 75
    ? "Send last-minute reminders and confirm key attendees before the event."
    : "Attendance looks stable; keep reminder cadence normal.";

  return {
    attendanceProbability,
    noShowProbability,
    confidenceLabel: getAttendanceConfidenceLabel(probability),
    predictedAttendees,
    predictedGap,
    expectedOpenSeats,
    expectedNoShowSeats,
    recommendedPromotions,
    projectedFillRate,
    waitlistSize,
    reminderHint,
  };
};

export const buildWaitlistPromotionSummary = (event = {}, options = {}) => {
  const prediction = computeAttendancePrediction(event, options);
    const capacity = Number(event.maxAttendees || event.capacity || 0);
  const seatsToPromote = prediction.recommendedPromotions;
  const hasWaitlist = prediction.waitlistSize > 0;

  if (!capacity || !hasWaitlist) {
    return {
      summary: "No waitlist data available.",
      actions: [],
      seatsToPromote: 0,
    };
  }

  const summary = seatsToPromote > 0
    ? `Promote ${seatsToPromote} waitlisted attendee(s) to compensate for expected no-shows and maximize venue utilization.`
    : "Current attendance confidence is strong. No automatic waitlist promotion is recommended at this time.";

  return {
    summary,
    actions: [
      `Projecting ${prediction.expectedNoShowSeats} no-show seat(s).`,
      `Target fill rate: ${prediction.projectedFillRate}% after promotion.`,
      prediction.reminderHint,
    ],
    seatsToPromote,
  };
};

export const getPredictedAttendanceSummary = (event = {}, options = {}) => {
  const prediction = computeAttendancePrediction(event, options);
  return {
    title: event.title || "Event",
    attendanceProbability: prediction.attendanceProbability,
    confidenceLabel: prediction.confidenceLabel,
    loadReason:
      prediction.attendanceProbability < 70
        ? "Send extra reminders and monitor waitlist movement."
        : "Monitor current registrations and keep promotion steady.",
  };
};
