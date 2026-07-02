// src/hooks/useRegistrationFilters.js
import { useMemo } from 'react';

const TYPE_OPTIONS = ["Event", "Hackathon", "Project"];
const STATUS_OPTIONS = ["Upcoming", "Completed", "In Progress", "Done"];

export function useRegistrationFilters(data, searchTerm, selectedTypes, selectedStatuses) {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    let result = [...data];

    // Filter by search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(search) ||
        item.type?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search)
      );
    }

    // Filter by types
    if (selectedTypes.length > 0 && !selectedTypes.includes("All")) {
      result = result.filter(item => selectedTypes.includes(item.type));
    }

    // Filter by statuses
    if (selectedStatuses.length > 0 && !selectedStatuses.includes("All")) {
      result = result.filter(item => selectedStatuses.includes(item.status));
    }

    return result;
  }, [data, searchTerm, selectedTypes, selectedStatuses]);
}

export { TYPE_OPTIONS, STATUS_OPTIONS };