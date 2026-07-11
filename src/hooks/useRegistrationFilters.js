// src/hooks/useRegistrationFilters.js
import { useMemo } from 'react';

const TYPE_OPTIONS = ["Event", "Hackathon", "Project"];
const STATUS_OPTIONS = ["Upcoming", "Completed", "In Progress", "Done"];
const TICKET_TYPE_OPTIONS = ["All", "VIP", "Early Bird", "General"];
const SORT_OPTIONS = ["Event Date (Newest)", "Event Date (Oldest)", "Purchase Date (Newest)", "Purchase Date (Oldest)"];

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

// Helper: Filter by ticket type
const filterByTicketType = (items, ticketType) => {
  if (!ticketType || ticketType === "All") return items;
  return items.filter(item => item.ticketType === ticketType || (ticketType === "General" && !item.ticketType));
};

// Helper: Sort items
const sortItems = (items, sortBy) => {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date || a.purchaseDate || 0).getTime();
    const dateB = new Date(b.date || b.purchaseDate || 0).getTime();
    const purchaseA = new Date(a.purchaseDate || a.date || 0).getTime();
    const purchaseB = new Date(b.purchaseDate || b.date || 0).getTime();
    
    switch (sortBy) {
      case "Event Date (Newest)": return dateB - dateA;
      case "Event Date (Oldest)": return dateA - dateB;
      case "Purchase Date (Newest)": return purchaseB - purchaseA;
      case "Purchase Date (Oldest)": return purchaseA - purchaseB;
      default: return 0;
    }
  });
};

export function useRegistrationFilters(data, searchTerm, selectedTypes, selectedStatuses, ticketType, sortBy) {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    let result = [...data];
    result = filterBySearch(result, searchTerm);
    result = filterByTypes(result, selectedTypes);
    result = filterByStatuses(result, selectedStatuses);
    result = filterByTicketType(result, ticketType);
    result = sortItems(result, sortBy);
    
    return result;
  }, [data, searchTerm, selectedTypes, selectedStatuses, ticketType, sortBy]);
}

export { TYPE_OPTIONS, STATUS_OPTIONS, TICKET_TYPE_OPTIONS, SORT_OPTIONS };