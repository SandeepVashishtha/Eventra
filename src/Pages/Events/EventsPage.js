import { useRef } from "react";
import EventHero from "./EventHero";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { darkTheme } from "../../components/styles/theme";

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
    <div
      className={`
        ${darkTheme.section}
        flex flex-col
        min-h-screen
        overflow-x-hidden
      `}
    >
      <EventHero
        searchQuery={listing.searchQuery}
        setSearchQuery={listing.setSearchQuery}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full"
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
          searchQuery={listing.searchQuery}
          onSearchChange={listing.setSearchQuery}
        />

{!listing.loadError && (
  <EventCardSection
    isLoading={listing.isLoading}
    events={listing.paginatedEvents}
    viewMode={listing.viewMode}
    filterType={listing.filterType}
    onClearFilters={() => {
      listing.setSearchQuery("");
      listing.setFilterType("all");
    }}
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
