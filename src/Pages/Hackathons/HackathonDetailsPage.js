import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
      <div className="bg-bg text-text flex min-h-screen items-center justify-center px-4 py-24">
        <div className="bg-card-bg border-border w-full max-w-xl rounded-3xl border p-10 text-center shadow-xl">
          <h1 className="text-text text-4xl font-extrabold">Hackathon Not Found</h1>
          <p className="text-text-light mt-4">The hackathon you selected could not be found.</p>
          <Link
            to="/hackathons"
            className="bg-primary mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow transition hover:opacity-90"
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
    <>
      <Helmet>
        <title>{foundHackathon.title} | Eventra</title>
        <meta name="description" content={foundHackathon.description.slice(0, 160)} />
        <meta property="og:title" content={foundHackathon.title} />
        <meta
          property="og:description"
          content={`${foundHackathon.title}${foundHackathon.prize ? ` — Prize: ${foundHackathon.prize}. ` : ". "}${foundHackathon.startDate} - ${foundHackathon.endDate} | ${foundHackathon.location}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="bg-bg text-text min-h-screen">
        <div className="border-border bg-navbar/80 sticky top-0 z-30 border-b backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              to="/hackathons"
              className="text-primary inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-85"
            >
              <ArrowLeft size={18} />
              Back to Hackathons
            </Link>
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
            className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
          >
            <section className="space-y-6">
              <div className="border-border bg-card-bg rounded-3xl border p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-[0.18em] uppercase ${statusStyles[status]}`}
                  >
                    {status}
                  </span>
                  <span className="bg-bg text-text-light inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                    {foundHackathon.difficulty}
                  </span>
                  {isFeatured && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {foundHackathon.title}
                </h1>
                <p className="text-text-light mt-4 max-w-3xl text-base leading-7 sm:text-lg">
                  {foundHackathon.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(foundHackathon.title)}&dates=${foundHackathon.startDate.replaceAll("-", "")}/${foundHackathon.endDate.replaceAll("-", "")}&details=${encodeURIComponent(foundHackathon.description)}&location=${encodeURIComponent(foundHackathon.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow transition hover:opacity-90"
                  >
                    Add Reminder
                  </a>
                  <Link
                    to="/hackathons"
                    className="border-border bg-bg text-text hover:bg-card-bg inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold shadow-sm transition"
                  >
                    Browse Hackathons
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-bg border-border flex items-start gap-3 rounded-3xl border p-5 shadow-sm">
                  <Calendar className="text-primary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-text-light text-sm">Dates</p>
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

                <div className="bg-bg border-border flex items-start gap-3 rounded-3xl border p-5 shadow-sm">
                  <MapPin className="text-secondary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-text-light text-sm">Location</p>
                    <p className="font-semibold">{foundHackathon.location}</p>
                  </div>
                </div>

                <div className="bg-bg border-border flex items-start gap-3 rounded-3xl border p-5 shadow-sm">
                  <Award className="text-secondary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-text-light text-sm">Prize Pool</p>
                    <p className="font-semibold">{foundHackathon.prize}</p>
                  </div>
                </div>

                <div className="bg-bg border-border flex items-start gap-3 rounded-3xl border p-5 shadow-sm">
                  <Users className="text-primary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-text-light text-sm">Participants</p>
                    <p className="font-semibold">{foundHackathon.participants}</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="border-border bg-card-bg rounded-3xl border p-6 shadow-xl sm:p-8">
                <h2 className="text-xl font-bold">Overview</h2>
                <div className="text-text-light mt-4 space-y-4 text-sm leading-6">
                  <p>
                    <span className="text-text font-semibold">Organizer:</span>{" "}
                    {foundHackathon.organizer}
                  </p>
                  <p>
                    <span className="text-text font-semibold">Teams:</span> {foundHackathon.teams}
                  </p>
                  <p>
                    <span className="text-text font-semibold">Submissions:</span>{" "}
                    {foundHackathon.submissions}
                  </p>
                  <p>
                    <span className="text-text font-semibold">Status:</span>{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </div>
              </div>

              <div className="border-border bg-card-bg rounded-3xl border p-6 shadow-xl sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Tag className="text-primary h-5 w-5" />
                  Tech Stack
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(foundHackathon.techStack || []).map((tech) => (
                    <span
                      key={tech}
                      className="border-primary/20 bg-primary/10 text-primary rounded-full border px-3 py-1 text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-border bg-card-bg rounded-3xl border p-6 shadow-xl sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Trophy className="text-secondary h-5 w-5" />
                  Rules
                </h2>
                <ul className="text-text-light mt-4 list-inside list-disc space-y-2 text-sm">
                  {(foundHackathon.rules || []).map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default HackathonDetailsPage;
