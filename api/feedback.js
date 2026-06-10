if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.error(
    "[feedback.js] In-memory feedback store is active. Set DATABASE_URL to persist feedback across server restarts."
  );
}

const getFeedbackStore = () => {
  if (!globalThis.__eventraFeedbackByEvent) {
    globalThis.__eventraFeedbackByEvent = new Map();
  }
  return globalThis.__eventraFeedbackByEvent;
};

const normalizeId = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalizeRating = (value) => {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }
  return rating;
};

const sanitizeComment = (value) => String(value || "").trim().slice(0, 1000);

const getAuthenticatedUserId = (req) => {
  const verifiedUserId =
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId ||
    req.session?.user?.id ||
    null;

  if (verifiedUserId) {
    return String(verifiedUserId);
  }

  if (process.env.NODE_ENV !== "production") {
    return normalizeId(req.headers?.["x-user-id"] || req.headers?.["x-eventra-user-id"]);
  }

  return "";
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .slice(0, 12);
};

const createMemoryStore = () => ({
  async listByEvent(eventId) {
    const feedbackByEvent = getFeedbackStore();
    return feedbackByEvent.get(eventId) || [];
  },
  async getByEventAndUser(eventId, userId) {
    const feedbackByEvent = getFeedbackStore();
    return (feedbackByEvent.get(eventId) || []).find(
      (feedback) => String(feedback.userId) === String(userId)
    ) || null;
  },
  async create(feedback) {
    const feedbackByEvent = getFeedbackStore();
    const eventFeedback = feedbackByEvent.get(feedback.eventId) || [];
    eventFeedback.push(feedback);
    feedbackByEvent.set(feedback.eventId, eventFeedback);
    return feedback;
  },
});

const buildSummary = (feedback = []) => {
  const count = feedback.length;
  const total = feedback.reduce((sum, item) => sum + (Number(item.rating) || 0), 0);
  return {
    count,
    averageRating: count > 0 ? Number((total / count).toFixed(1)) : 0,
  };
};

const redactUserFeedback = (feedback) => {
  if (!feedback) return null;
  return {
    id: feedback.id,
    eventId: feedback.eventId,
    rating: feedback.rating,
    comment: feedback.comment,
    tags: feedback.tags,
    submittedAt: feedback.submittedAt,
  };
};

/**
 * Event feedback endpoint.
 *
 * POST persists one feedback record per event/user pair. GET returns aggregate
 * feedback stats and whether the authenticated user already submitted.
 * The default in-memory store keeps this route usable in local/serverless
 * previews while allowing production storage to be injected in tests or hosts.
 */
export default async function feedbackHandler(req, res, deps = {}) {
  const store = deps.store || createMemoryStore();
  const method = req.method || "GET";

  if (method !== "GET" && method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (
    typeof store.listByEvent !== "function" ||
    typeof store.getByEventAndUser !== "function" ||
    typeof store.create !== "function"
  ) {
    res.status(503).json({ error: "Feedback service unavailable" });
    return;
  }

  try {
    if (method === "GET") {
      const eventId = normalizeId(req.query?.eventId);
      const userId = getAuthenticatedUserId(req);

      if (!eventId) {
        res.status(400).json({ error: "Event id is required" });
        return;
      }

      const feedback = await store.listByEvent(eventId);
      const userFeedback = userId
        ? await store.getByEventAndUser(eventId, userId)
        : null;

      res.status(200).json({
        summary: buildSummary(feedback),
        submitted: Boolean(userFeedback),
        userFeedback: redactUserFeedback(userFeedback),
      });
      return;
    }

    const eventId = normalizeId(req.body?.eventId);
    const userId = getAuthenticatedUserId(req);
    const rating = normalizeRating(req.body?.rating);
    const comment = sanitizeComment(req.body?.comment);

    if (!eventId) {
      res.status(400).json({ error: "Event id is required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (rating === null) {
      res.status(400).json({ error: "Rating must be an integer from 1 to 5" });
      return;
    }

    if (comment.length < 5) {
      res.status(400).json({ error: "Comment must be at least 5 characters" });
      return;
    }

    const existingFeedback = await store.getByEventAndUser(eventId, userId);
    if (existingFeedback) {
      res.status(409).json({ error: "Feedback has already been submitted for this event" });
      return;
    }

    const feedback = await store.create({
      id: `${eventId}-${userId}-${Date.now()}`,
      eventId,
      userId,
      rating,
      comment,
      tags: normalizeTags(req.body?.tags),
      submittedAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Feedback submitted",
      feedback,
      submitted: true,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
