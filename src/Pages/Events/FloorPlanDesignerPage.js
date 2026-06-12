import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Info } from "lucide-react";
import FloorPlanDesigner from "../../components/events/FloorPlanDesigner";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import eventsMockData from "./eventsMockData.json";

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
    type: "meetup",
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
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Breadcrumbs and Back Button */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200/50 bg-white/40 p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center dark:border-gray-800/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate(`/events/${event.id}`)}
              className="cursor-pointer rounded-xl border border-indigo-500/15 bg-indigo-500/10 p-2 text-indigo-600 transition-all hover:bg-indigo-500/20 dark:text-indigo-400"
              title="Back to event details"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                <button
                  onClick={() => handleNavigate("/events")}
                  className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold tracking-wider text-inherit uppercase hover:text-indigo-500"
                >
                  Events
                </button>
                <span>/</span>
                <button
                  onClick={() => handleNavigate(`/events/${event.id}`)}
                  className="line-clamp-1 max-w-[200px] cursor-pointer border-none bg-transparent p-0 text-left text-xs font-semibold tracking-wider text-inherit uppercase hover:text-indigo-500"
                >
                  {event.title}
                </button>
                <span>/</span>
                <span className="font-semibold tracking-wider text-indigo-500 uppercase">
                  Floor Plan
                </span>
              </div>
              <h2 className="mt-0.5 text-xl leading-tight font-black text-gray-900 sm:text-2xl dark:text-white">
                {event.title}
              </h2>
            </div>
          </div>

          {/* Quick Event Summary Badge Card */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-2.5 text-xs dark:border-gray-800/80 dark:bg-black/40">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Calendar size={14} className="text-indigo-500" />
              <span className="font-bold">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MapPin size={14} className="text-pink-500" />
              <span className="line-clamp-1 font-semibold">{event.location.split(",")[0]}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Users size={14} className="text-green-500" />
              <span className="font-bold">
                {event.attendees} / {event.maxAttendees}
              </span>
            </div>
          </div>
        </div>

        {/* Live Designer Component Mount */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/40 bg-white/30 shadow-lg backdrop-blur-md dark:border-gray-800/40 dark:bg-gray-900/30">
          <FloorPlanDesigner eventId={event.id} onDirtyChange={setIsDirty} />
        </div>

        {/* Info Helper Footer bar */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4">
          <Info className="mt-0.5 shrink-0 text-indigo-500" size={16} />
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Layout data is synchronized dynamically with local storage. This is an advanced
            **Level-3 Feature** that provides dynamic grid snap, translation matrices for
            coordinates, elements grouping, rotation matrix trigonometry, and custom interactive
            seat mapping. Suitable for high-density event layout administration.
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
