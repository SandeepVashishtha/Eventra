import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useDebounce from "../hooks/useDebounce";
import EmptyState from "./common/EmptyState";
import { FilterX, Heart } from "lucide-react";
import "./styles/components.css";

const SearchFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
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
    {
      id: 3,
      title: "UX Design Workshop",
      category: "design",
      location: "New York",
      date: "2025-08-10",
      price: "paid",
      image: "🎨",
      attendees: 75,
      rating: 4.9,
      description: "Learn advanced UX design principles",
    },
    {
      id: 4,
      title: "Digital Marketing Masterclass",
      category: "marketing",
      location: "London",
      date: "2025-08-25",
      price: "paid",
      image: "📈",
      attendees: 150,
      rating: 4.7,
      description: "Master the latest digital marketing strategies",
    },
    {
      id: 5,
      title: "Open Source Hackathon",
      category: "technology",
      location: "Berlin",
      date: "2025-09-01",
      price: "free",
      image: "💻",
      attendees: 300,
      rating: 4.8,
      description: "48-hour coding challenge for open source projects",
    },
    {
      id: 6,
      title: "Healthcare Innovation Forum",
      category: "healthcare",
      location: "Online",
      date: "2025-08-30",
      price: "free",
      image: "🏥",
      attendees: 400,
      rating: 4.5,
      description: "Exploring the future of healthcare technology",
    },
  ];

  // 🔥 FIX: Safe date formatter to prevent RangeError crashes if event data is malformed
  const safeFormatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString();
  };

  const filteredEvents = mockEvents.filter(event => {
    const safeSearchTerm = (debouncedSearchTerm || "").toLowerCase();
    
    // 🔥 FIX: Added fallback empty strings to prevent TypeError crashes if event data is incomplete
    const matchesSearch = 
      (event.title || "").toLowerCase().includes(safeSearchTerm) ||
      (event.description || "").toLowerCase().includes(safeSearchTerm);
      
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    const normalizedLocation = event.location
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    const matchesLocation = selectedLocation === 'all' || (normalizedLocation === selectedLocation);
    const matchesPrice = priceFilter === 'all' || event.price === priceFilter;
    const today = new Date();
const eventDate = new Date(event.date);

let matchesDate = true;

if (dateFilter === "today") {
  matchesDate =
    eventDate.toDateString() === today.toDateString();
}

if (dateFilter === "weekend") {
  const day = eventDate.getDay();
  matchesDate = day === 0 || day === 6;
}

if (dateFilter === "nextMonth") {
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  matchesDate =
    eventDate.getMonth() === nextMonth.getMonth() &&
    eventDate.getFullYear() === nextMonth.getFullYear();
}
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });
  useState(() => {});

  return (
    <div className="search-filter-container bg-gray-50 dark:bg-black">
      <div className="search-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold"
          style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
        >
          {"Discover Amazing Events 🎯"}
        </motion.h1>
        <p className="search-subtitle ">
          Find the perfect event for your interests
        </p>
      </div>

      {/* Search Bar */}
      <motion.div
      whileHover={{
  scale: 1.03,
  y: -5
}}
whileTap={{
  scale: 0.98
}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="search-bar"
      >
        <div className="search-input-wrapper">
          {/* 🔥 FIX: Added aria-hidden to prevent screen reader noise */}
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="search-events"
            type="text"
            aria-label="Search events"
            placeholder="Search events, topics, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="filters-container"
      >
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-location">Location</label>
          <select
            id="filter-location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="filter-select"
          >
            {locations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-price">Price</label>
          <select
            id="filter-price"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="results-count" role="status" aria-live="polite">
        <span>{filteredEvents.length} events found</span>
      </div>
      <div className="filter-group">
  <label htmlFor="filter-date">Date</label>
  <select
    id="filter-date"
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    className="filter-select"
  >
    <option value="all">All Dates</option>
    <option value="today">Today</option>
    <option value="weekend">This Weekend</option>
    <option value="nextMonth">Next Month</option>
  </select>
</div>
<button
  className="btn-outline"
  onClick={() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setPriceFilter("all");
    setDateFilter("all");
  }}
>
  Reset Filters
</button>

      {/* Events Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="events-grid"
      >
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="event-card-search"
          >
            <div className="event-image-large">
              {/* 🔥 FIX: Added aria-hidden to decorative emoji */}
              <div className="event-emoji" aria-hidden="true">{event.image}</div>
              <div className="event-badges">
                <span className={`price-badge ${event.price}`}>
                  {event.price === "free" ? "FREE" : "PAID"}
                </span>
              </div>
            </div>
            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-meta" aria-label="Event details">
                <span className="event-date">
                  <span role="img" aria-hidden="true" className="mr-1">📅</span> 
                  {/* 🔥 FIX: Safely parse date */}
                  {safeFormatDate(event.date)}
                </span>
                <span className="event-location">
                  <span role="img" aria-hidden="true" className="mr-1">📍</span> {event.location}
                </span>
                <span className="event-attendees">
                  <span role="img" aria-hidden="true" className="mr-1">👥</span> {event.attendees}
                </span>
              </div>
              <div className="event-rating" aria-label={`Rating: ${event.rating} out of 5 stars`}>
                <span className="stars" aria-hidden="true">⭐⭐⭐⭐⭐</span>
                <span className="rating-value">{event.rating}</span>
              </div>
              <div className="event-actions">
                <button className="btn-primary" aria-label={`Register for ${event.title}`}>Register Now</button>
                <button className="btn-outline" aria-label={`Learn more about ${event.title}`}>Learn More</button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredEvents.length === 0 && (
        <EmptyState
          icon={FilterX}
          title="No events found"
          description="Try adjusting your search criteria or clearing your filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSelectedLocation("all");
            setPriceFilter("all");
          }}
        />
      )}
    </div>
  );
};

export default SearchFilter;