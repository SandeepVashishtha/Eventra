import { useEffect, useMemo, useState } from "react";
import {
  FILTER_SUGGESTIONS_STORAGE_KEY,
  generateFilterSuggestions,
  readSuggestionHistory,
  recordFilterActivity,
  recordVisibleEventSignals,
  writeSuggestionHistory,
} from "../utils/filterSuggestions.js";

export const useFilterSuggestions = ({
  currentFilters = {},
  visibleEvents = [],
  presets = [],
  storage = globalThis.localStorage,
  storageKey = FILTER_SUGGESTIONS_STORAGE_KEY,
  limit = 10,
} = {}) => {
  const [history, setHistory] = useState(() => readSuggestionHistory(storage, storageKey));

  const filterSignature = useMemo(() => JSON.stringify(currentFilters || {}), [currentFilters]);

  const visibleEventSignature = useMemo(
    () =>
      JSON.stringify(
        (Array.isArray(visibleEvents) ? visibleEvents : []).slice(0, 12).map((event) => ({
          id: event?.id,
          title: event?.title || event?.name,
          category: event?.category || event?.type,
          location: event?.location,
          mode: event?.eventMode || event?.mode,
        }))
      ),
    [visibleEvents]
  );

  useEffect(() => {
    const storedHistory = readSuggestionHistory(storage, storageKey);
    setHistory(storedHistory);
  }, [storage, storageKey]);

  useEffect(() => {
    setHistory((previous) => {
      const next = recordFilterActivity(previous, currentFilters);
      writeSuggestionHistory(next, storage, storageKey);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSignature, storage, storageKey]);

  useEffect(() => {
    if (!Array.isArray(visibleEvents) || visibleEvents.length === 0) return;

    setHistory((previous) => {
      const next = recordVisibleEventSignals(previous, visibleEvents);
      writeSuggestionHistory(next, storage, storageKey);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEventSignature, storage, storageKey]);

  const suggestions = useMemo(
    () =>
      generateFilterSuggestions({
        history,
        events: visibleEvents,
        presets,
        limit,
      }),
    [history, limit, presets, visibleEvents]
  );

  return {
    suggestions,
    history,
  };
};

export default useFilterSuggestions;
