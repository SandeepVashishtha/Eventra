import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUtils } from "../config/api";
import { logError } from "../utils/errorLogger";
import { toast } from "react-toastify";

const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetchAnalytics = async () => {
      try {
        const res = await apiUtils.get("/analytics/summary");
        setAnalytics(res.data);
      } catch (err) {
        logError(err, null, { hook: "useAnalytics", action: "fetchAnalytics" });
        setError(err);
        toast.error("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  return { analytics, loading, error };
};

export default useAnalytics;