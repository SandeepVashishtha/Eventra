import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import useRealTimeConnection, { SSE_STATUS } from "../hooks/useRealTimeConnection";

export { SSE_STATUS };

const RealTimeContext = createContext(null);

const initialState = {
  leaderboard: {
    contributors: [],
    lastSynced: null,
    status: SSE_STATUS.IDLE,
  },
  analytics: {
    recentCheckins: [],
    liveCount: 0,
    scanVelocity: 0,
    status: SSE_STATUS.IDLE,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "LB_UPDATE":
      return {
        ...state,
        leaderboard: {
          ...state.leaderboard,
          contributors: action.payload,
          lastSynced: Date.now(),
        },
      };
    case "LB_STATUS":
      return {
        ...state,
        leaderboard: { ...state.leaderboard, status: action.payload },
      };
    case "AN_CHECKIN":
      return {
        ...state,
        analytics: {
          ...state.analytics,
          recentCheckins: [action.payload, ...state.analytics.recentCheckins.slice(0, 49)],
          liveCount: state.analytics.liveCount + 1,
        },
      };
    case "AN_UPDATE":
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };
    case "AN_STATUS":
      return {
        ...state,
        analytics: { ...state.analytics, status: action.payload },
      };
    default:
      return state;
  }
}

export function RealTimeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Leaderboard stream: server sends full contributor list or delta
  const onLeaderboardMessage = useCallback((data) => {
    if (Array.isArray(data)) {
      dispatch({ type: "LB_UPDATE", payload: data });
    } else if (Array.isArray(data?.contributors)) {
      dispatch({ type: "LB_UPDATE", payload: data.contributors });
    }
  }, []);

  // Analytics stream: server sends individual check-in events or aggregate stats
  const onAnalyticsMessage = useCallback((data) => {
    if (data?.name && data?.event) {
      // Flat check-in object: { id, name, event, time, status }
      dispatch({ type: "AN_CHECKIN", payload: data });
    } else if (data?.checkin) {
      dispatch({ type: "AN_CHECKIN", payload: data.checkin });
    } else if (data?.liveCount !== undefined || data?.scanVelocity !== undefined) {
      dispatch({ type: "AN_UPDATE", payload: data });
    }
  }, []);

  const { status: lbStatus } = useRealTimeConnection("/stream/leaderboard", {
    onMessage: onLeaderboardMessage,
  });

  const { status: anStatus } = useRealTimeConnection("/stream/analytics", {
    onMessage: onAnalyticsMessage,
  });

  useEffect(() => {
    dispatch({ type: "LB_STATUS", payload: lbStatus });
  }, [lbStatus]);

  useEffect(() => {
    dispatch({ type: "AN_STATUS", payload: anStatus });
  }, [anStatus]);

  return (
    <RealTimeContext.Provider value={state}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const ctx = useContext(RealTimeContext);
  if (!ctx) throw new Error("useRealTime must be used inside RealTimeProvider");
  return ctx;
}

export const useLeaderboardStream = () => useRealTime().leaderboard;
export const useAnalyticsStream = () => useRealTime().analytics;
