import { motion } from "framer-motion";
import {
  Calendar,
  Trophy,
  FolderOpen,
  Users,
  Settings,
  Clock,
  MapPin,
  Zap,
  Activity,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ThemeToggleButton from "../common/ThemeToggleButton";

const UserDashboard = () => {
  // Mock stats
  const userStats = {
    eventsCreated: 1,
    eventsRegistered: 2,
    hackathonsJoined: 2,
    hackathonsOrganized: 2,
    projectsSubmitted: 1,
    projectsContributed: 1,
  };

  const dashboardData = [
    {
      id: 1,
      type: "Event",
      title: "Tech Talk: AI in 2025",
      date: "15-06-2025",
      location: "Mumbai",
      status: "Completed",
      projectStatus: "Done",
      lastUpdate: "-",
      participationType: "Registered",
    },
    {
      id: 2,
      type: "Event",
      title: "Web Dev Workshop",
      date: "10-09-2025",
      location: "Online",
      status: "Upcoming",
      projectStatus: "Upcoming",
      lastUpdate: "-",
      participationType: "Registered",
    },
    {
      id: 3,
      type: "Hackathon",
      title: "Hack for Sustainability",
      date: "20-07-2025",
      location: "Bangalore",
      status: "Completed",
      projectStatus: "Done",
      lastUpdate: "-",
      participationType: "Hosted",
    },
    {
      id: 4,
      type: "Hackathon",
      title: "AI Hackathon",
      date: "05-09-2025",
      location: "Online",
      status: "Completed",
      projectStatus: "Done",
      lastUpdate: "-",
      participationType: "Registered",
    },
    {
      id: 5,
      type: "Event",
      title: "React Conference 2024",
      date: "15-12-2024",
      location: "San Francisco, CA",
      status: "Upcoming",
      projectStatus: "Upcoming",
      lastUpdate: "-",
      participationType: "Hosted",
    },
    {
      id: 6,
      type: "Hackathon",
      title: "Global AI Hackathon",
      date: "10-01-2025",
      location: "Online",
      status: "Upcoming",
      projectStatus: "Upcoming",
      lastUpdate: "-",
      participationType: "Registered",
    },
    {
      id: 7,
      type: "Hackathon",
      title: "Blockchain Builders Hack",
      date: "05-02-2025",
      location: "New York, USA",
      status: "Upcoming",
      projectStatus: "Upcoming",
      lastUpdate: "-",
      participationType: "Hosted",
    },
    {
      id: 8,
      type: "Project",
      title: "Online Pizza Shop",
      status: "-",
      projectStatus: "Done",
      lastUpdate: "30-08-2025",
      participationType: "Submitted",
    },
    {
      id: 9,
      type: "Project",
      title: "Student Gradesheet App",
      status: "-",
      projectStatus: "In Progress",
      lastUpdate: "08-09-2025",
      participationType: "Contributed",
    },
  ];

  const upcomingEvents = dashboardData.filter(
    (d) => d.type === "Event" && d.status === "Upcoming"
  );
  const activeProjects = dashboardData.filter(
    (d) => d.type === "Project" && d.projectStatus !== "Done"
  );
  const upcomingHackathons = dashboardData.filter(
    (d) => d.type === "Hackathon" && d.status === "Upcoming"
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return null;
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); 
  };

  const fullText = "Welcome back, User!";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    // UPDATED: Main page background
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {/* UPDATED: Text color and gradient */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Here's what's happening with your events, hackathons, and projects.
              </p>
            </motion.div>
            {/* Theme Toggle in Dashboard Header */}
            <div className="ml-4">
              <ThemeToggleButton size="default" showLabel={false} />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            {/* IMPROVEMENT: Converted inline style to theme-aware Tailwind classes */}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
              <Zap size={22} className="text-yellow-500" />
              Quick Actions
            </h2>

            {/* UPDATED: Quick action cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {/* Events */}
              <Link to="/events" className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm p-4 cursor-pointer transition hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-200/70 dark:hover:shadow-blue-900/50">
                <Calendar className="h-6 w-6 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Events</span>
              </Link>

              <Link
                to="/hackathons"
                className="flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-white border border-gray-300 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm p-4 cursor-pointer transition hover:shadow-lg hover:-translate-y-1 hover:border-pink-400 hover:shadow-pink-200/70 dark:hover:border-pink-500 hover:shadow-pink-200/70 dark:hover:shadow-pink-900/50"
              >
                <Trophy className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hackathons
                </span>
              </Link>

              {/* Projects */}
              <Link
                to="/projects"
                className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-white border border-gray-300 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm p-4 cursor-pointer transition hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 hover:shadow-purple-200/70 dark:hover:border-purple-500 hover:shadow-purple-200/70 dark:hover:shadow-purple-900/50"
              >
                <FolderOpen className="h-6 w-6 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Projects
                </span>
              </Link>

              {/* My Registrations */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("my-registrations")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white border border-gray-300 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm p-4 cursor-pointer transition hover:shadow-lg hover:-translate-y-1 hover:border-green-400 hover:shadow-green-200/70 dark:hover:border-green-500 hover:shadow-green-200/70 dark:hover:shadow-green-900/50"
              >
                <Users className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  My Registrations
                </span>
              </button>

              {/* Settings */}
              <Link
                to="/settings"
                className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white border border-gray-300 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm p-4 cursor-pointer transition hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 hover:shadow-gray-200/70 dark:hover:border-gray-500 hover:shadow-gray-200/70 dark:hover:shadow-gray-900/50"
              >
                <Settings className="h-6 w-6 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Settings
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Overview Metrics */}
          <motion.div variants={itemVariants}>
            {/* IMPROVEMENT: Converted inline style to theme-aware Tailwind classes */}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Activity size={24} className="text-purple-500" />
              Overview
            </h2>

            {/* UPDATED: Overview metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Events */}
              <div className="relative bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm p-6 transition duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-200/70 dark:hover:shadow-blue-900/50">
                <Calendar className="absolute top-4 right-4 h-5 w-5 text-blue-500" />
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Events</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{userStats.eventsCreated + userStats.eventsRegistered}</p>
                <div className="flex gap-6 mt-3 text-sm text-gray-500 dark:text-gray-500">
                  <span>{userStats.eventsCreated} Created</span>
                  <span>{userStats.eventsRegistered} Joined</span>
                </div>
              </div>

              {/* Hackathons */}
              
              <div className="relative bg-gradient-to-br from-pink-100 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm p-6 transition duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-pink-200/70 dark:hover:shadow-pink-900/50">
                <Trophy className="absolute top-4 right-4 h-5 w-5 text-pink-500" />
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Hackathons
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {userStats.hackathonsJoined + userStats.hackathonsOrganized}
                </p>
                <div className="flex gap-6 mt-3 text-sm text-gray-500">
                  <span>{userStats.hackathonsJoined} Joined</span>
                  <span>{userStats.hackathonsOrganized} Organized</span>
                </div>
              </div>

              {/* Projects */}
              <div className="relative bg-gradient-to-br from-purple-100 to-white dark:from-gray-800 dark:to-gray-700  border border-gray-300 dark:border dark:border-gray-700 rounded-xl shadow-sm p-6 transition duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-purple-200/70 dark:hover:shadow-purple-900/50">
                <FolderOpen className="absolute top-4 right-4 h-5 w-5 text-purple-500" />
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Projects</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {userStats.projectsSubmitted + userStats.projectsContributed}
                </p>
                <div className="flex gap-6 mt-3 text-sm text-gray-500">
                  <span>{userStats.projectsSubmitted} Submitted</span>
                  <span>{userStats.projectsContributed} Contributed</span>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Upcoming Events & Active Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Events Card */}
            <motion.div variants={itemVariants}>
              <div className=" border border-gray-300 dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800">
                <div className="p-4  border-b border-gray-300 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                    <Clock className="h-5 w-5 text-indigo-600" /> Upcoming Events
                  </h3>
                </div>
                <div className="p-4">
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition relative bg-white dark:bg-gray-800">
                          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium">
                            {event.participationType}
                          </span>

                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />{" "}
                              {event.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />{" "}
                              {event.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Hackathons Card */}
            <motion.div variants={itemVariants}>
              <div className="border border-gray-300 dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                    <Trophy className="h-5 w-5 text-pink-600" /> Hackathons
                  </h3>
                </div>
                <div className="p-4">
                  {upcomingHackathons.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingHackathons.map((hackathon) => (
                        <div
                          key={hackathon.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition relative bg-white dark:bg-gray-800"
                        >
                          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 font-medium">
                            {hackathon.participationType}
                          </span>

                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {hackathon.title}
                          </h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-pink-600" />{" "}
                              {hackathon.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-pink-600" />{" "}
                              {hackathon.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No upcoming hackathons</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Active Projects Card */}
            <motion.div variants={itemVariants}>
              <div className=" border border-gray-300 dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                    <FolderOpen className="h-5 w-5 text-purple-600" /> Active
                    Projects
                  </h3>
                </div>
                <div className="p-4">
                  {activeProjects.length > 0 ? (
                    <div className="space-y-4">
                      {activeProjects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition relative bg-white dark:bg-gray-800"
                        >
                          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                            {project.projectStatus}
                          </span>

                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {project.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last update: {project.lastUpdate}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No active projects</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            id="my-registrations"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto mt-12 w-full px-6 py-6 scroll-mt-24"
          >
            <h2 className="text-3xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                My Registrations
              </span>
            </h2>

            <table className="w-full min-w-[900px]  rounded-xl shadow bg-white dark:bg-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                    Location / Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 ">
                    Project Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                    Last Update
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Participation Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData
                  .slice()
                  .sort((a, b) => {
                    const dateA = parseDate(a.date) || new Date(0);
                    const dateB = parseDate(b.date) || new Date(0);
                    return dateB - dateA; // latest first
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">
                        {item.type === "Event" && (
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        )}
                        {item.type === "Hackathon" && (
                          <Trophy className="h-4 w-4 text-pink-600" />
                        )}
                        {item.type === "Project" && (
                          <FolderOpen className="h-4 w-4 text-purple-600" />
                        )}
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">
                        {item.date || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                        {item.location || item.status}
                      </td>
                      <td className="px-6 py-4 text-sm border-r border-gray-200 dark:border-gray-600">
                        <span className={`px-2 py-1 rounded-full font-medium whitespace-nowrap text-xs ${
                        item.projectStatus === "Done" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                        : item.projectStatus === "Upcoming" ? "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        : item.projectStatus === "In Progress" ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {item.projectStatus}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">{item.lastUpdate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.participationType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
