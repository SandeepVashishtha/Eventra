import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../components/styles/EventSection.css';
import EventImage from './common/EventImage';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Mock data for events
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: "React Conference 2025",
        date: "2025-03-15",
        time: "10:00 AM",
        location: "San Francisco, CA",
        type: "conference",
        status: "upcoming",
        description: "Join us for the biggest React conference of the year featuring latest updates and best practices.",
        attendees: 250,
        maxAttendees: 300,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
        tags: ["React", "Frontend", "JavaScript"]
      },
      {
        id: 2,
        title: "AI & Machine Learning Workshop",
        date: "2025-02-28",
        time: "2:00 PM",
        location: "Online",
        type: "workshop",
        status: "upcoming",
        description: "Hands-on workshop covering latest AI techniques and practical machine learning implementations.",
        attendees: 120,
        maxAttendees: 150,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
        tags: ["AI", "ML", "Python"]
      },
      {
        id: 3,
        title: "DevOps Summit 2024",
        date: "2024-12-10",
        time: "9:00 AM",
        location: "New York, NY",
        type: "summit",
        status: "past",
        description: "Comprehensive summit on modern DevOps practices and cloud technologies.",
        attendees: 400,
        maxAttendees: 400,
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
        tags: ["DevOps", "Cloud", "Infrastructure"]
      },
      {
        id: 4,
        title: "Blockchain Bootcamp",
        date: "2025-04-22",
        time: "1:00 PM",
        location: "Austin, TX",
        type: "bootcamp",
        status: "upcoming",
        description: "Intensive bootcamp covering blockchain development and cryptocurrency technologies.",
        attendees: 80,
        maxAttendees: 100,
        image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=200&fit=crop",
        tags: ["Blockchain", "Web3", "Solidity"]
      },
      {
        id: 5,
        title: "UX Design Masterclass",
        date: "2025-05-08",
        time: "3:00 PM",
        location: "Los Angeles, CA",
        type: "workshop",
        status: "upcoming",
        description: "Master the art of user experience design with industry experts and hands-on projects.",
        attendees: 65,
        maxAttendees: 80,
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
        tags: ["UX", "Design", "UI"]
      },
      {
        id: 6,
        title: "Cybersecurity Conference",
        date: "2025-06-12",
        time: "9:30 AM",
        location: "Seattle, WA",
        type: "conference",
        status: "upcoming",
        description: "Learn about the latest cybersecurity threats and protection strategies from industry leaders.",
        attendees: 180,
        maxAttendees: 200,
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop",
        tags: ["Security", "Privacy", "Protection"]
      },
      {
        id: 7,
        title: "Mobile App Development Workshop",
        date: "2025-07-15",
        time: "11:00 AM",
        location: "Chicago, IL",
        type: "workshop",
        status: "upcoming",
        description: "Build your first mobile app from scratch using modern frameworks and best practices.",
        attendees: 95,
        maxAttendees: 120,
        image: null, // No image provided
        tags: ["Mobile", "React Native", "Development"]
      },
      {
        id: 8,
        title: "Cloud Computing Summit",
        date: "2025-08-20",
        time: "9:00 AM",
        location: "Denver, CO",
        type: "summit",
        status: "upcoming",
        description: "Discover the latest trends in cloud computing and serverless architectures.",
        attendees: 220,
        maxAttendees: 280,
        image: "", // Empty image string
        tags: ["Cloud", "AWS", "Azure"]
      },
      {
        id: 9,
        title: "Data Science Bootcamp",
        date: "2025-09-10",
        time: "1:30 PM",
        location: "Online",
        type: "bootcamp",
        status: "upcoming",
        description: "Intensive data science training covering Python, machine learning, and data visualization.",
        attendees: 45,
        maxAttendees: 60,
        image: "https://invalid-url-that-will-fail.com/image.jpg", // Invalid URL to test error handling
        tags: ["Data Science", "Python", "Analytics"]
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    if (filterType === 'upcoming') return event.status === 'upcoming';
    if (filterType === 'past') return event.status === 'past';
    return event.type === filterType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    }
  };

  const EventCard = ({ event }) => (
    <motion.div
      className="event-card"
      variants={cardVariants}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="event-image">
        <EventImage 
          src={event.image} 
          alt={event.title}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="event-overlay">
          <motion.div 
            className={`status-badge ${event.status}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {event.status}
          </motion.div>
          <div className="attendance-indicator">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="event-content">
        <div className="event-header">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {event.title}
          </motion.h3>
          <motion.div 
            className="event-type"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {event.type}
          </motion.div>
        </div>
        
        <motion.p 
          className="event-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {event.description}
        </motion.p>
        
        <motion.div 
          className="event-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="detail">
            <span className="icon">📅</span>
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="detail">
            <span className="icon">🕐</span>
            <span>{event.time}</span>
          </div>
          <div className="detail">
            <span className="icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="detail">
            <span className="icon">👥</span>
            <span>{event.attendees}/{event.maxAttendees}</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="event-tags"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {event.tags.map((tag, index) => (
            <motion.span 
              key={index} 
              className="tag"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.div 
          className="event-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {event.status === 'upcoming' ? (
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              Register Now
            </motion.button>
          ) : (
            <motion.button 
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Details
            </motion.button>
          )}
          <motion.button 
            className="btn-outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="events-section">
      <div className="background-gradient"></div>
      <div className="floating-elements">
        <motion.div 
          className="floating-shape shape-1"
          animate={{ 
            rotate: 360,
            y: [-20, 20, -20],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        ></motion.div>
        <motion.div 
          className="floating-shape shape-2"
          animate={{ 
            rotate: -360,
            x: [-15, 15, -15],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        ></motion.div>
      </div>
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            Tech Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Discover and join amazing tech events, workshops, and conferences
          </motion.p>
        </motion.div>

        <motion.div 
          className="events-controls"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="filter-controls">
            {[
              { key: 'all', label: 'All Events' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past Events' },
              { key: 'conference', label: 'Conferences' },
              { key: 'workshop', label: 'Workshops' }
            ].map((filter, index) => (
              <motion.button
                key={filter.key}
                className={filterType === filter.key ? 'active' : ''}
                onClick={() => setFilterType(filter.key)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          <div className="view-controls">
            <motion.button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="view-icon">⊞</span>
            </motion.button>
            <motion.button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="view-icon">☰</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filterType + viewMode}
            className={`events-grid ${viewMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {filteredEvents.length === 0 && (
            <motion.div 
              className="no-events"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="no-events-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <h3>No events found</h3>
              <p>Try adjusting your filters or check back later for new events.</p>
              <motion.button
                className="btn-primary"
                onClick={() => setFilterType('all')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Show All Events
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventsSection;