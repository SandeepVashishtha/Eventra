import { useEffect, useState, useMemo } from "react";
import { useLiveAudienceStream } from "../context/RealTimeContext.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";

// ─── Shared error-handling wrapper ───────────────────────────────────────────
async function apiCall(label, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(label, err);
    throw err;
  }
}

// ─── Standalone REST actions (exported for reuse / testing) ──────────────────
export const submitQuestion = (eventId, text) =>
  text && text.trim()
    ? apiCall("Failed to submit question:", () =>
        apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId), { text })
      )
    : Promise.resolve();

export const upvoteQuestion = (eventId, questionId) =>
  apiCall("Failed to upvote question:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.UPVOTE(eventId, questionId))
  );

export const deleteQuestion = (eventId, questionId) =>
  apiCall("Failed to delete question:", () =>
    apiUtils.delete(API_ENDPOINTS.LIVE_AUDIENCE.QUESTION_DETAIL(eventId, questionId))
  );

export const flagQuestion = (eventId, questionId) =>
  apiCall("Failed to flag question:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.FLAG(eventId, questionId))
  );

export const createPoll = (eventId, question, type, options) =>
  apiCall("Failed to create poll:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLLS(eventId), { question, type, options })
  );

export const updatePollStatus = (eventId, pollId, status) =>
  apiCall("Failed to update poll status:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_STATUS(eventId, pollId), { status })
  );

export const submitVote = (eventId, pollId, option) =>
  apiCall("Failed to submit vote:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_VOTE(eventId, pollId), { option })
  );

// ─── Initial data loader ──────────────────────────────────────────────────────
async function loadFromApi(eventId, loadInitialData, getIsMounted) {
  const res = await apiUtils.get(API_ENDPOINTS.LIVE_AUDIENCE.BASE(eventId));
  if (!res.ok) throw new Error("Failed to load initial live audience data");
  const data = await res.json();
  if (getIsMounted()) loadInitialData(eventId, data);
}

export async function fetchLiveAudienceInitial(
  eventId,
  loadInitialData,
  setLoading,
  setError,
  getIsMounted
) {
  setLoading(true);
  setError(null);
  try {
    await loadFromApi(eventId, loadInitialData, getIsMounted);
  } catch (err) {
    if (getIsMounted()) setError(err.message || "An error occurred");
  } finally {
    if (getIsMounted()) setLoading(false);
  }
}

// ─── Sort helper ─────────────────────────────────────────────────────────────
function compareQuestions(a, b) {
  if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
  return new Date(b.createdAt) - new Date(a.createdAt);
}

export function sortQuestionsList(questions) {
  return questions ? [...questions].sort(compareQuestions) : [];
}

// ─── Bound action factory (keeps hook body flat) ──────────────────────────────
function bindActions(eventId) {
  return {
    submitQuestion: (text) => submitQuestion(eventId, text),
    upvoteQuestion: (qId) => upvoteQuestion(eventId, qId),
    deleteQuestion: (qId) => deleteQuestion(eventId, qId),
    flagQuestion: (qId) => flagQuestion(eventId, qId),
    createPoll: (q, t, o) => createPoll(eventId, q, t, o),
    updatePollStatus: (pId, s) => updatePollStatus(eventId, pId, s),
    submitVote: (pId, o) => submitVote(eventId, pId, o),
  };
}

/**
 * Hook for live audience interaction (Q&A and Polls).
 */
export default function useLiveAudience(eventId) {
  const { state, loadInitialData } = useLiveAudienceStream();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventData = state.events[eventId];

  useEffect(() => {
    if (!eventId || eventData) return;
    let isMounted = true;
    fetchLiveAudienceInitial(eventId, loadInitialData, setLoading, setError, () => isMounted);
    return () => { isMounted = false; };
  }, [eventId, eventData, loadInitialData]);

  const questions = useMemo(
    () => sortQuestionsList(eventData?.questions),
    [eventData?.questions]
  );

  const actions = useMemo(() => bindActions(eventId), [eventId]);

  return {
    questions,
    activePoll: eventData?.activePoll ?? null,
    status: state.status,
    loading,
    error,
    ...actions,
  };
}
