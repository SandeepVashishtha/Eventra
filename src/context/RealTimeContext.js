import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import useRealTimeConnection, { SSE_STATUS } from "../hooks/useRealTimeConnection";

export { SSE_STATUS };

// --- 1. Split the Contexts ---
const LeaderboardContext = createContext(null);
const AnalyticsContext = createContext(null);

// --- 2. Initial States ---
const initialLeaderboardState = {
  contributors: [],
  lastSynced: null,
  status: SSE_STATUS.IDLE,
};

const initialAnalyticsState = {
  recentCheckins: [],
  liveCount: 0,
  scanVelocity: 0,
  status: SSE_STATUS.IDLE,
  // Id-based source of truth for the live count: an attendee is counted at
  // most once, and a check-out removes them from the set.
  checkedInIds: [],
};

// --- 3. Isolated Providers ---
// The `leaderboard` and `analytics` SSE topics have no backend publisher
// (issue #15334), so the subscriptions are dropped. Leaderboard.jsx hydrates
// from its REST endpoint (`fetchLeaderboardData`) and AnalyticsDashboard.jsx
// from `useAnalytics` plus local simulation, so the providers only hand out
// their initial (IDLE) state.

function LeaderboardProvider({ children }) {
  return (
    <LeaderboardContext.Provider value={initialLeaderboardState}>
      {children}
    </LeaderboardContext.Provider>
  );
}

function AnalyticsProvider({ children }) {
  return (
    <AnalyticsContext.Provider value={initialAnalyticsState}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// --- 4.5 Live Audience Coordination Provider ---
export const LiveAudienceContext = createContext(null);

// Maximum number of questions retained per event. The reducer keeps a rolling
// window so long-running, high-traffic sessions (hackathon demo rooms, live
// Q&A) do not grow the event history without bound (issue #14611).
const MAX_LIVE_QUESTIONS = 200;

function liveAudienceReducer(state, action) {
  switch (action.type) {
    case "LOAD_INITIAL": {
      const { eventId, questions, activePoll } = action.payload;
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: { questions, activePoll }
        }
      };
    }
    case "NEW_QUESTION": {
      const { eventId, question } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      if (eventData.questions.some(q => q.id === question.id)) return state;
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: [...eventData.questions, question].slice(-MAX_LIVE_QUESTIONS)
          }
        }
      };
    }
    case "UPDATE_QUESTION": {
      const { eventId, question } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: eventData.questions.map(q => q.id === question.id ? question : q)
          }
        }
      };
    }
    case "DELETE_QUESTION": {
      const { eventId, questionId } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: eventData.questions.filter(q => q.id !== questionId)
          }
        }
      };
    }
    case "SET_POLL":
    case "UPDATE_POLL": {
      const { eventId, poll } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            activePoll: poll
          }
        }
      };
    }
    case "STATUS":
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

function LiveAudienceProvider({ children }) {
  const [state, dispatch] = useReducer(liveAudienceReducer, {
    events: {},
    status: SSE_STATUS.IDLE,
  });

  // Only events the client is actively viewing are tracked. Live-audience
  // traffic for any other event is ignored (issue #15333): a client must not
  // receive the Q&A/poll activity of events it is not on.
  const subscribedEventsRef = useRef(new Set());
  const [subscribedCount, setSubscribedCount] = useState(0);

  const subscribeToEvent = useCallback((eventId) => {
    if (!eventId) return;
    subscribedEventsRef.current.add(String(eventId));
    setSubscribedCount(subscribedEventsRef.current.size);
  }, []);

  const unsubscribeFromEvent = useCallback((eventId) => {
    if (!eventId) return;
    subscribedEventsRef.current.delete(String(eventId));
    setSubscribedCount(subscribedEventsRef.current.size);
  }, []);

  const onMessage = useCallback((data) => {
    if (!data || !data.eventId || !subscribedEventsRef.current.has(String(data.eventId))) return;
    if (!data.type) return;
    const { eventId, type, payload } = data;
    switch (type) {
      case "NEW_QUESTION":
        dispatch({ type: "NEW_QUESTION", payload: { eventId, question: payload } });
        break;
      case "UPDATE_QUESTION":
        dispatch({ type: "UPDATE_QUESTION", payload: { eventId, question: payload } });
        break;
      case "DELETE_QUESTION":
        dispatch({ type: "DELETE_QUESTION", payload: { eventId, questionId: payload } });
        break;
      case "SET_POLL":
      case "UPDATE_POLL":
        dispatch({ type: "UPDATE_POLL", payload: { eventId, poll: payload } });
        break;
      default:
        break;
    }
  }, []);

  // The global stream is only opened while at least one event is actively
  // subscribed, so idle clients do not keep the live-audience connection open.
  const { status } = useRealTimeConnection("/stream/live-audience", {
    onMessage,
    enabled: subscribedCount > 0,
  });

  useEffect(() => {
    dispatch({ type: "STATUS", payload: status });
  }, [status]);

  const loadInitialData = useCallback((eventId, data) => {
    dispatch({
      type: "LOAD_INITIAL",
      payload: { eventId, questions: data.questions || [], activePoll: data.activePoll || null }
    });
  }, []);

  const value = useMemo(
    () => ({ state, loadInitialData, subscribeToEvent, unsubscribeFromEvent }),
    [state, loadInitialData, subscribeToEvent, unsubscribeFromEvent]
  );

  return (
    <LiveAudienceContext.Provider value={value}>
      {children}
    </LiveAudienceContext.Provider>
  );
}

// --- 5. Main Provider Composition ---
// We wrap them together here so the rest of the app doesn't break!
export function RealTimeProvider({ children }) {
  return (
    <LeaderboardProvider>
      <AnalyticsProvider>
        <LiveAudienceProvider>
          {children}
        </LiveAudienceProvider>
      </AnalyticsProvider>
    </LeaderboardProvider>
  );
}

// The legacy useRealTime hook was removed because it defeated the split-provider architecture
// by consuming both contexts simultaneously and triggering global re-renders.

// 🔥 The Magic: These hooks now ONLY re-render when their specific stream updates!
export const useLeaderboardStream = () => {
  const ctx = useContext(LeaderboardContext);
  if (!ctx) throw new Error("useLeaderboardStream must be used inside RealTimeProvider");
  return ctx;
};

export const useAnalyticsStream = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalyticsStream must be used inside RealTimeProvider");
  return ctx;
};

export const useLiveAudienceStream = () => {
  const ctx = useContext(LiveAudienceContext);
  if (typeof globalThis !== "undefined" && typeof globalThis.mockLiveAudienceStream === "function") {
    return globalThis.mockLiveAudienceStream();
  }
  if (!ctx) throw new Error("useLiveAudienceStream must be used inside RealTimeProvider");
  return ctx;
};