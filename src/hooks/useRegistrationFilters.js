// src/hooks/useRegistrationFilters.js
import { useMemo } from 'react';

const TYPE_OPTIONS = ["Event", "Hackathon", "Project"];
const STATUS_OPTIONS = ["Upcoming", "Completed", "In Progress", "Done"];

// Helper: Filter by search term
const filterBySearch = (items, searchTerm) => {
  if (!searchTerm?.trim()) return items;
  const search = searchTerm.toLowerCase().trim();
  return items.filter(item =>
    item.title?.toLowerCase().includes(search) ||
    item.type?.toLowerCase().includes(search) ||
    item.location?.toLowerCase().includes(search)
  );
};

// Helper: Filter by selected types
const filterByTypes = (items, selectedTypes) => {
  if (!selectedTypes?.length || selectedTypes.includes("All")) return items;
  return items.filter(item => selectedTypes.includes(item.type));
};

// Helper: Filter by selected statuses
const filterByStatuses = (items, selectedStatuses) => {
  if (!selectedStatuses?.length || selectedStatuses.includes("All")) return items;
  return items.filter(item => selectedStatuses.includes(item.status));
};

export function useRegistrationFilters(data, searchTerm, selectedTypes, selectedStatuses) {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    let result = [...data];
    result = filterBySearch(result, searchTerm);
    result = filterByTypes(result, selectedTypes);
    result = filterByStatuses(result, selectedStatuses);
    
    return result;
  }, [data, searchTerm, selectedTypes, selectedStatuses]);
}

export { TYPE_OPTIONS, STATUS_OPTIONS };