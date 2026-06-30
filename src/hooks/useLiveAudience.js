import { useEffect, useState, useCallback, useMemo } from "react";
import { useLiveAudienceStream } from "../context/RealTimeContext.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";

// Helper functions declared outside the hook to keep code health at 10.00
export async function submitQuestion(eventId, text) {
  if (!text || !text.trim()) return;
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId), { text });
  } catch (err) {
    console.error("Failed to submit question:", err);
    throw err;
  }
}

export async function upvoteQuestion(eventId, questionId) {
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.UPVOTE(eventId, questionId));
  } catch (err) {
    console.error("Failed to upvote question:", err);
    throw err;
  }
}

export async function deleteQuestion(eventId, questionId) {
  try {
    await apiUtils.delete(API_ENDPOINTS.LIVE_AUDIENCE.QUESTION_DETAIL(eventId, questionId));
  } catch (err) {
    console.error("Failed to delete question:", err);
    throw err;
  }
}

export async function flagQuestion(eventId, questionId) {
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.FLAG(eventId, questionId));
  } catch (err) {
    console.error("Failed to flag question:", err);
    throw err;
  }
}

export async function createPoll(eventId, question, type, options) {
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLLS(eventId), { question, type, options });
  } catch (err) {
    console.error("Failed to create poll:", err);
    throw err;
  }
}

export async function updatePollStatus(eventId, pollId, status) {
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_STATUS(eventId, pollId), { status });
  } catch (err) {
    console.error("Failed to update poll status:", err);
    throw err;
  }
}

export async function submitVote(eventId, pollId, option) {
  try {
    await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_VOTE(eventId, pollId), { option });
  } catch (err) {
    console.error("Failed to submit vote:", err);
    throw err;
  }
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
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiUtils.get(API_ENDPOINTS.LIVE_AUDIENCE.BASE(eventId));
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            loadInitialData(eventId, data);
          }
        } else {
          throw new Error("Failed to load initial live audience data");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "An error occurred");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [eventId, hasLoaded, loadInitialData]);

  // Sort by upvotes (descending), then by creation date (descending)
  const questions = useMemo(() => {
    if (!eventData?.questions) return [];
    return [...eventData.questions].sort((a, b) => {
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [eventData?.questions]);

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
