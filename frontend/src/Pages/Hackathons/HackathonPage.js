import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import mockHackathons from './hackathonMockData.json';

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-100 rounded mb-4"></div>
      <div className="space-y-3 mb-4">
        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const HackathonHub = () => {
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    prize: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setHackathons(mockHackathons);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  const filteredHackathons = hackathons
    .filter(hackathon => {
      if (activeTab === 'all') return true;
      return hackathon.status === activeTab;
    })
    .filter(hackathon => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        hackathon.title.toLowerCase().includes(query) ||
        hackathon.description.toLowerCase().includes(query) ||
        hackathon.location.toLowerCase().includes(query) ||
        hackathon.techStack.some(tech => tech.toLowerCase().includes(query))
      );
    })
    .filter(hackathon => {
      if (filters.difficulty && hackathon.difficulty !== filters.difficulty) return false;
      if (filters.prize && !hackathon.prize.toLowerCase().includes(filters.prize.toLowerCase())) return false;
      if (filters.location && !hackathon.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });

  const featuredHackathons = [...hackathons].filter(h => h.featured).slice(0, 3);

  const HackathonCard = ({ hackathon, isFeatured = false }) => (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${isFeatured ? 'ring-2 ring-indigo-500' : ''}`}
      variants={item}
      whileHover={{ y: -4 }}
    >
      {isFeatured && (
        <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1">
          Featured
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              hackathon.status === 'live' ? 'bg-red-100 text-red-800' :
              hackathon.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
            </span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
              {hackathon.difficulty}
            </span>
          </div>
          <span className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {hackathon.prize}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{hackathon.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hackathon.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(hackathon.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })} - {new Date(hackathon.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hackathon.location}
          </div>
          {hackathon.status === 'live' && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Time Left:</span> {hackathon.timeLeft}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {hackathon.techStack.map((tech, index) => (
              <span key={index} className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {hackathon.status === 'live' && (
          <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{hackathon.participants}</div>
              <div className="text-xs text-gray-500">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{hackathon.teams}</div>
              <div className="text-xs text-gray-500">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{hackathon.submissions}</div>
              <div className="text-xs text-gray-500">Submissions</div>
            </div>
          </div>
        )}

        {hackathon.status === 'completed' && hackathon.winner && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">🏆</span>
              <span className="text-sm font-medium">Winner: </span>
              <span className="ml-1 text-sm text-gray-700">{hackathon.winner}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          {hackathon.status === 'live' ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Join Now
              </button>
              <button className="px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                Submit Project
              </button>
            </div>
          ) : hackathon.status === 'upcoming' ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Register
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Set Reminder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-colors">
                View Results
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Resources
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Reset filters
  const resetFilters = () => {
    setFilters({
      difficulty: '',
      prize: '',
      location: ''
    });
    setSearchQuery('');
  };

  // Get unique values for filters
  const difficulties = [...new Set(hackathons.map(h => h.difficulty))];
  const locations = [...new Set(hackathons.map(h => h.location))];

  useEffect(()=>{
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },[])

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white"
          title="Host a Hackathon"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Link>
      </motion.div>
      {/* Hero Section */}
      <div className="bg-indigo-50 text-gray-900 py-16 border-t border-gray-200">
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
              <span className="block text-indigo-600">Hackathons</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Find and join the most exciting hackathons, compete with the best, and win amazing prizes
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
                  placeholder="Search hackathons by name, location, or tags..."
                  className="block w-full pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-xs text-gray-500 opacity-80">
                  Try: "AI", "blockchain", "remote"
                </span>
                <span className="text-xs text-indigo-100 opacity-60">
                  {filteredHackathons.length} {filteredHackathons.length === 1 ? 'hackathon' : 'hackathons'} found
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Featured Hackathons */}
      {!isLoading && featuredHackathons.length > 0 && (
        <div className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Hackathons</h2>
              <Link to="/hackathons?filter=featured" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View all featured
              </Link>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredHackathons.map((hackathon) => (
                <HackathonCard key={`featured-${hackathon.id}`} hackathon={hackathon} isFeatured={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hackathons Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Hackathons</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {(filters.difficulty || filters.prize || filters.location) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) =>
                      setFilters({ ...filters, difficulty: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 pr-10 text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prize Pool
                  </label>
                  <select
                    value={filters.prize}
                    onChange={(e) =>
                      setFilters({ ...filters, prize: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 pr-10 text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Any Prize</option>
                    <option value="$">Under $1,000</option>
                    <option value="1,000">$1,000 - $5,000</option>
                    <option value="5,000">$5,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 pr-10 text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        {/* Tabs */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
          variants={item}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Hackathons' },
              { key: 'live', label: 'Live Now' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hackathons Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          ) : filteredHackathons.length > 0 ? (
            <motion.div
              key={activeTab}
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {filteredHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-auto max-w-md px-4">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No hackathons found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filters.difficulty || filters.prize || filters.location
                    ? 'No hackathons match your current filters. Try adjusting your search or filters.'
                    : 'Check back later for exciting new hackathons!'}

                </p>
                <div className="mt-6">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HackathonHub;
