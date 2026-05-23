import React from "react";
import { motion } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  Server,
  AlertCircle,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react";

const endpoints = [
  {
    icon: <Server className="w-7 h-7 text-sky-300" />,
    title: "Hackathons",
    desc: "Fetch upcoming and ongoing hackathons.",
    method: "GET",
    url: "/api/hackathons",
    example: `fetch("/api/hackathons")
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err))`,
    response: `[
    
  {
    "id": 1,
    "title": "CodeFest 2025",
    "startDate": "2025-09-20",
    "endDate": "2025-09-25",
    "participants": 150
  }
]`,
  },
  {
    icon: <BookOpen className="w-7 h-7 text-emerald-300" />,
    title: "Projects",
    desc: "Retrieve projects submitted to hackathons.",
    method: "GET",
    url: "/api/projects?hackathonId=<id>",
example: `curl -X GET ${process.env.REACT_APP_API_URL}/projects?hackathonId=1`,
    response: `[
  {
    "id": 42,
    "title": "AI-Powered Chatbot",
    "author": "Jane Doe",
    "votes": 120
  }
]`,
  },
  {
    icon: <Users className="w-7 h-7 text-violet-300" />,
    title: "Contributors",
    desc: "Get a list of top contributors and GSOC participants.",
    method: "GET",
    url: "/api/contributors",
  example: `fetch("${process.env.REACT_APP_API_URL}/contributors", {
  headers: { Authorization: "Bearer <API_KEY>" }
})`,
    response: `[
  {
    "id": 7,
    "username": "dev_ankita",
    "points": 230,
    "rank": 2
  }
]`,
  },
  {
    icon: <Trophy className="w-7 h-7 text-amber-300" />,
    title: "Leaderboard",
    desc: "Fetch leaderboard rankings of participants.",
    method: "GET",
    url: "/api/leaderboard?limit=10",
    example: `curl -X GET \${process.env.REACT_APP_API_URL}/leaderboard?limit=10`,
    response: `[
  {
    "rank": 1,
    "username": "coder123",
    "points": 500
  }
]`,
  },
];

const ApiDocs = () => {
  useDocumentTitle("Eventra | API Docs");

  return (
    <div className="pastel-grid-bg min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 px-6 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: '"Anton", sans-serif' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          API Documentation
        </motion.h1>

        <p className="text-black dark:text-white max-w-2xl mx-auto text-lg">
          Explore mock REST API responses for{" "}
          <span className="text-black dark:text-white">Hackathons</span>,{" "}
          <span className="text-black dark:text-white">Projects</span>,{" "}
          <span className="text-black dark:text-white">Contributors</span>, and{" "}
          <span className="text-black dark:text-white">Leaderboards</span>{" "}
          in this frontend demo.
        </p>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          These documented endpoints return sample JSON-style data in the demo
          app. Connect a backend service before using them as production APIs.
        </p>
      </section>

      {/* Endpoints Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          Available Endpoints
        </h2>

        <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-800">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-[#1c1c1c]">
              <tr>
                <th className="p-4 text-left bg-gray-50 dark:bg-[#1c1c1c]">
                  API
                </th>
                <th className="p-4 text-left bg-gray-50 dark:bg-[#1c1c1c]">
                  Method
                </th>
                <th className="p-4 text-left bg-gray-50 dark:bg-[#1c1c1c]">
                  Endpoint
                </th>
                <th className="p-4 text-left bg-gray-50 dark:bg-[#1c1c1c]">
                  Description
                </th>
              </tr>
            </thead>

            <tbody className="bg-gray-50 dark:bg-[#000000]">
              {endpoints.map((ep, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition"
                >
                  <td className="p-4 flex items-center gap-3">
                    {ep.icon}
                    <span className="font-medium">{ep.title}</span>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
                      {ep.method}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                    {ep.url}
                  </td>

                  <td className="p-4 text-gray-500 dark:text-gray-400">
                    {ep.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Endpoint Details with Examples */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          Examples & Responses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {endpoints.map((ep, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                {ep.icon}
                <h3 className="text-xl font-semibold">{ep.title}</h3>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {ep.desc}
              </p>

              <h4 className="font-semibold mb-2">Example Request</h4>

              <pre className="bg-gray-100 dark:bg-black text-black dark:text-white text-sm rounded-lg p-3 overflow-x-auto">
                <code>{ep.example}</code>
              </pre>

              <h4 className="font-semibold mt-4 mb-2">Example Response</h4>

              <pre className="bg-gray-100 dark:bg-black text-black dark:text-white text-sm rounded-lg p-3 overflow-x-auto">
                <code>{ep.response}</code>
              </pre>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Error Codes */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Error Codes
        </h2>

        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-semibold">Common Errors</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-[#222]">
                <tr>
                  <th className="p-3 text-left bg-gray-50 dark:bg-[#000]">
                    Code
                  </th>
                  <th className="p-3 text-left bg-gray-50 dark:bg-[#000]">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody className="bg-gray-50 dark:bg-[#151515]">
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 text-black dark:text-white font-bold">
                    400
                  </td>
                  <td className="p-3">
                    Bad Request (missing or invalid parameters)
                  </td>
                </tr>

                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 text-black dark:text-white font-bold">
                    404
                  </td>
                  <td className="p-3">
                    Not Found (endpoint or resource not available)
                  </td>
                </tr>

                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 text-black dark:text-white font-bold">
                    500
                  </td>
                  <td className="p-3">
                    Server Error (something went wrong on our side)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiDocs;