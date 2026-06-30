import { useEffect, useState, useCallback, useMemo } from "react";
import { useLiveAudienceStream } from "../context/RealTimeContext.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";

/**
 * Hook for live audience interaction (Q&A and Polls).
 * Deals with fetching initial data, listening to the SSE updates, and invoking REST actions.
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

  const submitQuestion = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId), { text });
    } catch (err) {
      console.error("Failed to submit question:", err);
      throw err;
    }
  }, [eventId]);

  const upvoteQuestion = useCallback(async (questionId) => {
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.UPVOTE(eventId, questionId));
    } catch (err) {
      console.error("Failed to upvote question:", err);
      throw err;
    }
  }, [eventId]);

  const deleteQuestion = useCallback(async (questionId) => {
    try {
      await apiUtils.delete(API_ENDPOINTS.LIVE_AUDIENCE.QUESTION_DETAIL(eventId, questionId));
    } catch (err) {
      console.error("Failed to delete question:", err);
      throw err;
    }
  }, [eventId]);

  const flagQuestion = useCallback(async (questionId) => {
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.FLAG(eventId, questionId));
    } catch (err) {
      console.error("Failed to flag question:", err);
      throw err;
    }
  }, [eventId]);

  const createPoll = useCallback(async (question, type, options) => {
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLLS(eventId), { question, type, options });
    } catch (err) {
      console.error("Failed to create poll:", err);
      throw err;
    }
  }, [eventId]);

  const updatePollStatus = useCallback(async (pollId, status) => {
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_STATUS(eventId, pollId), { status });
    } catch (err) {
      console.error("Failed to update poll status:", err);
      throw err;
    }
  }, [eventId]);

  const submitVote = useCallback(async (pollId, option) => {
    try {
      await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.POLL_VOTE(eventId, pollId), { option });
    } catch (err) {
      console.error("Failed to submit vote:", err);
      throw err;
    }
  }, [eventId]);

  return {
    questions,
    activePoll,
    status: state.status,
    loading,
    error,
    submitQuestion,
    upvoteQuestion,
    deleteQuestion,
    flagQuestion,
    createPoll,
    updatePollStatus,
    submitVote,
  };
}
