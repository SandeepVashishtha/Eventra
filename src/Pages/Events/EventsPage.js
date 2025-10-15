// Importing necessary React hooks and libraries
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // for animations
import mockEvents from "./eventsMockData.json"; // mock data file
import EventHero from "./EventHero"; // Hero section with search
import EventCard from "./EventCard"; // Card for displaying event details
import { Grid, List } from "lucide-react"; // icons for toggle view
import FeedbackButton from "../../components/FeedbackButton"; // Feedback button component
import EventCTA from "./EventCTA";
import Fuse from "fuse.js";
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
  const [sortType, setSortType] = useState("newest");
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
    if (type === "newest") {
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

  // -----------------------------
  // Animation Variants
  // -----------------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }, // stagger animation for children
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 }, // slide up effect
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // -----------------------------
  // JSX Render
  // -----------------------------
  return (
    // UPDATED: Main page background
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
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
        <motion.div
          className="mb-8 sm:mb-10 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          // AOS Implementation
          data-aos="fade-up"
          data-aos-duration="800"
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
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
                }`}
                aria-pressed={filterType === filter.key}
                data-aos="zoom-in"
                data-aos-delay={index * 50}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-events" className="sr-only">Sort events</label>
              <select
                id="sort-events"
                className="w-full sm:w-auto p-2 text-xs sm:text-sm rounded-3xl border border-gray-200 
                dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={sortType}
                onChange={e => handleSortChange(e.target.value)}
                aria-label="Sort events"
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <option value="newest">Newest</option>
                <option value="upcoming">Upcoming Soonest</option>
              </select>
            </div>

            {/* Toggle View Buttons (Grid / List) */}
            <div 
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md"
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
                    ? "bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Event Cards Section */}
        <AnimatePresence mode="wait">
          {filteredEvents.length > 0 ? (
            <motion.div
              key={filterType + viewMode} // re-trigger animation when filter/view changes
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // grid view
                  : "grid-cols-1 max-w-4xl mx-auto" // list view
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              // UPDATED: "No Events Found" message styles
              className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
              initial={{ opacity: 0, y: 30, scale: 0.95 }} // Initial animation state
              animate={{ opacity: 1, y: 0, scale: 1 }} // Animate to visible
              transition={{ duration: 0.6, ease: "easeOut" }} // Animation timing
              data-aos="zoom-in"
            >
              {/* NOTE: You'll need to update the text colors inside this block as well */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* These components will be updated in the next steps */}

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;