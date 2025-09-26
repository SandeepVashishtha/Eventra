import React from "react";
import { motion } from "framer-motion";
import {
  Server,
  AlertCircle,
  BookOpen,
  Users,
  Trophy,
  Key,
  Gauge,
  Filter,
  Terminal,
} from "lucide-react";

const endpoints = [
  {
    icon: <Server className="w-7 h-7 text-blue-400" />,
    title: "Hackathons",
    desc: "Fetch upcoming and ongoing hackathons.",
    method: "GET",
    url: "/api/hackathons",
    example: `fetch("/api/hackathons")
  .then(res => res.json())
  .then(data => console.log(data));`,
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
    icon: <BookOpen className="w-7 h-7 text-green-400" />,
    title: "Projects",
    desc: "Retrieve projects submitted to hackathons.",
    method: "GET",
    url: "/api/projects?hackathonId=<id>",
    example: `curl -X GET https://example.com/api/projects?hackathonId=1`,
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
    icon: <Users className="w-7 h-7 text-purple-400" />,
    title: "Contributors",
    desc: "Get a list of top contributors and GSOC participants.",
    method: "GET",
    url: "/api/contributors",
    example: `fetch("/api/contributors", {
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
    icon: <Trophy className="w-7 h-7 text-yellow-400" />,
    title: "Leaderboard",
    desc: "Fetch leaderboard rankings of participants.",
    method: "GET",
    url: "/api/leaderboard?limit=10",
    example: `curl -X GET https://example.com/api/leaderboard?limit=10`,
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
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 px-6 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          API Documentation
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Use our RESTful APIs to interact with{" "}
          <span className="text-blue-500 dark:text-blue-400">Hackathons</span>,{" "}
          <span className="text-green-500 dark:text-green-400">Projects</span>,{" "}
          <span className="text-purple-500 dark:text-purple-400">
            Contributors
          </span>
          , and{" "}
          <span className="text-yellow-500 dark:text-yellow-400">
            Leaderboards
          </span>{" "}
          programmatically.
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
                    <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
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
              <p className="text-gray-600 dark:text-gray-400 mb-3">{ep.desc}</p>

              <h4 className="font-semibold mb-2">Example Request</h4>
              <pre className="bg-gray-100 dark:bg-black text-cyan-700 dark:text-green-400 text-sm rounded-lg p-3 overflow-x-auto">
                <code>{ep.example}</code>
              </pre>

              <h4 className="font-semibold mt-4 mb-2">Example Response</h4>
              <pre className="bg-gray-100 dark:bg-black text-purple-700 dark:text-yellow-300 text-sm rounded-lg p-3 overflow-x-auto">
                <code>{ep.response}</code>
              </pre>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Error Codes */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Error Codes</h2>
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
                  <td className="p-3 text-red-600 dark:text-red-400 font-bold">
                    400
                  </td>
                  <td className="p-3">
                    Bad Request (missing or invalid parameters)
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 text-red-600 dark:text-red-400 font-bold">
                    404
                  </td>
                  <td className="p-3">
                    Not Found (endpoint or resource not available)
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 text-red-600 dark:text-red-400 font-bold">
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

      {/* Authentication */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Authentication</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All requests to protected endpoints require an API key. Pass your
            key in the{" "}
            <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
              Authorization
            </code>{" "}
            header as a Bearer token. API keys are unique to each user and
            should be kept secret.
          </p>
          <pre className="bg-indigo-50 dark:bg-black text-cyan-700 dark:text-green-400 text-sm rounded-lg p-3 overflow-x-auto mb-4">
            <code>{`fetch("/api/contributors", {
  headers: { Authorization: "Bearer YOUR_API_KEY" }
})`}</code>
          </pre>
          <p className="text-gray-900 dark:text-gray-400 mb-3">
            Best practices:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>
              Never expose your API key in client-side code or public repos.
            </li>
            <li>Rotate keys periodically for security.</li>
            <li>Restrict keys to specific domains or IPs when possible.</li>
          </ul>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold">Rate Limiting</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            To ensure fair usage, all requests are subject to rate limits. Each
            API key allows <b>100 requests per minute</b>. Rate limit
            information is included in response headers:
          </p>
          <pre className="bg-indigo-50 dark:bg-black text-purple-700 dark:text-yellow-300 text-sm rounded-lg p-3 overflow-x-auto mb-4">
            <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 1695037200`}</code>
          </pre>
          <p className="text-gray-900 dark:text-gray-400 mb-3">
            Handling rate limits:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>
              Check the <code>X-RateLimit-Remaining</code> header to avoid
              hitting the cap.
            </li>
            <li>
              If you receive a <code>429 Too Many Requests</code> error, wait
              until the <code>X-RateLimit-Reset</code> timestamp before
              retrying.
            </li>
            <li>
              Use exponential backoff or queue requests in high-volume
              scenarios.
            </li>
          </ul>
        </div>
      </section>

      {/* Pagination & Filtering */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold">Pagination & Filtering</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Many endpoints return large datasets. To optimize responses, use
            query parameters for pagination, sorting, and filtering.
          </p>
          <pre className="bg-indigo-50 dark:bg-black text-cyan-700 dark:text-green-400 text-sm rounded-lg p-3 overflow-x-auto mb-4">
            <code>{`GET /api/projects?page=2&limit=5&sort=votes&filter=ai`}</code>
          </pre>
          <h4 className="font-semibold mt-4 mb-2">Example Response</h4>
          <pre className="bg-indigo-50 dark:bg-black text-purple-700 dark:text-yellow-300 text-sm rounded-lg p-3 overflow-x-auto mb-4">
            <code>{`{
  "page": 2,
  "limit": 5,
  "total": 42,
  "projects": [
    { "id": 12, "title": "AI Chatbot", "votes": 88 },
    { "id": 15, "title": "ML Analyzer", "votes": 76 }
  ]
}`}</code>
          </pre>
          <p className="text-gray-900 dark:text-gray-400 mb-3">
            Supported parameters:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>
              <b>page</b> – The page number (default: 1)
            </li>
            <li>
              <b>limit</b> – Number of results per page (default: 10)
            </li>
            <li>
              <b>sort</b> – Field to sort by (e.g., votes, date)
            </li>
            <li>
              <b>filter</b> – Keyword filter (e.g., ai, web, cloud)
            </li>
          </ul>
        </div>
      </section>

      {/* API Explorer */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold">API Explorer</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Experiment with our endpoints using interactive tools. These
            explorers make testing and learning the API simple and fast.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>
              <a href="/swagger" className="text-blue-500 hover:underline">
                Swagger UI
              </a>{" "}
              – browse and execute endpoints in your browser.
            </li>
            <li>
              <a href="/postman.json" className="text-blue-500 hover:underline">
                Postman Collection
              </a>{" "}
              – import into Postman and test quickly.
            </li>
          </ul>
          <p className="text-gray-900 dark:text-gray-400">
            Example setup in Postman:
          </p>
          <pre className="bg-indigo-50 dark:bg-black text-cyan-700 dark:text-green-400 text-sm rounded-lg p-3 overflow-x-auto">
            <code>{`1. Import postman.json into Postman
2. Set environment variable: API_KEY = your key
3. Use "Authorization: Bearer {{API_KEY}}" in headers
4. Send requests and inspect live responses`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ApiDocs;
