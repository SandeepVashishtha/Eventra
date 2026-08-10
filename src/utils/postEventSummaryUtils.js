/**
 * Post-Event Summary utilities.
 *
 * Supports:
 * - Participant statistics
 * - Attendance percentage
 * - Event highlights
 * - Winners / top participants
 * - Photos and resources
 * - Feedback summary
 * - Certificate status
 * - Recording / presentation links
 * - Complete post-event summary
 */

/**
 * Safely convert a value into an array.
 */
export const toSummaryArray = (
  value
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return [value];
};

/**
 * Safely convert a value into a number.
 */
export const toSummaryNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Get registered participant count.
 */
export const getRegisteredParticipantCount =
  (event = {}) => {
    const directCount =
      event.totalRegistered ??
      event.registeredCount ??
      event.registrationCount;

    if (
      directCount !== undefined &&
      directCount !== null
    ) {
      return toSummaryNumber(
        directCount
      );
    }

    const participants =
      event.registeredParticipants ||
      event.registrations ||
      [];

    return Array.isArray(
      participants
    )
      ? participants.length
      : 0;
  };

/**
 * Get attendee count.
 */
export const getAttendeeCount = (
  event = {}
) => {
  const directCount =
    event.totalAttendees ??
    event.attendeeCount ??
    event.attendedCount;

  if (
    directCount !== undefined &&
    directCount !== null
  ) {
    return toSummaryNumber(
      directCount
    );
  }

  const attendees =
    event.attendees || [];

  if (
    Array.isArray(attendees)
  ) {
    return attendees.length;
  }

  const participants =
    event.participants || [];

  if (
    Array.isArray(
      participants
    )
  ) {
    return participants.filter(
      (participant) =>
        participant.attended ===
          true ||
        participant.attendanceStatus ===
          "attended"
    ).length;
  }

  return 0;
};

/**
 * Calculate attendance percentage.
 */
export const getAttendancePercentage = (
  event = {}
) => {
  const registered =
    getRegisteredParticipantCount(
      event
    );

  const attendees =
    getAttendeeCount(event);

  if (registered <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (attendees / registered) *
        100
    )
  );
};

/**
 * Get event highlights.
 */
export const getEventHighlights = (
  event = {}
) => {
  return toSummaryArray(
    event.highlights ||
      event.eventHighlights ||
      event.keyHighlights
  ).filter(Boolean);
};

/**
 * Get winners.
 */
export const getEventWinners = (
  event = {}
) => {
  return toSummaryArray(
    event.winners ||
      event.topParticipants ||
      event.topPerformers ||
      event.results
  ).filter(Boolean);
};

/**
 * Get photos.
 */
export const getEventPhotos = (
  event = {}
) => {
  return toSummaryArray(
    event.photos ||
      event.eventPhotos ||
      event.gallery ||
      event.images
  ).filter(Boolean);
};

/**
 * Get event resources.
 */
export const getEventResources = (
  event = {}
) => {
  return toSummaryArray(
    event.resources ||
      event.eventResources ||
      event.materials
  ).filter(Boolean);
};

/**
 * Get recording link.
 */
export const getEventRecordingLink = (
  event = {}
) => {
  return (
    event.recordingUrl ||
    event.recordingLink ||
    event.eventRecording ||
    event.videoUrl ||
    null
  );
};

/**
 * Get presentation link.
 */
export const getPresentationLink = (
  event = {}
) => {
  return (
    event.presentationUrl ||
    event.presentationLink ||
    event.slidesUrl ||
    null
  );
};

/**
 * Get all media/resource links.
 */
export const getEventLinks = (
  event = {}
) => {
  const links = [];

  const recording =
    getEventRecordingLink(
      event
    );

  const presentation =
    getPresentationLink(
      event
    );

  if (recording) {
    links.push({
      type: "recording",
      label: "Event Recording",
      url: recording,
    });
  }

  if (presentation) {
    links.push({
      type: "presentation",
      label: "Presentation",
      url: presentation,
    });
  }

  getEventResources(
    event
  ).forEach(
    (resource, index) => {
      if (
        typeof resource ===
        "string"
      ) {
        links.push({
          type: "resource",
          label: `Resource ${
            index + 1
          }`,
          url: resource,
        });
      } else if (
        resource?.url ||
        resource?.link
      ) {
        links.push({
          type: "resource",
          label:
            resource.title ||
            resource.name ||
            `Resource ${
              index + 1
            }`,
          url:
            resource.url ||
            resource.link,
        });
      }
    }
  );

  return links;
};

/**
 * Get feedback entries.
 */
export const getFeedbackEntries = (
  event = {}
) => {
  return toSummaryArray(
    event.feedback ||
      event.feedbackEntries ||
      event.reviews
  ).filter(Boolean);
};

/**
 * Calculate feedback statistics.
 */
export const getFeedbackSummary = (
  event = {}
) => {
  const feedback =
    getFeedbackEntries(event);

  const directAverage =
    event.averageRating ??
    event.feedbackAverage ??
    event.averageFeedbackRating;

  const directCount =
    event.feedbackCount;

  if (
    directAverage !==
      undefined &&
    directAverage !== null
  ) {
    return {
      count:
        toSummaryNumber(
          directCount,
          feedback.length
        ),
      averageRating:
        Number(
          Number(
            directAverage
          ).toFixed(1)
        ),
      positiveCount:
        0,
      negativeCount:
        0,
    };
  }

  const ratings =
    feedback
      .map(
        (item) =>
          typeof item ===
          "object"
            ? item.rating ??
              item.score
            : null
      )
      .map(Number)
      .filter(
        (rating) =>
          Number.isFinite(
            rating
          )
      );

  const averageRating =
    ratings.length
      ? Number(
          (
            ratings.reduce(
              (
                total,
                rating
              ) =>
                total +
                rating,
              0
            ) /
            ratings.length
          ).toFixed(1)
        )
      : 0;

  const positiveCount =
    ratings.filter(
      (rating) =>
        rating >= 4
    ).length;

  const negativeCount =
    ratings.filter(
      (rating) =>
        rating <= 2
    ).length;

  return {
    count:
      ratings.length ||
      feedback.length,

    averageRating,

    positiveCount,

    negativeCount,
  };
};

/**
 * Get certificate statistics.
 */
export const getCertificateSummary = (
  event = {}
) => {
  const certificates =
    event.certificates ||
    event.certificateStatus ||
    {};

  if (
    Array.isArray(
      certificates
    )
  ) {
    const total =
      certificates.length;

    const issued =
      certificates.filter(
        (certificate) =>
          certificate?.issued ===
            true ||
          certificate?.status ===
            "issued"
      ).length;

    return {
      total,
      issued,
      pending: Math.max(
        0,
        total - issued
      ),
      percentage: total
        ? Math.round(
            (issued / total) *
              100
          )
        : 0,
    };
  }

  const total =
    toSummaryNumber(
      certificates.total ??
        event.totalCertificates ??
        0
    );

  const issued =
    toSummaryNumber(
      certificates.issued ??
        event.certificatesIssued ??
        0
    );

  const pending =
    toSummaryNumber(
      certificates.pending ??
        Math.max(
          0,
          total - issued
        )
    );

  return {
    total,
    issued,
    pending,
    percentage: total
      ? Math.round(
          (issued / total) *
            100
        )
      : 0,
  };
};

/**
 * Get event title.
 */
export const getSummaryEventTitle = (
  event = {}
) => {
  return (
    event.title ||
    event.name ||
    event.eventTitle ||
    "Event Summary"
  );
};

/**
 * Get event description.
 */
export const getSummaryDescription = (
  event = {}
) => {
  return (
    event.summary ||
    event.eventSummary ||
    event.description ||
    ""
  );
};

/**
 * Get top participants.
 *
 * Supports either:
 * - event.topParticipants
 * - event.winners
 * - participants sorted by score
 */
export const getTopParticipants = (
  event = {},
  limit = 5
) => {
  const explicit =
    event.topParticipants ||
    event.winners;

  if (
    Array.isArray(explicit)
  ) {
    return explicit.slice(
      0,
      limit
    );
  }

  const participants =
    event.participants || [];

  if (
    !Array.isArray(
      participants
    )
  ) {
    return [];
  }

  return [
    ...participants,
  ]
    .filter(
      (participant) =>
        participant.score !==
          undefined ||
        participant.points !==
          undefined ||
        participant.rank !==
          undefined
    )
    .sort(
      (first, second) => {
        const firstRank =
          Number(
            first.rank
          );

        const secondRank =
          Number(
            second.rank
          );

        if (
          Number.isFinite(
            firstRank
          ) &&
          Number.isFinite(
            secondRank
          )
        ) {
          return (
            firstRank -
            secondRank
          );
        }

        return (
          Number(
            second.score ??
              second.points ??
              0
          ) -
          Number(
            first.score ??
              first.points ??
              0
          )
        );
      }
    )
    .slice(0, limit);
};

/**
 * Check whether the event has ended.
 */
export const isEventCompleted = (
  event = {},
  now = new Date()
) => {
  if (
    event.status ===
      "completed" ||
    event.status ===
      "ended"
  ) {
    return true;
  }

  const endValue =
    event.endDateTime ||
    event.endDatetime ||
    event.endTime ||
    event.endDate ||
    event.endsAt;

  if (!endValue) {
    return false;
  }

  const endDate =
    new Date(endValue);

  if (
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    return false;
  }

  return (
    endDate.getTime() <=
    new Date(now).getTime()
  );
};

/**
 * Create event statistics.
 */
export const getPostEventStatistics = (
  event = {}
) => {
  const registered =
    getRegisteredParticipantCount(
      event
    );

  const attendees =
    getAttendeeCount(event);

  return {
    registeredParticipants:
      registered,

    attendees,

    attendancePercentage:
      getAttendancePercentage(
        event
      ),

    certificates:
      getCertificateSummary(
        event
      ),

    feedback:
      getFeedbackSummary(
        event
      ),
  };
};

/**
 * Create the complete post-event summary.
 */
export const buildPostEventSummary = (
  event = {}
) => {
  return {
    title:
      getSummaryEventTitle(
        event
      ),

    description:
      getSummaryDescription(
        event
      ),

    completed:
      isEventCompleted(
        event
      ),

    statistics:
      getPostEventStatistics(
        event
      ),

    highlights:
      getEventHighlights(
        event
      ),

    winners:
      getEventWinners(
        event
      ),

    topParticipants:
      getTopParticipants(
        event
      ),

    photos:
      getEventPhotos(
        event
      ),

    resources:
      getEventResources(
        event
      ),

    links:
      getEventLinks(event),

    feedback:
      getFeedbackSummary(
        event
      ),

    certificates:
      getCertificateSummary(
        event
      ),
  };
};

/**
 * Check whether there is enough content
 * to display a post-event summary.
 */
export const hasPostEventSummaryContent =
  (event = {}) => {
    const summary =
      buildPostEventSummary(
        event
      );

    return Boolean(
      summary.statistics
        .registeredParticipants ||
        summary.statistics
          .attendees ||
        summary.highlights.length ||
        summary.winners.length ||
        summary.topParticipants
          .length ||
        summary.photos.length ||
        summary.resources.length ||
        summary.links.length ||
        summary.feedback.count ||
        summary.certificates.total
    );
  };

/**
 * Get a friendly summary message.
 */
export const getPostEventSummaryMessage =
  (event = {}) => {
    const summary =
      buildPostEventSummary(
        event
      );

    const {
      registeredParticipants,
      attendees,
      attendancePercentage,
    } =
      summary.statistics;

    if (
      !registeredParticipants &&
      !attendees
    ) {
      return "Event summary information is not available yet.";
    }

    return `${attendees} of ${registeredParticipants} registered participants attended this event (${attendancePercentage}% attendance).`;
  };