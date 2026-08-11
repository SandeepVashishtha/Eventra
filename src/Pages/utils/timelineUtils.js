export const TIMELINE_STEPS = [
  "Registration",
  "Team Formation",
  "Submission",
  "Review",
  "Results",
  "Closing Ceremony",
];

/**
 * Returns milestone status
 */
export const getMilestoneStatus = (date) => {
  if (!date) return "upcoming";

  const today = new Date();
  const milestoneDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  milestoneDate.setHours(0, 0, 0, 0);

  if (today.getTime() === milestoneDate.getTime()) {
    return "current";
  }

  if (today > milestoneDate) {
    return "completed";
  }

  return "upcoming";
};

/**
 * Format date
 */
export const formatTimelineDate = (date) => {
  if (!date) return "TBA";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Prepare timeline data
 */
export const buildTimeline = (event) => {
  if (!event) return [];

  return [
    {
      title: "Registration",
      date: event.registrationDate,
      status: getMilestoneStatus(event.registrationDate),
    },
    {
      title: "Team Formation",
      date: event.teamFormationDate,
      status: getMilestoneStatus(event.teamFormationDate),
    },
    {
      title: "Submission",
      date: event.submissionDate,
      status: getMilestoneStatus(event.submissionDate),
    },
    {
      title: "Review",
      date: event.reviewDate,
      status: getMilestoneStatus(event.reviewDate),
    },
    {
      title: "Results",
      date: event.resultDate,
      status: getMilestoneStatus(event.resultDate),
    },
    {
      title: "Closing Ceremony",
      date: event.closingCeremonyDate,
      status: getMilestoneStatus(event.closingCeremonyDate),
    },
  ];
};

/**
 * Returns progress percentage
 */
export const getTimelineProgress = (milestones) => {
  if (!milestones.length) return 0;

  const completed = milestones.filter(
    (item) => item.status === "completed"
  ).length;

  return Math.round((completed / milestones.length) * 100);
};

/**
 * Returns current milestone
 */
export const getCurrentMilestone = (milestones) => {
  return (
    milestones.find(
      (item) => item.status === "current"
    ) || null
  );
};