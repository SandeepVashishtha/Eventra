"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  MapPin, 
  Clock, 
  Trophy, 
  Users, 
  FolderKanban, 
  Heart, 
  Code2, 
  ArrowUpRight, 
  CheckCircle2, 
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { registerForEvent, registerForHackathon, upvoteProject } from "@/lib/api";

export default function DetailDrawer({ isOpen, onClose, type, data }) {
  const [actionDone, setActionDone] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [upvotes, setUpvotes] = useState(data?.upvotes || 0);

  React.useEffect(() => {
    setActionDone(Boolean(data?.isRegistered || data?.registered || data?.hasRegistered || data?.hasUpvoted));
    setActionLoading(false);
    setActionError("");
    setUpvotes(data?.upvotes || 0);
  }, [data, isOpen]);

  if (!isOpen || !data) return null;

  const fullPageUrl =
    type === "event"
      ? `/events/${data.id}`
      : type === "hackathon"
      ? `/hackathons/${data.id}`
      : `/projects/${data.id}`;

  const formattedDate = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : data.startDate
    ? new Date(data.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      })
    : "";

  const formattedEnd = data.endDate
    ? new Date(data.endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "";

  const handleAction = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      if (type === "event") {
        await registerForEvent(data.id);
        setActionDone(true);
      } else if (type === "hackathon") {
        await registerForHackathon(data.id);
        setActionDone(true);
      } else if (type === "project") {
        await upvoteProject(data.id);
        setUpvotes((prev) => prev + 1);
        setActionDone(true);
      }
    } catch (err) {
      console.warn("Action error", err);
      setActionError(err?.message || "Action could not be completed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const imageUrl =
    data.imageUrl ||
    data.thumbnailUrl ||
    (type === "event"
      ? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"
      : type === "hackathon"
      ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 animate-in slide-in-from-right duration-300">
          
          {/* Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Header Banner Image */}
            <div className="relative h-60 w-full bg-neutral-900">
              <Image
                src={imageUrl}
                alt={data.title}
                fill
                className="object-cover opacity-90"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40" />

              {/* Controls: Open Full Page & Close */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <Link
                  href={fullPageUrl}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-medium text-white bg-neutral-900/60 hover:bg-neutral-900/90 backdrop-blur-md transition-all border border-white/20"
                  title="Open in Full Page"
                >
                  <span>Open Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={onClose}
                  className="p-1.5 text-white bg-neutral-900/60 hover:bg-neutral-900/90 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20"
                  aria-label="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges on Banner */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-950/90 text-white text-[11px] font-medium backdrop-blur-md">
                  {type === "event" ? "Event" : type === "hackathon" ? (data.mode || "Hackathon") : (data.category || "Project")}
                </span>

                {data.prizePool && (
                  <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-mono font-medium text-neutral-900 bg-white/95 backdrop-blur-md rounded-md">
                    {data.prizePool}
                  </span>
                )}
              </div>

              {/* Title at Bottom */}
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                  {data.title}
                </h2>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6">
              
              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
                {formattedDate && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{formattedDate} {formattedEnd && `- ${formattedEnd}`}</span>
                  </div>
                )}

                {data.location && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{data.location}</span>
                  </div>
                )}

                {data.registeredCount !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{data.registeredCount} Registered</span>
                  </div>
                )}

                {data.organizer && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span>By {data.organizer}</span>
                  </div>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Overview
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                  {data.description}
                </p>
              </div>

              {/* Project GitHub link if available */}
              {type === "project" && data.githubUrl && (
                <div className="pt-2">
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>View Repository on GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Direct Link to Standalone Page */}
              <div className="pt-4 border-t border-neutral-100">
                <Link
                  href={fullPageUrl}
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs rounded-xl transition-colors flex items-center justify-between group"
                >
                  <span>View full page documentation &amp; schedule</span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                </Link>
              </div>

            </div>

          </div>

          {/* Fixed Drawer Footer Action */}
          <div className="p-5 border-t border-neutral-100 bg-neutral-50 space-y-2">
            {actionDone ? (
              <div className="p-3 bg-neutral-900 text-white rounded-xl text-center text-xs font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {type === "project" ? "Applauded project successfully!" : "Registered successfully!"}
                </span>
              </div>
            ) : (
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className="w-full py-3 px-4 font-semibold text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {type === "project" ? (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>{actionLoading ? "Updating..." : `Upvote / Applaud (${upvotes})`}</span>
                  </>
                ) : (
                  <span>
                    {actionLoading
                      ? "Processing..."
                      : type === "event"
                      ? "RSVP / Register for Event"
                      : "Register for Hackathon"}
                  </span>
                )}
              </button>
            )}

            {actionError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
