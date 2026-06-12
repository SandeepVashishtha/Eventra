import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();
        setAnalytics(data);
      } catch {
        // falls back to mock data silently
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  return { analytics, loading };
};

export default useAnalytics;
