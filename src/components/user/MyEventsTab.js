/**
 * MyEventsTab.js
 *
 * Renders inside UserDashboard when the user clicks "My Events" in the sidebar.
 * Shows all events the logged-in user has registered to attend.
 *
 * Features (current):
 *  - Card grid of registered events with status, date, location, type badges
 *  - Empty state with a CTA to explore events
 *  - Search / filter bar (by keyword, event type, status)
 *  - "Cancel registration" button (removes from My Events list)
 *
 * Future-ready hooks:
 *  - Events are already stored with `registeredAt` so sorting by "soonest first"
 *    is just `.sort((a,b) => new Date(a.event.date) - new Date(b.event.date))`
 *  - Each registration object carries `formData` so a reminder/notification
 *    system can pick up email & phone from there.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  Calendar, MapPin, Clock, Tag, Search, X,
  Ticket, Trash2, Filter, ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyEvents } from '../../context/MyEventsContext';
import StatusBadge from '../common/StatusBadge';

// ── animation variants ──────────────────────────────────────────────────────

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: prefersReducedMotion ? 0 : i * 0.06, duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' },
  }),
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 } },
});

// ── helpers ──────────────────────────────────────────────────────────────────

const getEventStatus = (event) => {
  if (!event?.date) return 'Unknown';
  const eventDate = new Date(event.date);
  const now = new Date();
  // Normalise to midnight for a fair day comparison
  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (eventDate < now) return 'Completed';
  if (eventDate.getTime() === now.getTime()) return 'Today';
  return 'Upcoming';
};

// ── empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ prefersReducedMotion }) => (
  <motion.div
    className="my-events-empty"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
  >
    <div className="my-events-empty-icon">
      <Ticket size={40} />
    </div>
    <h3 className="my-events-empty-title">No events yet</h3>
    <p className="my-events-empty-sub">
      You haven't registered for any events. Explore upcoming events and sign up!
    </p>
    <Link
      to="/events"
      className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-800 my-events-empty-cta"
    >
      <span className="relative z-10 flex items-center">
        Explore Events
        <svg
          className="ml-3 w-5 h-5 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  </motion.div>
);

// ── registration card — matches Events page EventCard style ──────────────────

const EventCard = ({ registration, index, onCancel }) => {
  const { event, registeredAt } = registration;
  const status = getEventStatus(event);
  const isUpcoming = status === 'Upcoming' || status === 'Today';

  const shortDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : '—';

  return (
    <motion.div
      className={`group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-500 flex flex-col z-10 hover:z-50 overflow-hidden${!isUpcoming ? ' opacity-80' : ''}`}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
    >
      {/* Decorative blobs — same as EventCard */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20 group-hover:animate-pulse" />
        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 group-hover:animate-bounce" />
        <div className="absolute bottom-4 right-1/4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:animate-ping" />
      </div>

      {/* Image */}
      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500" />
        </div>
      )}

      {/* Description */}
      {event?.description && (
        <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-indigo-50/30 dark:to-indigo-950/30">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      )}

      {/* Info grid — pink MapPin · blue Clock · green Tag · indigo Calendar */}
      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm bg-gradient-to-br from-gray-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/30">
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex-shrink-0">
            <MapPin size={14} className="text-pink-500" />
          </div>
          <span className="truncate font-medium">{event?.location || '—'}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Clock size={14} className="text-blue-500" />
          </div>
          <span className="font-medium">{event?.time || '—'}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
            <Tag size={14} className="text-green-500" />
          </div>
          <span className="font-medium capitalize">{event?.type || '—'}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
            <Calendar size={14} className="text-indigo-500" />
          </div>
          <span className="font-medium">{shortDate}</span>
        </div>
      </div>

      {/* Registered on + status row */}
      <div className="px-6 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Clock size={11} /> Registered {new Date(registeredAt).toLocaleDateString()}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* Tags */}
      {event?.tags?.length > 0 && (
        <div className="px-6 pb-3 flex flex-wrap gap-1.5">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA — dark "View Details" + red outlined "Cancel" (mirrors Register Now / View Details) */}
      <div className="px-6 py-4 flex gap-3 bg-gradient-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        <button
          className="group/btn flex-1"
          onClick={() => onCancel(event?.id, event?.title)}
        >
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-900 text-white px-5 py-2.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <Trash2 size={13} className="relative" />
            <span className="relative">Cancel</span>
          </div>
        </button>
        <Link to={`/events/${event?.id}`} className="group/btn flex-1">
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full">
            <span>View Details</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

// ── confirm dialog ─────────────────────────────────────────────────────────────

const CancelDialog = ({ eventTitle, onConfirm, onDismiss }) => (
  <motion.div
    className="my-events-dialog-backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onDismiss}
  >
    <motion.div
      className="my-events-dialog"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="my-events-dialog-title">Cancel Registration?</h3>
      <p className="my-events-dialog-body">
        Remove <strong>{eventTitle}</strong> from your events list?
      </p>
      <div className="my-events-dialog-actions">
        <button className="my-events-dialog-cancel" onClick={onDismiss}>
          Keep it
        </button>
        <button className="my-events-dialog-confirm" onClick={onConfirm}>
          Yes, remove
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── main component ────────────────────────────────────────────────────────────

export default function MyEventsTab() {
  const prefersReducedMotion = useReducedMotion();
  const { myEvents, removeRegistration } = useMyEvents();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType]     = useState('All');
  const [sortBy, setSortBy]             = useState('soonest'); // soonest | registered | name
  const [cancelTarget, setCancelTarget] = useState(null);

  // Derive unique types from the user's registered events
  const availableTypes = useMemo(() => {
    const types = [...new Set(myEvents.map((r) => r.event?.type).filter(Boolean))];
    return types.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [myEvents]);

  // Filtered + searched + sorted list
  const filtered = useMemo(() => {
    const result = myEvents.filter((reg) => {
      const ev = reg.event;
      const matchSearch = !searchQuery ||
        ev?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev?.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const status = getEventStatus(ev);
      const matchStatus = filterStatus === 'All' || status === filterStatus;

      const typeLabel = ev?.type
        ? ev.type.charAt(0).toUpperCase() + ev.type.slice(1)
        : '';
      const matchType = filterType === 'All' || typeLabel === filterType;

      return matchSearch && matchStatus && matchType;
    });

    // ── Sort ──
    result.sort((a, b) => {
      if (sortBy === 'soonest') {
        // Upcoming events first (soonest date), then past events (most recent last)
        const da = a.event?.date ? new Date(a.event.date) : new Date(0);
        const db = b.event?.date ? new Date(b.event.date) : new Date(0);
        return da - db;
      }
      if (sortBy === 'registered') {
        // Most recently registered first
        return new Date(b.registeredAt) - new Date(a.registeredAt);
      }
      if (sortBy === 'name') {
        return (a.event?.title || '').localeCompare(b.event?.title || '');
      }
      return 0;
    });

    return result;
  }, [myEvents, searchQuery, filterStatus, filterType, sortBy]);

  const handleCancelClick  = (id, title) => setCancelTarget({ id, title });
  const handleCancelDismiss = () => setCancelTarget(null);
  const handleCancelConfirm = () => {
    if (cancelTarget) {
      removeRegistration(cancelTarget.id);
      setCancelTarget(null);
    }
  };

  const upcomingCount  = myEvents.filter((r) => getEventStatus(r.event) === 'Upcoming').length;
  const todayCount     = myEvents.filter((r) => getEventStatus(r.event) === 'Today').length;
  const completedCount = myEvents.filter((r) => getEventStatus(r.event) === 'Completed').length;

  return (
    <motion.div
      key="my-events"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ud-content"
    >
      {/* ── Header ── */}
      <div className="ud-tab-header">
        <h2 className="ud-page-title">
          <Ticket size={20} /> My Events
        </h2>
        <Link
          to="/events"
          className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          <span className="relative z-10 flex items-center">
            Explore Events
            <svg
              className="ml-3 w-5 h-5 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Link>
      </div>

      {/* ── Summary pills ── */}
      {myEvents.length > 0 && (
        <motion.div
          className="my-events-summary"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Total',     value: myEvents.length,  color: '#6366f1' },
            { label: 'Upcoming',  value: upcomingCount,    color: '#10b981' },
            { label: 'Today',     value: todayCount,       color: '#f59e0b' },
            { label: 'Completed', value: completedCount,   color: '#94a3b8' },
          ].map((pill) => (
            <motion.div
              key={pill.label}
              className="my-events-pill"
              variants={fadeUp}
              style={{ '--pill-color': pill.color }}
            >
              <span className="my-events-pill-value">{pill.value}</span>
              <span className="my-events-pill-label">{pill.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Search + Filters ── */}
      {myEvents.length > 0 && (
        <div className="my-events-toolbar">
          {/* Search */}
          <div className="ud-search-wrap my-events-search">
            <Search size={14} className="ud-search-icon" />
            <input
              className="ud-search"
              placeholder="Search your events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="ud-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search query">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="my-events-filter-wrap">
            <Filter size={13} className="my-events-filter-icon" />
            <select
              className="ud-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {['All', 'Upcoming', 'Today', 'Completed'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Type filter — only shows if user has multiple types */}
          {availableTypes.length > 1 && (
            <div className="my-events-filter-wrap">
              <select
                className="ud-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {['All', ...availableTypes].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort order */}
          <div className="my-events-filter-wrap">
            <ArrowUpDown size={13} className="my-events-filter-icon" />
            <select
              className="ud-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="soonest">Soonest First</option>
              <option value="registered">Registration Date</option>
              <option value="name">Event Name</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {myEvents.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <motion.div
          className="my-events-no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>No events match your search / filter.</p>
          <button
            className="my-events-clear-filters"
            onClick={() => { setSearchQuery(''); setFilterStatus('All'); setFilterType('All'); setSortBy('soonest'); }}
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="ud-items-grid"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((reg, i) => (
            <EventCard
              key={reg.eventId}
              registration={reg}
              index={i}
              onCancel={handleCancelClick}
            />
          ))}
        </motion.div>
      )}

      {/* ── Cancel confirmation dialog ── */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelDialog
            eventTitle={cancelTarget.title}
            onConfirm={handleCancelConfirm}
            onDismiss={handleCancelDismiss}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}