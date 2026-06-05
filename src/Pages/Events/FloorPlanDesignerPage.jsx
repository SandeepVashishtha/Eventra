import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Info } from "lucide-react";
import FloorPlanDesigner from "../../components/events/FloorPlanDesigner";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import eventsMockDataRaw from "./eventsMockData.js";
const eventsMockData = Array.isArray(eventsMockDataRaw) ? eventsMockDataRaw : (eventsMockDataRaw.events || eventsMockDataRaw.data || Object.values(eventsMockDataRaw)[0] || []);;

const FloorPlanDesignerPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [isDirty, setIsDirty] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Load the corresponding event info from mock data
  const event = eventsMockData.find((e) => e.id === parseInt(eventId)) || {
    id: eventId,
    title: "Community Meetup & Workshop",
    date: "2026-06-15",
    location: "Bangalore Innovation Hub",
    attendees: 120,
    maxAttendees: 200,
    type: "meetup"
  };

  const handleNavigate = (path) => {
    if (isDirty) {
      setPendingPath(path);
      setIsExitModalOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs and Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate(`/events/${event.id}`)}
              className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all cursor-pointer border border-indigo-500/15"
              title="Back to event details"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <button
                  onClick={() => handleNavigate("/events")}
                  className="hover:text-indigo-500 cursor-pointer bg-transparent border-none p-0 text-inherit font-semibold text-xs uppercase tracking-wider"
                >
                  Events
                </button>
                <span>/</span>
                <button
                  onClick={() => handleNavigate(`/events/${event.id}`)}
                  className="hover:text-indigo-500 cursor-pointer bg-transparent border-none p-0 text-inherit font-semibold text-xs uppercase tracking-wider line-clamp-1 max-w-[200px] text-left"
                >
                  {event.title}
                </button>
                <span>/</span>
                <span className="text-indigo-500 font-semibold uppercase tracking-wider">Floor Plan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                {event.title}
              </h2>
            </div>
          </div>

          {/* Quick Event Summary Badge Card */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-gray-50 dark:bg-black/40 border border-gray-200/80 dark:border-gray-800/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Calendar size={14} className="text-indigo-500" />
              <span className="font-bold">{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MapPin size={14} className="text-pink-500" />
              <span className="font-semibold line-clamp-1">{event.location.split(",")[0]}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Users size={14} className="text-green-500" />
              <span className="font-bold">{event.attendees} / {event.maxAttendees}</span>
            </div>
          </div>
        </div>

        {/* Live Designer Component Mount */}
        <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/40 dark:border-gray-800/40 overflow-hidden">
          <FloorPlanDesigner eventId={event.id} onDirtyChange={setIsDirty} />
        </div>

        {/* Info Helper Footer bar */}
        <div className="flex items-start gap-2.5 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
          <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Layout data is synchronized dynamically with local storage. This is an advanced **Level-3 Feature** that provides dynamic grid snap, translation matrices for coordinates, elements grouping, rotation matrix trigonometry, and custom interactive seat mapping. Suitable for high-density event layout administration.
          </p>
        </div>

      </div>

      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          setIsExitModalOpen(false);
          setIsDirty(false); // reset dirty flag to allow navigation
          navigate(pendingPath);
        }}
        title="Unsaved Modifications"
        message="You have unsaved changes on your floor plan designer layout. Are you sure you want to discard them and leave?"
        confirmText="Discard & Exit"
        cancelText="Keep Editing"
      />
    </div>
  );
};

export default FloorPlanDesignerPage;
