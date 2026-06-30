import { useEffect, useState, useCallback, useMemo } from "react";
import { useLiveAudienceStream } from "../context/RealTimeContext.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";

// Shared error-handling wrapper — eliminates repeated try/catch branches
async function apiCall(label, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(label, err);
    throw err;
  }
}

// Standalone REST request actions
export async function submitQuestion(eventId, text) {
  if (!text || !text.trim()) return;
  return apiCall("Failed to submit question:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId), { text })
  );
}

export async function upvoteQuestion(eventId, questionId) {
  return apiCall("Failed to upvote question:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.UPVOTE(eventId, questionId))
  );
}

export async function deleteQuestion(eventId, questionId) {
  return apiCall("Failed to delete question:", () =>
    apiUtils.delete(API_ENDPOINTS.LIVE_AUDIENCE.QUESTION_DETAIL(eventId, questionId))
  );
}

export async function flagQuestion(eventId, questionId) {
  return apiCall("Failed to flag question:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.FLAG(eventId, questionId))
  );
}

export async function createPoll(eventId, question, type, options) {
  return apiCall("Failed to create poll:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLLS(eventId), { question, type, options })
  );
}

export async function updatePollStatus(eventId, pollId, status) {
  return apiCall("Failed to update poll status:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_STATUS(eventId, pollId), { status })
  );
}

export async function submitVote(eventId, pollId, option) {
  return apiCall("Failed to submit vote:", () =>
    apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_VOTE(eventId, pollId), { option })
  );
}

async function applyInitialData(eventId, loadInitialData, setError, getIsMounted) {
  const res = await apiUtils.get(API_ENDPOINTS.LIVE_AUDIENCE.BASE(eventId));
  if (!res.ok) throw new Error("Failed to load initial live audience data");
  const data = await res.json();
  if (getIsMounted()) loadInitialData(eventId, data);
}

export async function fetchLiveAudienceInitial(eventId, loadInitialData, setLoading, setError, getIsMounted) {
  setLoading(true);
  setError(null);
  try {
    await applyInitialData(eventId, loadInitialData, setError, getIsMounted);
  } catch (err) {
    if (getIsMounted()) setError(err.message || "An error occurred");
  } finally {
    if (getIsMounted()) setLoading(false);
  }
}

export function sortQuestionsList(questions) {
  if (!questions) return [];
  return [...questions].sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/**
 * Hook for live audience interaction (Q&A and Polls).
 */
export default function useLiveAudience(eventId) {
  const { state, loadInitialData } = useLiveAudienceStream();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventData = state.events[eventId];
  const hasLoaded = !!eventData;

  useEffect(() => {
    if (!eventId || hasLoaded) return;
    let isMounted = true;
    fetchLiveAudienceInitial(eventId, loadInitialData, setLoading, setError, () => isMounted);
    return () => { isMounted = false; };
  }, [eventId, hasLoaded, loadInitialData]);

  const questions = useMemo(() => sortQuestionsList(eventData?.questions), [eventData?.questions]);
  const activePoll = eventData?.activePoll || null;

  const submitQuestionCall = useCallback((text) => submitQuestion(eventId, text), [eventId]);
  const upvoteQuestionCall = useCallback((qId) => upvoteQuestion(eventId, qId), [eventId]);
  const deleteQuestionCall = useCallback((qId) => deleteQuestion(eventId, qId), [eventId]);
  const flagQuestionCall = useCallback((qId) => flagQuestion(eventId, qId), [eventId]);
  const createPollCall = useCallback((q, t, o) => createPoll(eventId, q, t, o), [eventId]);
  const updatePollStatusCall = useCallback((pId, s) => updatePollStatus(eventId, pId, s), [eventId]);
  const submitVoteCall = useCallback((pId, o) => submitVote(eventId, pId, o), [eventId]);

  return {
    questions,
    activePoll,
    status: state.status,
    loading,
    error,
    submitQuestion: submitQuestionCall,
    upvoteQuestion: upvoteQuestionCall,
    deleteQuestion: deleteQuestionCall,
    flagQuestion: flagQuestionCall,
    createPoll: createPollCall,
    updatePollStatus: updatePollStatusCall,
    submitVote: submitVoteCall,
  };
}
