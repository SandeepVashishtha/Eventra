import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useDebounce from "../hooks/useDebounce";
import EmptyState from "./common/EmptyState";
import "./styles/components.css";

const SearchFilter = () => {
  const getInitialSearchParam = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("search") || "";
    }
    return "";
  };

  const [searchTerm, setSearchTerm] = useState(getInitialSearchParam);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteEvents");
    return saved ? JSON.parse(saved) : [];
});

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
  ];

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "online", label: "Online" },
    { value: "new-york", label: "New York" },
    { value: "san-francisco", label: "San Francisco" },
    { value: "london", label: "London" },
    { value: "berlin", label: "Berlin" },
    { value: "tokyo", label: "Tokyo" },
  ];

  useEffect(() => {
    if(typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
      }

      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");

      window.history.replaceState(null, "", newUrl);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get("search") || "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem(
    "favoriteEvents",
    JSON.stringify(favorites)
    );
  }, [favorites]);
  
  const mockEvents = [
    {
      id: 1,
      title: "AI & Machine Learning Summit 2025",
      category: "technology",
      location: "San Francisco",
      date: "2025-09-15",
      price: "paid",
      image: "🤖",
      attendees: 500,
      rating: 4.8,
      description: "Join industry leaders for cutting-edge AI discussions",
    },
    {
      id: 2,
      title: "Startup Pitch Competition",
      category: "business",
      location: "Online",
      date: "2025-08-20",
      price: "free",
      image: "✨",
      attendees: 200,
      rating: 4.6,
      description: "Pitch your startup idea to top investors",
    },
  ];

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString();
  };

  const filteredEvents = mockEvents.filter((event) => {
    const term = debouncedSearchTerm.toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;

    const normalizedLocation = event.location
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const matchesLocation =
      selectedLocation === "all" || normalizedLocation === selectedLocation;

    const matchesPrice =
      priceFilter === "all" || event.price === priceFilter;

    const today = new Date();
    const eventDate = new Date(event.date);

    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = eventDate.toDateString() === today.toDateString();
    }

    if (dateFilter === "weekend") {
      const day = eventDate.getDay();
      matchesDate = day === 0 || day === 6;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesPrice &&
      matchesDate
    );
  });

  return (
    <div className="search-filter-container bg-gray-50 dark:bg-black">
      <div className="search-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white"
        >
          Discover Amazing Events 🎯
        </motion.h1>

        <p className="search-subtitle">
          Find the perfect event for your interests
        </p>
      </div>

      <motion.div
        whileHover={{scale: 1.03, y: -5}}
        whileTap={{scale: 0.98}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="search-bar"
      >
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </motion.div>

      <div className="filters-container">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="results-count">
        {filteredEvents.length} events found
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          type={searchTerm ? "search" : "filters"}
          title="No events found"
          description="Try adjusting filters"
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card-search">
              <div className="event-emoji">{event.image}</div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
