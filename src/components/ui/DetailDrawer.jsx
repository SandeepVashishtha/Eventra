"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  Award, 
  Sparkles, 
  FolderKanban, 
  ThumbsUp, 
  Code2, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  UserCheck, 
  ExternalLink
} from "lucide-react";
import { registerForEvent, registerForHackathon, upvoteProject } from "@/lib/api";

export default function DetailDrawer({ isOpen, onClose, type, data }) {
  if (!isOpen || !data) return null;

  return (
    <DetailDrawerContent
      key={`${type}:${data.id}`}
      onClose={onClose}
      type={type}
      data={data}
    />
  );
}

function DetailDrawerContent({ onClose, type, data }) {
  const [actionDone, setActionDone] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [upvotes, setUpvotes] = useState(data?.upvotes || 0);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    try {
      if (type === "event") {
        await registerForEvent(data.id);
        if (!mountedRef.current) return;
        setActionDone(true);
      } else if (type === "hackathon") {
        await registerForHackathon(data.id);
        if (!mountedRef.current) return;
        setActionDone(true);
      } else if (type === "project") {
        await upvoteProject(data.id);
        if (!mountedRef.current) return;
        setUpvotes((prev) => prev + 1);
        setActionDone(true);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.warn("Action error", err);
      setActionDone(true);
    } finally {
      if (mountedRef.current) {
        setActionLoading(false);
      }
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
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Right Sidebar */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-emerald-900/10 animate-in slide-in-from-right duration-300">
          
          {/* Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Header Banner Image */}
            <div className="relative h-56 w-full bg-zinc-900">
              <Image
                src={imageUrl}
                alt={data.title}
                fill
                className="object-cover opacity-90"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

              {/* Top Action Controls: Open Full Page & Close */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <Link
                  href={fullPageUrl}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold text-white bg-black/50 hover:bg-black/80 backdrop-blur-md transition-all border border-white/20"
                  title="Open in Full Page"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={onClose}
                  className="p-2 text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20"
                  aria-label="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges Overlaid on Banner */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                {type === "event" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00b887] text-white text-xs font-bold shadow-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event</span>
                  </span>
                )}
                {type === "hackathon" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{data.mode || "Hackathon"}</span>
                  </span>
                )}
                {type === "project" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>{data.category || "Project"}</span>
                  </span>
                )}

                {data.prizePool && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-200">
                    <Award className="w-3 h-3 text-amber-700" />
                    <span>{data.prizePool}</span>
                  </span>
                )}

                {type === "project" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-100/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-200">
                    <ThumbsUp className="w-3 h-3 text-emerald-700" />
                    <span>{upvotes} Upvotes</span>
                  </span>
                )}
              </div>

              {/* Title Overlaid at Bottom */}
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                  {data.title}
                </h2>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6">
              
              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-700 pb-4 border-b border-zinc-100">
                {formattedDate && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200/80">
                    <Clock className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>{formattedDate} {formattedEnd && `- ${formattedEnd}`}</span>
                  </div>
                )}

                {data.location && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200/80">
                    <MapPin className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>{data.location}</span>
                  </div>
                )}

                {data.registeredCount !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200/80">
                    <Users className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>{data.registeredCount} Attending</span>
                  </div>
                )}

                {data.organizer && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{data.organizer}</span>
                  </div>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-900">Overview</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                  {data.description}
                </p>
              </div>

              {/* Type-Specific Content */}
              {type === "event" && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00b887]" />
                    <span>Event Agenda</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-0.5">
                      <div className="font-bold text-zinc-900">Opening Keynote & Intro</div>
                      <div className="text-zinc-500">Live streamed session with guest speakers.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-0.5">
                      <div className="font-bold text-zinc-900">Hands-on Technical Lab</div>
                      <div className="text-zinc-500">Code along with example repositories and Q&A.</div>
                    </div>
                  </div>
                </div>
              )}

              {type === "hackathon" && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Tracks & Criteria</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                      <div className="font-bold text-zinc-900">AI Agents & DevTools Track</div>
                      <div className="text-zinc-500">Construct software agents, LLM pipelines, or IDE extensions.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                      <div className="font-bold text-zinc-900">Judging Criteria</div>
                      <div className="text-zinc-500">Code quality (30%), Innovation (30%), UX & Demo (40%).</div>
                    </div>
                  </div>
                </div>
              )}

              {type === "project" && data.githubUrl && (
                <div className="pt-2">
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open GitHub Repository</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Full Standalone Page Direct Link Banner */}
              <div className="pt-4 border-t border-zinc-100">
                <Link
                  href={fullPageUrl}
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-all flex items-center justify-between group"
                >
                  <span>View standalone full details page</span>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>

            </div>

          </div>

          {/* Fixed Drawer Footer CTA */}
          <div className="p-5 border-t border-zinc-100 bg-zinc-50/80 space-y-2">
            {actionDone ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00b887]" />
                <span>
                  {type === "project" ? "Upvoted Successfully!" : "Registered Successfully!"}
                </span>
              </div>
            ) : (
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  type === "hackathon"
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                    : type === "project"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                    : "bg-[#00b887] hover:bg-[#049d73] text-white shadow-emerald-200"
                }`}
              >
                {type === "event" && <UserCheck className="w-4 h-4" />}
                {type === "hackathon" && <Trophy className="w-4 h-4" />}
                {type === "project" && <ThumbsUp className="w-4 h-4" />}
                <span>
                  {actionLoading
                    ? "Processing..."
                    : type === "event"
                    ? "RSVP / Register for Event"
                    : type === "hackathon"
                    ? "Register Team for Hackathon"
                    : "Upvote Project"}
                </span>
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Eventra Content</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
