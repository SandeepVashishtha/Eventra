import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    // 🔥 FIX: Abort in-flight requests when the component unmounts or the
    // token changes. Previously the fetch could resolve after unmount and
    // call setAnalytics / setLoading, triggering React's "state update on an
    // unmounted component" warning and leaking a dangling promise.
    const controller = new AbortController();
    let aborted = false;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/analytics/summary`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        if (aborted) return;
        setAnalytics(data);
      } catch (err) {
        // Ignore AbortError — the request was cancelled on unmount, not a real failure
        if (err?.name === "AbortError" || aborted) return;
        // falls back to mock data silently
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    fetchAnalytics();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [token]);

  return { analytics, loading };
};

export default useAnalytics;
