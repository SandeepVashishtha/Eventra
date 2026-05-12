// Importing necessary React hooks and libraries
import { useState, useEffect, useRef } from "react";
import mockEvents from "./eventsMockData.json"; // mock data file
import EventHero from "./EventHero"; // Hero section with search
import EventCard from "./EventCard"; // Card for displaying event details
import { Grid, List, Search, RefreshCcw } from "lucide-react"; // icons for toggle view
import FeedbackButton from "../../components/FeedbackButton"; // Feedback button component
import EventCTA from "./EventCTA";
import Fuse from "fuse.js";
import StyledDropdown from "../../components/StyledDropdown";
import { motion } from "framer-motion";
// -----------------------------
// Main Events Page Component
// -----------------------------
const EventsPage = () => {
  // tate to store all events (raw data from mock file)
  const [events, setEvents] = useState([]);
  // State for filter type (all, upcoming, past, conference, workshop)
  const [filterType, setFilterType] = useState("all");
  // State for switching between grid view and list view
  const [viewMode, setViewMode] = useState("grid");
  // State for storing user’s search query (from search bar)
  const [searchQuery, setSearchQuery] = useState("");
  // State for storing the filtered + searched list of events
  const [filteredEvents, setFilteredEvents] = useState([]);
  // Sort type state
  const [sortType, setSortType] = useState("Newest");
  const cardSectionRef = useRef();
  // -----------------------------
  // Load events from mock JSON when component mounts
  // -----------------------------
  useEffect(() => {
    setEvents(mockEvents); // Setting mock data as events
  }, []);

  // Fuse.js setup
  const fuse = new Fuse(events, {
    keys: ["title", "description", "location", "tags", "type"],
    threshold: 0.35, // adjust for fuzziness
  });

  // -----------------------------
  // Search handler function
  // -----------------------------
  const handleSearch = (query = "") => {
    setSearchQuery(query);

    let results = events;
    if (query.trim()) {
      results = fuse.search(query).map((res) => res.item);
    }

    // Apply filterType after fuzzy results
    const final = results.filter((event) => {
      return (
        filterType === "all" ||
        (filterType === "upcoming" && event.status === "upcoming") ||
        (filterType === "past" && event.status === "past") ||
        event.type === filterType
      );
    });

    setFilteredEvents(final);
  };

  // Recalculate when filterType or events change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [events, filterType]);

  // Sort handler
  const handleSortChange = (type) => {
    setSortType(type);
    let sorted = [...filteredEvents];
    if (type === "Newest") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (type === "upcoming") {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    setFilteredEvents(sorted);
  };

  // Ensure sorting is applied when filter/search changes
  useEffect(() => {
    handleSortChange(sortType);
    // eslint-disable-next-line
  }, [filterType, searchQuery]);

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // -----------------------------
  // JSX Render
  // -----------------------------
  return (
    // UPDATED: Main page background
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* Hero section will be updated in the next step */}
      <EventHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredEvents={filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      {/* Main content wrapper */}
      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {/* Filters + Sort + Toggle View Section */}
        <div
          className="mb-8 sm:mb-10 flex flex-col gap-4"
        >
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "conference", label: "Conferences" },
              { key: "workshop", label: "Workshops" },
            ].map((filter, index) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition ${
                  filterType === filter.key
                    ? "bg-black text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
                }`}
                aria-pressed={filterType === filter.key}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <StyledDropdown
                label=""
                value={sortType === "" ? "" : sortType}
                onChange={handleSortChange}
                options={["Newest", "Upcoming"]}
                placeholder="Sort by Date"
              />
            </div>

            {/* Toggle View Buttons (Grid / List) */}
            <div
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-black text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "list"
                    ? "bg-black text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Event Cards Section */}
        {filteredEvents.length > 0 ? (
          <div
            key={filterType + viewMode}
            className={`grid gap-8 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3"
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-xl backdrop-blur-sm"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10 rounded-full" />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-8"
            >
              <Search className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
            </motion.div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              No events found
            </h3>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
              We couldn't find any events matching <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{searchQuery || filterType}"</span>. 
              Try adjusting your filters or using different keywords.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  handleSearch("");
                }}
                className="group relative flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <RefreshCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                Clear All Filters
              </button>
              
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleSearch("");
                }}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                View All Events
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* These components will be updated in the next steps */}

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
