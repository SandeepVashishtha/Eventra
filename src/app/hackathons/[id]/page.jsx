"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Code2,
  Clock,
  Layers,
  Cpu,
  Check,
  AlertCircle
} from "lucide-react";
import { getHackathonById, registerForHackathon } from "@/lib/api";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id;

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [actionError, setActionError] = useState("");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHackathon() {
      setLoading(true);
      setActionError("");
      setRegistered(false);
      try {
        const data = await getHackathonById(hackathonId);
        if (isMounted) {
          setHackathon(data);
          if (data) {
            setRegistered(Boolean(data.isRegistered || data.registered || data.hasRegistered));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to load hackathon details", err);
          setActionError("Could not load hackathon information.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (hackathonId) {
      loadHackathon();
    }

    return () => {
      isMounted = false;
    };
  }, [hackathonId]);

  const handleRegister = async () => {
    if (!hackathon || registered || isRegistering) return;

    // Check auth token before attempting registration
    const token = typeof window !== "undefined" ? localStorage.getItem("eventra_token") : null;
    if (!token) {
      setActionError("You must be logged in to register for this hackathon.");
      router.push(`/login?redirect=/hackathons/${hackathonId}`);
      return;
    }

    setIsRegistering(true);
    setActionError("");
    try {
      await registerForHackathon(hackathonId);
      setRegistered(true);
    } catch (err) {
      console.warn("Registration error", err);
      setActionError(err?.message || "Could not complete your registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-12 px-4 max-w-4xl mx-auto space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </main>
    );
  }

  if (!hackathon) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-800">Hackathon Not Found</h2>
        <Link href="/hackathons" className="text-amber-600 hover:underline text-sm font-semibold">
          Return to Hackathons List
        </Link>
      </main>
    );
  }

  const formattedStart = hackathon.startDate
    ? new Date(`${hackathon.startDate}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "TBD";

  const formattedEnd = hackathon.endDate
    ? new Date(`${hackathon.endDate}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "TBD";

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Hackathons</span>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-2xs space-y-6">
              
              {/* Badges Header */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{hackathon.mode || "Hackathon"}</span>
                </span>

                {hackathon.prizePool && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{hackathon.prizePool}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                {hackathon.title}
              </h1>

              {/* Description */}
              <div className="space-y-3 pt-2 text-sm text-zinc-600 leading-relaxed font-normal">
                <p>{hackathon.description}</p>
                <p>
                  Participants can build individually or in teams of up to 4 members. Projects must be pushed to a public GitHub repository and submitted before the deadline.
                </p>
              </div>

              {/* Tracks & Themes */}
              <div className="pt-6 border-t border-zinc-100 space-y-4">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Competition Tracks</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                      <Cpu className="w-4 h-4 text-amber-600" />
                      <span>AI & Autonomous Agents</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      LLM integration, autonomous workflows, intelligent tools, and RAG architectures.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                      <Code2 className="w-4 h-4 text-amber-600" />
                      <span>Open Source & Developer Tools</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Libraries, CLI utilities, developer extensions, and infrastructure automation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div className="pt-6 border-t border-zinc-100 space-y-3">
                <h3 className="text-base font-bold text-zinc-900">Judging & Evaluation</h3>
                <ul className="space-y-2 text-xs text-zinc-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Technical Execution & Code Quality (30%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Originality & Innovation (30%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>User Experience & Design (20%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Working Demo & Documentation (20%)</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-md space-y-6 sticky top-24">
              
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Hackathon Details
                </div>

                <div className="space-y-2.5 text-xs font-medium text-zinc-700">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Organizer</span>
                    <span className="font-bold text-zinc-900">{hackathon.organizer || "Eventra Partner"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Format</span>
                    <span className="font-bold text-zinc-900">{hackathon.mode || "Online"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Start Date</span>
                    <span className="font-bold text-zinc-900">{formattedStart}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">End Date</span>
                    <span className="font-bold text-zinc-900">{formattedEnd}</span>
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              {registered ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="text-sm font-bold">Registration Confirmed!</div>
                  <div className="text-xs text-amber-700">Check your email for submission guidelines.</div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  aria-busy={isRegistering}
                  className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{isRegistering ? "Registering..." : "Register Team / Submit"}</span>
                </button>
              )}

              {actionError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex flex-col gap-2 font-medium"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                  {actionError.toLowerCase().includes("logged in") && (
                    <Link
                      href={`/login?redirect=/hackathons/${hackathonId}`}
                      className="text-xs font-bold text-red-800 underline hover:text-red-900 ml-6"
                    >
                      Sign In Now →
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Challenge • Open Submissions</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
