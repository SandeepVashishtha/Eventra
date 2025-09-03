import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import mockEvents from './eventsMockData.json';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Mock data for events
  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const filterEvents = (events, query = '') => {
    const normalizedQuery = query.toLowerCase().trim();

    return events.filter(event => {
      // Filter by type (all, upcoming, past, etc.)
      const matchesFilterType =
        filterType === 'all' ||
        (filterType === 'upcoming' && event.status === 'upcoming') ||
        (filterType === 'past' && event.status === 'past') ||
        event.type === filterType;

      // If no search query, just return filtered by type
      if (!normalizedQuery) return matchesFilterType;

      // Check if event matches search query
      const matchesSearch =
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery) ||
        event.location.toLowerCase().includes(normalizedQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
        event.type.toLowerCase().includes(normalizedQuery);

      return matchesFilterType && matchesSearch;
    });
  };

  useEffect(() => {
    // Update filtered events when events, filterType, or searchQuery changes
    setFilteredEvents(filterEvents(events, searchQuery));
  }, [events, filterType, searchQuery]);

  const handleSearch = (query = searchQuery) => {
    setSearchQuery(query);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  useEffect(()=>{
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },[])

  const EventCard = ({ event }) => (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      variants={item}
      whileHover={{ y: -4 }}
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {event.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
            {event.type}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {event.time}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'
                    }/${i + 10}.jpg`}
                  alt="Attendee"
                />
              ))}
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                +{Math.max(0, event.attendees - 3)}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">{event.attendees} attending</span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            {event.status === 'upcoming' ? 'Register Now' : 'View Details'}
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-100 text-gray-900 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl font-bold mb-4"
            >
              Discover Amazing
              <span className="block text-indigo-600">Tech Events</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Find and join the most exciting tech events, conferences, and workshops
            </motion.p>

            <motion.div
              variants={item}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search events by name, location, or tags..."
                  className="block w-full pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200 shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleSearch('');
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-xs text-indigo-100 opacity-80">
                  Try: "conference", "workshop", "this weekend"
                </span>
                <span className="text-xs text-indigo-100 opacity-60">
                  {filteredEvents.length} events found
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
          variants={item}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Events' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past Events' },
              { key: 'conference', label: 'Conferences' },
              { key: 'workshop', label: 'Workshops' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filterType === filter.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {filteredEvents.length > 0 ? (
            <motion.div
              key={filterType + viewMode}
              className={`grid gap-8 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-4xl mx-auto'
                }`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} viewMode={viewMode} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-4">
                <svg
                  className="h-12 w-12 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any events matching your criteria. Try adjusting your filters or check back later.
              </p>
              <button
                onClick={() => setFilterType('all')}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-100 text-gray-900 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Host your own event</h2>
          <p className="text-lg text-gray-600 mb-8">
            Want to organize a tech event? Join our community of event organizers and reach thousands of developers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create-event"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create an Event
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;