<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from "react";
=======
import { useRef } from "react";
>>>>>>> f35178a86bcf2d8a09d2f9fa4a9f024ba75738b7
import EventHero from "./EventHero";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
<<<<<<< HEAD
import StyledDropdown from "../../components/StyledDropdown";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveFilters from "./ActiveFilters";
import { getRouteSearchResults } from "../../utils/searchUtils";
import PageLoader from "../../components/common/PageLoader";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EVENT_SEARCH_KEYS = [
  "title",
  "description",
  "location",
  "tags",
  "type",
  "date",
  "status",
];

const renderCardSection = (
  isLoading,
  filteredEvents,
  viewMode,
  filterType,
  searchQuery,
  onClearSearch,
) => {
 if (isLoading) {
  return (
    <PageLoader text="Loading events..." />
  );
}

  if (filteredEvents.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <SearchEmptyState
          query={searchQuery}
          itemLabel="events"
          browseLabel="Browse All Events"
          browsePath="/events"
          onClear={onClearSearch}
          popularTags={["AI", "Blockchain", "Web", "DevOps", "React", "UX"]}
        />
      </div>
    );
  }

  return (
    <div
      key={filterType + viewMode}
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
    >
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
=======
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
>>>>>>> f35178a86bcf2d8a09d2f9fa4a9f024ba75738b7

const EventsPage = () => {
  const cardSectionRef = useRef();
  const listing = useEventListing();

  const handleSearch = (query = "") => {
    listing.setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    listing.setSafePage(page);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={listing.searchQuery}
        setSearchQuery={listing.setSearchQuery}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {listing.loadError && !listing.isLoading ? (
          <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-red-100 dark:border-red-900/40 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Failed to load events
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {listing.loadError}
            </p>
            <button
              type="button"
              onClick={listing.fetchEvents}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : null}

        <EventFiltersToolbar
          filterType={listing.filterType}
          onFilterChange={listing.setFilterType}
          sortType={listing.sortType}
          onSortChange={listing.setSortType}
          viewMode={listing.viewMode}
          onViewModeChange={listing.setViewMode}
        />

        {!listing.loadError && (
          <EventCardSection
            isLoading={listing.isLoading}
            events={listing.paginatedEvents}
            viewMode={listing.viewMode}
            filterType={listing.filterType}
          />
        )}

        {!listing.isLoading && !listing.loadError && (
          <PaginationControls
            currentPage={listing.currentPage}
            eventsPerPage={listing.eventsPerPage}
            totalEvents={listing.filteredEvents.length}
            totalPages={listing.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={listing.setEventsPerPage}
          />
        )}
      </div>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;