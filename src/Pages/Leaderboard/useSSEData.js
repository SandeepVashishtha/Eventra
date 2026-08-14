import { useState, useEffect } from "react";

export default function useSSEData(url) {
  const [data, setData] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsLive(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (Array.isArray(parsedData)) {
          setData(parsedData);
        } else {
          setData((prev) => [...prev, parsedData]);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error", err);
        setIsLive(false);
        setError(err);
        eventSource.close();
      };
    } catch (err) {
      setError(err);
      setIsLive(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [url]);

  return { data, isLive, error };
}
