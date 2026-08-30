"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Download, 
  RefreshCw, 
  Calendar, 
  Users, 
  UserCheck, 
  Flame, 
  Globe, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from "lucide-react";
import { getEventAnalytics, exportEventRegistrationsCSV, getEventById } from "@/lib/api";
import RegistrationTimelineChart from "./RegistrationTimelineChart";
import AttendanceGauge from "./AttendanceGauge";
import RegistrationHeatmap from "./RegistrationHeatmap";
import CapacityUtilizationCard from "./CapacityUtilizationCard";
import GeographicBreakdown from "./GeographicBreakdown";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function OrganizerAnalyticsDashboard({ eventId, initialEvent = null, isEmbedded = false }) {
  const [analytics, setAnalytics] = useState(null);
  const [eventDetails, setEventDetails] = useState(initialEvent);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [attendeeFilter, setAttendeeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, eventRes] = await Promise.all([
        getEventAnalytics(eventId),
        initialEvent ? Promise.resolve(initialEvent) : getEventById(eventId).catch(() => null)
      ]);
      setAnalytics(analyticsRes);
      if (eventRes) setEventDetails(eventRes);
    } catch (err) {
      console.error("Failed to load organizer analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const handleExportCSV = () => {
    if (!analytics) return;
    setExporting(true);
    try {
      exportEventRegistrationsCSV(
        analytics,
        eventDetails?.title || `event-${eventId}`
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("CSV Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-emerald-900/10 space-y-3">
        <Layers className="w-10 h-10 text-zinc-300 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-800">No Analytics Available</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          We could not load analytics metrics for this event.
        </p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00b887] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, timeline, heatmap, geographic, attendees = [] } = analytics;

  const filteredAttendees = attendees.filter((a) => {
    const matchesFilter =
      attendeeFilter === "all" ||
      (attendeeFilter === "checked_in" && a.checkedIn) ||
      (attendeeFilter === "pending" && !a.checkedIn);

    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            {!isEmbedded && (
              <Link
                href={`/events/${eventId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Event Page</span>
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-200">
                Organizer Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono font-medium">
                ID #{eventId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {eventDetails?.title || `Event Analytics (ID: ${eventId})`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {eventDetails?.eventDate
                    ? new Date(eventDetails.eventDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Upcoming Event"}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Data (Real-time Synced)</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh Analytics Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? "Generating CSV..." : "Export CSV Report"}</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#00b887]" />
            <span>Attendee registration roster downloaded as CSV successfully!</span>
          </div>
        )}
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span>Total Registrations</span>
            <Users className="w-4 h-4 text-[#00b887]" />
          </div>
          <div className="text-3xl font-black text-zinc-900 font-mono">
            {summary.totalRegistered}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>+{timeline?.[timeline.length - 1]?.dailyRegistrations || 12} registered today</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span>Attendance Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-zinc-900 font-mono">
            {summary.attendanceRate}%
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            {summary.checkedIn} verified check-ins
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span>Capacity Utilized</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-zinc-900 font-mono">
            {summary.capacityUtilization}%
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            {summary.seatsRemaining} seats remaining
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span>Peak Day</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900">
            {summary.peakRegistrationDay}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            Lead time: ~{summary.averageRegistrationLeadDays} days
          </div>
        </div>
      </div>

      {/* Primary Chart: Registration Timeline */}
      <RegistrationTimelineChart timeline={timeline} />

      {/* Row 2: Attendance Rate Gauge & Capacity Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceGauge
          totalRegistered={summary.totalRegistered}
          checkedIn={summary.checkedIn}
          attendanceRate={summary.attendanceRate}
        />

        <CapacityUtilizationCard
          totalRegistered={summary.totalRegistered}
          maxCapacity={summary.maxCapacity}
          capacityUtilization={summary.capacityUtilization}
          seatsRemaining={summary.seatsRemaining}
          isSoldOut={summary.isSoldOut}
        />
      </div>

      {/* Row 3: Peak Registration Heatmap & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RegistrationHeatmap heatmap={heatmap} />
        </div>
        <div className="lg:col-span-5">
          <GeographicBreakdown geographic={geographic} />
        </div>
      </div>

      {/* Row 4: Attendee Registration Roster Table */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  Attendee Registration Roster
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Search, filter, and inspect verified registrant data
                </p>
              </div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900"
              />
            </div>

            <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
              <button
                onClick={() => setAttendeeFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  attendeeFilter === "all" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
                }`}
              >
                All ({attendees.length})
              </button>
              <button
                onClick={() => setAttendeeFilter("checked_in")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  attendeeFilter === "checked_in" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
                }`}
              >
                Checked In
              </button>
              <button
                onClick={() => setAttendeeFilter("pending")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  attendeeFilter === "pending" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Attendee</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No attendees match the criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendees.slice(0, 15).map((att) => (
                  <tr key={att.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-500">{att.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900">{att.name}</div>
                      <div className="text-zinc-400 text-[11px]">{att.email}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-600">{att.role}</td>
                    <td className="py-3 px-3 text-zinc-600">{att.location}</td>
                    <td className="py-3 px-3">
                      {att.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-[#00b887]" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-500">
                      {att.checkInTime}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
