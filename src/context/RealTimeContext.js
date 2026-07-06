import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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
};

// --- 3. Split the Reducers ---
function leaderboardReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        contributors: action.payload,
        lastSynced: Date.now(),
      };
    case "STATUS":
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

function analyticsReducer(state, action) {
  switch (action.type) {
    case "CHECKIN":
      return {
        ...state,
        recentCheckins: [action.payload, ...state.recentCheckins.slice(0, 49)],
        liveCount: state.liveCount + 1,
      };
    case "UPDATE":
      return { ...state, ...action.payload };
    case "STATUS":
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

// --- 4. Isolated Providers ---
// FIX (#7855 Bug 3): STATUS_DEBOUNCE_MS throttles the STATUS dispatch so that
// rapid connect/disconnect cycles (e.g. flaky connections) do not trigger a
// re-render storm. 500 ms matches the suggested batch window in the issue.
const STATUS_DEBOUNCE_MS = 500;

function LeaderboardProvider({ children }) {
  const [state, dispatch] = useReducer(leaderboardReducer, initialLeaderboardState);

  const onMessage = useCallback((data) => {
    if (Array.isArray(data)) {
      dispatch({ type: "UPDATE", payload: data });
    } else if (Array.isArray(data?.contributors)) {
      dispatch({ type: "UPDATE", payload: data.contributors });
    }
  }, []);

  const { status } = useRealTimeConnection("/stream/leaderboard", {
    onMessage,
  });

  // FIX (#7855 Bug 3): Debounce STATUS dispatches so rapid SSE reconnection
  // cycles (CONNECTING → OPEN → CLOSED → RECONNECTING in quick succession)
  // are collapsed into a single state update, preventing a re-render cascade
  // in every consumer of LeaderboardContext.
  const statusDebounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(statusDebounceRef.current);
    statusDebounceRef.current = setTimeout(() => {
      dispatch({ type: "STATUS", payload: status });
    }, STATUS_DEBOUNCE_MS);
    return () => clearTimeout(statusDebounceRef.current);
  }, [status]);

  // FIX (#7855 Bug 3): Memoize the context value so that LeaderboardContext
  // consumers wrapped in React.memo can bail out of re-renders when neither
  // contributors nor lastSynced nor status has changed.
  // Without this, `value={state}` creates a new object reference on every
  // render of LeaderboardProvider, defeating all downstream memoization.
  const contextValue = useMemo(
    () => state,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.contributors, state.lastSynced, state.status]
  );

  return (
    <LeaderboardContext.Provider value={contextValue}>
      {children}
    </LeaderboardContext.Provider>
  );
}

function AnalyticsProvider({ children }) {
  const [state, dispatch] = useReducer(analyticsReducer, initialAnalyticsState);

  const onMessage = useCallback((data) => {
    if (data?.name && data?.event) {
      dispatch({ type: "CHECKIN", payload: data });
    } else if (data?.checkin) {
      dispatch({ type: "CHECKIN", payload: data.checkin });
    } else if (data?.liveCount !== undefined || data?.scanVelocity !== undefined) {
      dispatch({ type: "UPDATE", payload: data });
    }
  }, []);

  const { status } = useRealTimeConnection("/stream/analytics", {
    onMessage,
  });

  // FIX (#7855 Bug 3): Same debounce pattern as LeaderboardProvider.
  const statusDebounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(statusDebounceRef.current);
    statusDebounceRef.current = setTimeout(() => {
      dispatch({ type: "STATUS", payload: status });
    }, STATUS_DEBOUNCE_MS);
    return () => clearTimeout(statusDebounceRef.current);
  }, [status]);

  // FIX (#7855 Bug 3): Memoize context value — AnalyticsContext consumers
  // wrapped in React.memo can now bail out of re-renders when recentCheckins,
  // liveCount, scanVelocity, and status are all unchanged.
  const contextValue = useMemo(
    () => state,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.recentCheckins, state.liveCount, state.scanVelocity, state.status]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// --- 4.5 Live Audience Coordination Provider ---
const LiveAudienceContext = createContext(null);

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
            questions: [...eventData.questions, question]
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

  const onMessage = useCallback((data) => {
    if (!data || !data.eventId || !data.type) return;
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

  const { status } = useRealTimeConnection("/stream/live-audience", {
    onMessage,
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

  const value = {
    state,
    loadInitialData
  };

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
  if (typeof globalThis !== "undefined" && typeof globalThis.mockLiveAudienceStream === "function") {
    return globalThis.mockLiveAudienceStream();
  }
  if (!ctx) throw new Error("useLiveAudienceStream must be used inside RealTimeProvider");
  return ctx;
};