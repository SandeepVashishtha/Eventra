"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Calendar, 
  Trophy, 
  FolderKanban, 
  Bell, 
  LogOut, 
  Edit3, 
  CheckCircle2, 
  Mail, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Lock,
  CalendarX,
  BarChart3
} from "lucide-react";
import { 
  getUserProfile, 
  updateUserProfile, 
  getMyRegisteredEvents, 
  getEvents,
  getHackathons, 
  getProjects, 
  getUserNotifications, 
  markNotificationRead 
} from "@/lib/api";
import EventCard from "@/components/ui/EventCard";
import HackathonCard from "@/components/ui/HackathonCard";
import ProjectCard from "@/components/ui/ProjectCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import OrganizerAnalyticsDashboard from "@/components/analytics/OrganizerAnalyticsDashboard";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState("events");

  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedAnalyticsEventId, setSelectedAnalyticsEventId] = useState("1");
  const [hackathons, setHackathons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setAuthError(false);

      let storedUser = null;
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("eventra_token");
        const rawUser = localStorage.getItem("eventra_user");
        if (rawUser) {
          try {
            storedUser = JSON.parse(rawUser);
          } catch (e) {}
        }
      }

      if (!token && !storedUser) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      let userProfile = storedUser;
      try {
        const apiProfile = await getUserProfile();
        if (apiProfile && (apiProfile.email || apiProfile.firstName || apiProfile.username)) {
          userProfile = apiProfile;
        }
      } catch (err) {
        console.warn("Could not fetch live profile, using authenticated session user", err);
      }

      if (!userProfile) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setProfile(userProfile);
      setEditFirstName(userProfile.firstName || userProfile.name?.split(" ")[0] || "");
      setEditLastName(userProfile.lastName || userProfile.name?.split(" ")[1] || "");
      setEditUsername(userProfile.username || userProfile.email?.split("@")[0] || "");

      try {
        const [eventsData, allEventsData, hackathonsData, projectsData, notifsData] = await Promise.all([
          getMyRegisteredEvents().catch(() => []),
          getEvents().catch(() => []),
          getHackathons().catch(() => []),
          getProjects().catch(() => []),
          getUserNotifications().catch(() => [])
        ]);

        setMyEvents(Array.isArray(eventsData) ? eventsData : []);
        const loadedAllEvents = Array.isArray(allEventsData) && allEventsData.length > 0
          ? allEventsData
          : [
              { id: "1", title: "Cloud Architecture Summit 2026", eventDate: new Date().toISOString() },
              { id: "2", title: "React & Next.js Core Maintainers Workshop", eventDate: new Date().toISOString() },
              { id: "3", title: "AI & Distributed Systems Keynote", eventDate: new Date().toISOString() },
            ];
        setAllEvents(loadedAllEvents);
        if (loadedAllEvents.length > 0) {
          setSelectedAnalyticsEventId(String(loadedAllEvents[0].id));
        }
        setHackathons(Array.isArray(hackathonsData) ? hackathonsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setNotifications(Array.isArray(notifsData) ? notifsData : []);
      } catch (err) {
        console.warn("Error loading secondary dashboard items", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eventra_token");
      localStorage.removeItem("eventra_user");
    }
    router.push("/login");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile({
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername
      });
      const newProf = { ...profile, ...updated, firstName: editFirstName, lastName: editLastName, username: editUsername };
      setProfile(newProf);
      if (typeof window !== "undefined") {
        localStorage.setItem("eventra_user", JSON.stringify(newProf));
      }
      setSaveSuccess(true);
      setProfileError("");
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditingProfile(false);
      }, 1000);
    } catch (err) {
      console.warn("Error updating profile", err);
      setProfileError("Failed to update profile. Please try again.");
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.warn("Failed to mark read", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-12 px-4 max-w-7xl mx-auto space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    );
  }

  if (authError || !profile) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#00b887]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900">Authentication Required</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Please sign in to access your personal dashboard and registered events.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/signup"
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : profile.name || profile.username || profile.email || "Developer";

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Profile Hero Card */}
        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Identity */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#00b887] to-emerald-400 p-1 shrink-0 shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-extrabold text-2xl text-[#00b887]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>{profile.role || "DEVELOPER"}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-medium">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{profile.email}</span>
                    </span>
                  )}
                  {profile.username && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-800">
                        @{profile.username}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => { setIsEditingProfile(true); setProfileError(""); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-zinc-600" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>

        {/* Personalized Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span>Registered Events</span>
              <Calendar className="w-4 h-4 text-[#00b887]" />
            </div>
            <div className="text-2xl font-black text-zinc-900">{myEvents.length}</div>
          </div>

          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span>Joined Hackathons</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-zinc-900">{hackathons.length}</div>
          </div>

          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span>Projects</span>
              <FolderKanban className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-zinc-900">{projects.length}</div>
          </div>

          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span>Notifications</span>
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-zinc-900">
              {notifications.filter((n) => !n.read).length}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 shadow-md space-y-6">
          
          <div className="flex items-center space-x-2 border-b border-zinc-100 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "events"
                  ? "bg-[#00b887] text-white shadow-md shadow-emerald-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Registered Events ({myEvents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("hackathons")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "hackathons"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Hackathons ({hackathons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "projects"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications ({notifications.filter((n) => !n.read).length})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Organizer Analytics</span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-zinc-900">
                  Your Registered Events
                </h3>
                <Link href="/events" className="text-xs font-bold text-[#00b887] hover:underline flex items-center gap-1">
                  <span>Explore More Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {myEvents.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                  <CalendarX className="w-10 h-10 text-zinc-300 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-800">No events registered yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    You haven&apos;t RSVP&apos;d for any events. Browse our live public events to register!
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#00b887] text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    <span>Browse Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {myEvents.map((event) => (
                    <EventCard key={`dashboard-my-event-${event.registrationId || event.eventId || event.id}`} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "hackathons" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-zinc-900">
                  Active Hackathons
                </h3>
                <Link href="/hackathons" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
                  <span>Explore Hackathons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {hackathons.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <Trophy className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-500">No active hackathons found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hackathons.map((hackathon) => (
                    <HackathonCard key={`dashboard-hackathon-${hackathon.id}`} hackathon={hackathon} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-zinc-900">
                  Open Source Projects
                </h3>
                <Link href="/projects" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                  <span>Explore All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <FolderKanban className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-500">No projects found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={`dashboard-project-${project.id}`} project={project} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-zinc-900">
                Notifications
              </h3>

              {notifications.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <Bell className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-500">No notifications at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={`notif-${notif.id}`}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        notif.read
                          ? "bg-zinc-50 border-zinc-200 text-zinc-600"
                          : "bg-emerald-50/60 border-emerald-200 text-zinc-900 font-semibold"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">{notif.title || "Notification"}</span>
                          {!notif.read && (
                            <span className="px-2 py-0.5 rounded-full bg-[#00b887] text-white text-[10px] font-bold">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600">{notif.message}</p>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#00b887] hover:underline cursor-pointer shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zinc-900">
                    Event Performance & Conversion Analytics
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Select an event to inspect live registrations, attendance rate, peak times, and demographic breakdowns.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-zinc-600 shrink-0">Select Event:</label>
                  <select
                    value={selectedAnalyticsEventId}
                    onChange={(e) => setSelectedAnalyticsEventId(e.target.value)}
                    className="px-3.5 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-800 cursor-pointer"
                  >
                    {allEvents.map((evt) => (
                      <option key={`analytics-opt-${evt.id}`} value={String(evt.id)}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <OrganizerAnalyticsDashboard
                eventId={selectedAnalyticsEventId}
                isEmbedded={true}
                initialEvent={allEvents.find((e) => String(e.id) === String(selectedAnalyticsEventId))}
              />
            </div>
          )}

        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs" onClick={() => setIsEditingProfile(false)} />
          
          <div className="relative w-full max-w-md bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl space-y-5 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-zinc-900">Edit Profile</h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00b887]" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Username Handle</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
