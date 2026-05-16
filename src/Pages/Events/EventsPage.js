import React, { useEffect } from "react";
import { useRef } from "react";
import EventHero from "./EventHero";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";

const EventsPage = () => {
  const cardSectionRef = useRef();
  const listing = useEventListing();

  const handleSearch = (query = "") => {
    listing.setSearchQuery(query);
  };

  // Fix: Syncing with listing custom hook properties safely
  useEffect(() => {
    if (listing.searchQuery !== undefined) {
      handleSearch(listing.searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.events, listing.filterType]);

  const handleSortChange = (type) => {
    if (typeof listing.setSortType === "function") {
      listing.setSortType(type);
    }
    // Note: GSoC baseline repository sorts dynamically via hook, keeping wrapper safe
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
        <EventFiltersToolbar
          filterType={listing.filterType}
          onFilterChange={listing.setFilterType}
          sortType={listing.sortType}
          onSortChange={handleSortChange}
          viewMode={listing.viewMode}
          onViewModeChange={listing.setViewMode}
        />

        <EventCardSection
          isLoading={listing.isLoading}
          events={listing.paginatedEvents}
          viewMode={listing.viewMode}
          filterType={listing.filterType}
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
      </div>

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;