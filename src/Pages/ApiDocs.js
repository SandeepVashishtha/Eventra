import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useReducedMotion from "../hooks/useReducedMotion.js";
import {
  Server,
  AlertCircle,
  BookOpen,
  Users,
  Trophy,
  Play,
  RefreshCw,
  Terminal,
  Settings,
} from "lucide-react";

const endpoints = [
  {
    icon: <Server className="h-7 w-7 text-sky-300" />,
    title: "Hackathons",
    desc: "Fetch upcoming and ongoing hackathons.",
    method: "GET",
    url: "/mock-api/hackathons",
    example: `fetch("/mock-api/hackathons")
.then(res => res.json())
.then(data => { /* handle response */ })
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
    icon: <BookOpen className="h-7 w-7 text-emerald-300" />,
    title: "Projects",
    desc: "Retrieve projects submitted to hackathons.",
    method: "GET",
    url: "/mock-api/projects?hackathonId=<id>",
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
    icon: <Users className="h-7 w-7 text-violet-300" />,
    title: "Contributors",
    desc: "Get a list of top contributors and GSOC participants.",
    method: "GET",
    url: "/mock-api/contributors",
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
    icon: <Trophy className="h-7 w-7 text-amber-300" />,
    title: "Leaderboard",
    desc: "Fetch leaderboard rankings of participants.",
    method: "GET",
    url: "/mock-api/leaderboard?limit=10",
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
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | API Docs");

  const [selectedEndpoint, setSelectedEndpoint] = useState("/mock-api/hackathons");
  const [params, setParams] = useState({
    limit: "5",
    status: "all",
    hackathonId: "1",
    sortBy: "recent",
    authHeader: "Bearer [redacted]",
    role: "all",
    page: "1",
  });
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleParamChange = (name, val) => {
    setParams((prev) => ({ ...prev, [name]: val }));
  };

  const executeMockRequest = () => {
    setIsLoading(true);
    setTerminalOutput("");

    // Track execution for onboarding checklist
    localStorage.setItem("eventra_sandbox_executed", "true");

    timeoutRef.current = setTimeout(() => {
      let data = [];
      const headers = {
        Status: "200 OK",
        "Content-Type": "application/json",
        "X-Powered-By": "Eventra Mock API Sandbox Engine",
        "Cache-Control": "no-cache",
      };

      switch (selectedEndpoint) {
        case "/mock-api/hackathons": {
          const limitVal = parseInt(params.limit, 10) || 5;
          const statusVal = params.status || "all";
          const allHackathons = [
            {
              id: 1,
              title: "CodeFest 2025",
              startDate: "2025-09-20",
              endDate: "2025-09-25",
              participants: 150,
              status: "completed",
            },
            {
              id: 2,
              title: "AI Innovation Challenge",
              startDate: "2026-06-15",
              endDate: "2026-06-18",
              participants: 420,
              status: "active",
            },
            {
              id: 3,
              title: "Global Open Source Sprint",
              startDate: "2026-08-01",
              endDate: "2026-08-10",
              participants: 750,
              status: "active",
            },
            {
              id: 4,
              title: "Web3 Protocol Buildathon",
              startDate: "2026-11-10",
              endDate: "2026-11-15",
              participants: 280,
              status: "active",
            },
            {
              id: 5,
              title: "Cyber Shield Security CTF",
              startDate: "2025-12-05",
              endDate: "2025-12-07",
              participants: 190,
              status: "completed",
            },
          ];
          let filtered = allHackathons;
          if (statusVal !== "all") {
            filtered = allHackathons.filter((h) => h.status === statusVal);
          }
          data = filtered.slice(0, limitVal);
          break;
        }
        case "/mock-api/projects": {
          const hackathonId = params.hackathonId || "1";
          const sortBy = params.sortBy || "recent";
          const allProjects = [
            {
              id: 42,
              title: "AI-Powered Chatbot",
              author: "Jane Doe",
              votes: 120,
              hackathonId: "1",
              date: "2025-09-24",
            },
            {
              id: 43,
              title: "Decentralized File Storage",
              author: "Bob Smith",
              votes: 95,
              hackathonId: "2",
              date: "2026-06-17",
            },
            {
              id: 44,
              title: "Open Source Contributor Board",
              author: "Alice Johnson",
              votes: 240,
              hackathonId: "1",
              date: "2025-09-25",
            },
            {
              id: 45,
              title: "Zero Knowledge Proof Verification",
              author: "Charlie Brown",
              votes: 180,
              hackathonId: "2",
              date: "2026-06-16",
            },
          ];
          let filtered = allProjects.filter((p) => p.hackathonId === hackathonId);
          if (sortBy === "votes") {
            filtered.sort((a, b) => b.votes - a.votes);
          }
          data = filtered;
          break;
        }
        case "/mock-api/contributors": {
          const authHeader = params.authHeader || "";
          if (!authHeader.startsWith("Bearer ")) {
            headers.Status = "401 Unauthorized";
            data = { error: "Missing or invalid bearer token in Authorization headers." };
            break;
          }
          const role = params.role || "all";
          const allContributors = [
            { id: 7, username: "dev_ankita", points: 230, rank: 2, role: "maintainer" },
            { id: 8, username: "coder123", points: 500, rank: 1, role: "contributor" },
            { id: 9, username: "alex_builds", points: 180, rank: 3, role: "contributor" },
            { id: 10, username: "sara_security", points: 150, rank: 4, role: "maintainer" },
          ];
          let filtered = allContributors;
          if (role !== "all") {
            filtered = allContributors.filter((c) => c.role === role);
          }
          data = filtered;
          break;
        }
        case "/mock-api/leaderboard": {
          const limitVal = parseInt(params.limit, 10) || 10;
          const pageVal = parseInt(params.page, 10) || 1;
          const allLeaderboard = [
            { rank: 1, username: "coder123", points: 500 },
            { rank: 2, username: "dev_ankita", points: 230 },
            { rank: 3, username: "alex_builds", points: 180 },
            { rank: 4, username: "sara_security", points: 150 },
            { rank: 5, username: "john_doe", points: 120 },
            { rank: 6, username: "jane_doe", points: 110 },
          ];
          const start = (pageVal - 1) * limitVal;
          data = allLeaderboard.slice(start, start + limitVal);
          break;
        }
        default:
          break;
      }

      const responseStr = JSON.stringify(data, null, 2);
      const headersStr = Object.entries(headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      setTerminalOutput(`${headersStr}\n\n${responseStr}`);
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="pastel-grid-bg min-h-screen bg-white px-6 py-16 text-gray-900 dark:bg-[#121212] dark:text-gray-100">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <motion.h1
          className="mb-4 text-4xl font-bold md:text-5xl"
          style={{ fontFamily: '"Anton", sans-serif' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          API Documentation
        </motion.h1>

        <p className="mx-auto max-w-2xl text-lg text-black dark:text-white">
          Explore mock REST API responses for{" "}
          <span className="text-black dark:text-white">Hackathons</span>,{" "}
          <span className="text-black dark:text-white">Projects</span>,{" "}
          <span className="text-black dark:text-white">Contributors</span>, and{" "}
          <span className="text-black dark:text-white">Leaderboards</span> in this frontend demo.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          These documented endpoints return sample JSON-style data in the demo app. Connect a
          backend service before using them as production APIs.
        </p>
      </section>

      {/* Endpoints Section */}
      <section className="mx-auto mb-20 max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-semibold">Available Endpoints</h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow dark:border-gray-800">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-[#1c1c1c]">
              <tr>
                <th className="bg-gray-50 p-4 text-left dark:bg-[#1c1c1c]">API</th>
                <th className="bg-gray-50 p-4 text-left dark:bg-[#1c1c1c]">Method</th>
                <th className="bg-gray-50 p-4 text-left dark:bg-[#1c1c1c]">Endpoint</th>
                <th className="bg-gray-50 p-4 text-left dark:bg-[#1c1c1c]">Description</th>
              </tr>
            </thead>

            <tbody className="bg-gray-50 dark:bg-[#000000]">
              {endpoints.map((ep, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-[#1a1a1a]"
                >
                  <td className="flex items-center gap-3 p-4">
                    {ep.icon}
                    <span className="font-medium">{ep.title}</span>
                  </td>

                  <td className="p-4">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-black dark:bg-gray-800 dark:text-white">
                      {ep.method}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                    {ep.url}
                  </td>

                  <td className="p-4 text-gray-500 dark:text-gray-400">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Endpoint Details with Examples */}
      <section className="mx-auto mb-20 max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-semibold">Examples & Responses</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {endpoints.map((ep, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-[#1a1a1a]"
            >
              <div className="mb-4 flex items-center gap-3">
                {ep.icon}
                <h3 className="text-xl font-semibold">{ep.title}</h3>
              </div>

              <p className="mb-3 text-gray-600 dark:text-gray-400">{ep.desc}</p>

              <h4 className="mb-2 font-semibold">Example Request</h4>

              <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm text-black dark:bg-black dark:text-white">
                <code>{ep.example}</code>
              </pre>

              <h4 className="mt-4 mb-2 font-semibold">Example Response</h4>

              <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm text-black dark:bg-black dark:text-white">
                <code>{ep.response}</code>
              </pre>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Error Codes */}
      <section className="mx-auto mb-20 max-w-6xl">
        <h2 className="mb-8 text-center text-3xl font-semibold">Error Codes</h2>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-[#1a1a1a]">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h3 className="text-xl font-semibold">Common Errors</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-[#222]">
                <tr>
                  <th className="bg-gray-50 p-3 text-left dark:bg-[#000]">Code</th>
                  <th className="bg-gray-50 p-3 text-left dark:bg-[#000]">Description</th>
                </tr>
              </thead>

              <tbody className="bg-gray-50 dark:bg-[#151515]">
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 font-bold text-black dark:text-white">400</td>
                  <td className="p-3">Bad Request (missing or invalid parameters)</td>
                </tr>

                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 font-bold text-black dark:text-white">404</td>
                  <td className="p-3">Not Found (endpoint or resource not available)</td>
                </tr>

                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3 font-bold text-black dark:text-white">500</td>
                  <td className="p-3">Server Error (something went wrong on our side)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INTERACTIVE API PLAYGROUND SANDBOX */}
      <section className="mx-auto mb-16 max-w-6xl">
        <h2 className="mb-8 text-center text-3xl font-semibold">Interactive API Playground</h2>

        <div className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-xl md:p-8 lg:grid-cols-[340px_1fr]">
          {/* Playground config panel */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">
              <Settings className="h-4 w-4" />
              <span>Query Configurator</span>
            </div>

            {/* Select Endpoint */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-400 uppercase">
                Target Endpoint
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="/mock-api/hackathons">GET /mock-api/hackathons</option>
                <option value="/mock-api/projects">GET /mock-api/projects</option>
                <option value="/mock-api/contributors">GET /mock-api/contributors</option>
                <option value="/mock-api/leaderboard">GET /mock-api/leaderboard</option>
              </select>
            </div>

            {/* Config inputs based on Endpoint */}
            <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
              <span className="block text-[10px] leading-none font-black tracking-widest text-slate-500 uppercase">
                Parameters
              </span>

              {selectedEndpoint === "/mock-api/hackathons" && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Limit (Count)
                    </label>
                    <input
                      type="number"
                      value={params.limit}
                      onChange={(e) => handleParamChange("limit", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Status
                    </label>
                    <select
                      value={params.status}
                      onChange={(e) => handleParamChange("status", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedEndpoint === "/mock-api/projects" && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Hackathon ID
                    </label>
                    <input
                      type="text"
                      value={params.hackathonId}
                      onChange={(e) => handleParamChange("hackathonId", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Sort By
                    </label>
                    <select
                      value={params.sortBy}
                      onChange={(e) => handleParamChange("sortBy", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="recent">Recent</option>
                      <option value="votes">Votes</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedEndpoint === "/mock-api/contributors" && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Authorization Header
                    </label>
                    <input
                      type="text"
                      value={params.authHeader}
                      onChange={(e) => handleParamChange("authHeader", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="Bearer token"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Role Filter
                    </label>
                    <select
                      value={params.role}
                      onChange={(e) => handleParamChange("role", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="maintainer">Maintainer</option>
                      <option value="contributor">Contributor</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedEndpoint === "/mock-api/leaderboard" && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Limit
                    </label>
                    <input
                      type="number"
                      value={params.limit}
                      onChange={(e) => handleParamChange("limit", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                      Page
                    </label>
                    <input
                      type="number"
                      value={params.page}
                      onChange={(e) => handleParamChange("page", e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={executeMockRequest}
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-indigo-700 disabled:opacity-50"
              aria-label="button"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executing Request...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Execute Request</span>
                </>
              )}
            </button>
          </div>

          {/* Playground terminal sandbox */}
          <div className="flex h-[340px] min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 md:h-auto">
            {/* Console Address Bar */}
            <div className="border-slate-850 flex items-center gap-3 border-b bg-slate-900 px-4 py-3">
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="border-slate-850 flex flex-1 scrollbar-none items-center gap-2 overflow-x-auto rounded-lg border bg-slate-950 px-3 py-1 font-mono text-[10px] whitespace-nowrap text-slate-400 select-all">
                <span className="shrink-0 font-bold text-emerald-500 uppercase">GET</span>
                <span>http://localhost:3000{selectedEndpoint}</span>
                {selectedEndpoint === "/mock-api/hackathons" && (
                  <span className="shrink-0 text-indigo-400">
                    ?limit={params.limit}&status={params.status}
                  </span>
                )}
                {selectedEndpoint === "/mock-api/projects" && (
                  <span className="shrink-0 text-indigo-400">
                    ?hackathonId={params.hackathonId}&sortBy={params.sortBy}
                  </span>
                )}
                {selectedEndpoint === "/mock-api/contributors" && (
                  <span className="shrink-0 text-indigo-400">?role={params.role}</span>
                )}
                {selectedEndpoint === "/mock-api/leaderboard" && (
                  <span className="shrink-0 text-indigo-400">
                    ?limit={params.limit}&page={params.page}
                  </span>
                )}
              </div>
            </div>

            {/* Output terminal */}
            <div className="flex-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent overflow-y-auto p-4 font-mono text-xs leading-relaxed select-text">
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                  <span>Connecting to mock sandbox database...</span>
                </div>
              ) : terminalOutput ? (
                <pre className="whitespace-pre-wrap text-emerald-400">{terminalOutput}</pre>
              ) : (
                <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-2 text-center text-slate-600">
                  <Terminal className="h-8 w-8 text-slate-800" />
                  <p className="text-[11px]">
                    Terminal idle. Configure your query parameters and click &quot;Execute
                    Request&quot; to display payload console details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiDocs;
