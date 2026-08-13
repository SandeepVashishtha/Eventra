import { useEffect, useState } from "react";

export default function useLeaderboardUpdate(onUpdate = () => {}) {
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time score updates
      onUpdate();
    }, 2000); // Throttle score updates to avoid layout starvation loops (#16540)

    return () => clearInterval(interval);
  }, [onUpdate]);
}
