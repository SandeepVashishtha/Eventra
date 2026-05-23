import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import EventHero from "./EventHero";
import EventCardSection from "./EventCardSection";
import EventCTA from "./EventCTA";
import FeedbackButton from "../../components/FeedbackButton";
import EventFiltersToolbar from "./EventFiltersToolbar";
import PaginationControls from "./PaginationControls";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useEventListing from "./useEventListing";

const EventsPage = () => {
  useDocumentTitle("Eventra | Events");
  const location = useLocation();
  const routeSearchQuery = new URLSearchParams(location.search).get("search") || "";
  const cardSectionRef = useRef();
  const listing = useEventListing();
  const { setSearchQuery } = listing;

  const handleSearch = (query = "") => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    listing.setSafePage(page);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(() => {
      setSearchQuery(routeSearchQuery);
    }, 0);
  }, [routeSearchQuery, setSearchQuery]);

  useEffect(() => {
    if (!listing.isLoading && routeSearchQuery) {
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [listing.isLoading, routeSearchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={listing.searchQuery}
        setSearchQuery={setSearchQuery}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        <EventFiltersToolbar
          filterType={listing.filterType}
          onFilterChange={listing.setFilterType}
          sortType={listing.sortType}
          onSortChange={listing.setSortType}
          viewMode={listing.viewMode}
          onViewModeChange={listing.setViewMode}
        />

        {listing.loadError ? (
          <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-red-100 dark:border-red-900 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <div className="mx-auto max-w-xl">
              <p className="text-lg font-semibold text-red-600 dark:text-red-300">
                Failed to load events
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {listing.loadError}
              </p>
              <button
                type="button"
                onClick={listing.fetchEvents}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <EventCardSection
              isLoading={listing.isLoading}
              events={listing.paginatedEvents}
              viewMode={listing.viewMode}
              filterType={listing.filterType}
              onClearFilters={() => {
                listing.setFilterType("all");
                listing.setSortType("Newest");
                setSearchQuery("");
              }}
            />

            {!listing.isLoading && (
              <PaginationControls
                currentPage={listing.currentPage}
                eventsPerPage={listing.eventsPerPage}
                totalEvents={listing.filteredEvents.length}
                totalPages={listing.totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={listing.setEventsPerPage}
              />
            )}
          </>
        )}
      </div>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;