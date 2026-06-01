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
      <div className="min-h-screen bg-bg text-text flex items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full rounded-3xl bg-card-bg shadow-xl border border-border p-10 text-center">
          <h1 className="text-4xl font-extrabold text-text">
            Hackathon Not Found
          </h1>
          <p className="mt-4 text-text-light">
            The hackathon you selected could not be found.
          </p>
          <Link
            to="/hackathons"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary hover:opacity-90 px-6 py-3 text-sm font-semibold text-white shadow transition"
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
    upcoming: "bg-primary/10 text-primary",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  };

  const prizeValue = Number.parseInt(String(foundHackathon.prize).replace(/[^\d]/g, ""), 10);
  const isFeatured = Number.isFinite(prizeValue) && prizeValue >= 30000;

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="sticky top-0 z-30 border-b border-border bg-navbar/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/hackathons"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-85 transition-colors"
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
            <div className="rounded-3xl border border-border bg-card-bg shadow-xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${statusStyles[status]}`}
                >
                  {status}
                </span>
                <span className="inline-flex items-center rounded-full bg-bg px-3 py-1 text-xs font-semibold text-text-light">
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
              <p className="mt-4 max-w-3xl text-base sm:text-lg text-text-light leading-7">
                {foundHackathon.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(foundHackathon.title)}&dates=${foundHackathon.startDate.replaceAll("-", "")}/${foundHackathon.endDate.replaceAll("-", "")}&details=${encodeURIComponent(foundHackathon.description)}&location=${encodeURIComponent(foundHackathon.location)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-primary hover:opacity-90 px-6 py-3 text-sm font-semibold text-white shadow transition"
                >
                  Add Reminder
                </a>
                <Link
                  to="/hackathons"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-bg px-6 py-3 text-sm font-semibold text-text shadow-sm hover:bg-card-bg transition"
                >
                  Browse Hackathons
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-bg border border-border p-5 shadow-sm flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-light">Dates</p>
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

              <div className="rounded-3xl bg-bg border border-border p-5 shadow-sm flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-light">Location</p>
                  <p className="font-semibold">{foundHackathon.location}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-bg border border-border p-5 shadow-sm flex items-start gap-3">
                <Award className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-light">Prize Pool</p>
                  <p className="font-semibold">{foundHackathon.prize}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-bg border border-border p-5 shadow-sm flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-light">Participants</p>
                  <p className="font-semibold">{foundHackathon.participants}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card-bg shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold">Overview</h2>
              <div className="mt-4 space-y-4 text-sm text-text-light leading-6">
                <p>
                  <span className="font-semibold text-text">Organizer:</span>{" "}
                  {foundHackathon.organizer}
                </p>
                <p>
                  <span className="font-semibold text-text">Teams:</span>{" "}
                  {foundHackathon.teams}
                </p>
                <p>
                  <span className="font-semibold text-text">
                    Submissions:
                  </span>{" "}
                  {foundHackathon.submissions}
                </p>
                <p>
                  <span className="font-semibold text-text">Status:</span>{" "}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card-bg shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Tech Stack
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(foundHackathon.techStack || []).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card-bg shadow-xl p-6 sm:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                Rules
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-text-light list-disc list-inside">
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
