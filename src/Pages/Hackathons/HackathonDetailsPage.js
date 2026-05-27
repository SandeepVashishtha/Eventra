import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Award, Users, Trophy, Tag, ArrowLeft } from "lucide-react";

import hackathonsData from "./hackathonMockData.json";

import useReducedMotion from "../../hooks/useReducedMotion.js";
const getHackathonStatus = (hackathon) => {
  const now = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  if (endDate < now) return "completed";
  if (startDate <= now && now <= endDate) return "live";
  return "upcoming";
};

const HackathonDetailsPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const { hackathonId } = useParams();
  const foundHackathon = hackathonsData.find((item) => String(item.id) === hackathonId);

  if (!foundHackathon) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Hackathon Not Found
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            The hackathon you selected could not be found.
          </p>
          <Link
            to="/hackathons"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  const status = getHackathonStatus(foundHackathon);
  const statusStyles = {
    live: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  };

  const prizeValue = Number.parseInt(String(foundHackathon.prize).replace(/[^\d]/g, ""), 10);
  const isFeatured = Number.isFinite(prizeValue) && prizeValue >= 30000;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="sticky top-0 z-30 border-b border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/hackathons"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Hackathons
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
          className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${statusStyles[status]}`}
                >
                  {status}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {foundHackathon.difficulty}
                </span>
                {isFeatured && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">
                {foundHackathon.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-7">
                {foundHackathon.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(foundHackathon.title)}&dates=${foundHackathon.startDate.replaceAll("-", "")}/${foundHackathon.endDate.replaceAll("-", "")}&details=${encodeURIComponent(foundHackathon.description)}&location=${encodeURIComponent(foundHackathon.location)}`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                  rel="noopener noreferrer"
                >
                  Add Reminder
                </a>
                <Link
                  to="/hackathons"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  Browse Hackathons
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dates</p>
                  <p className="font-semibold">
                    {new Date(foundHackathon.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" - "}
                    {new Date(foundHackathon.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-semibold">{foundHackathon.location}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-start gap-3">
                <Award className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</p>
                  <p className="font-semibold">{foundHackathon.prize}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-start gap-3">
                <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
                  <p className="font-semibold">{foundHackathon.participants}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold">Overview</h2>
              <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-6">
                <p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Organizer:</span>{" "}
                  {foundHackathon.organizer}
                </p>
                <p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Teams:</span>{" "}
                  {foundHackathon.teams}
                </p>
                <p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Submissions:
                  </span>{" "}
                  {foundHackathon.submissions}
                </p>
                <p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Status:</span>{" "}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                Tech Stack
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(foundHackathon.techStack || []).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                Rules
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                {(foundHackathon.rules || []).map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </aside>
        </motion.div>
      </main>
    </div>
  );
};

export default HackathonDetailsPage;
