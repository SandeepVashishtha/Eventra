import { Link, useLocation } from "react-router-dom";

const mockResponses = {
  // 🔥 FIX: Changed dictionary keys from "/mock-api/..." to "/api/..." to match actual router paths
  "/api/hackathons": {
    status: 200,
    source: "mock",
    data: [
      {
        id: 1,
        title: "CodeFest 2025",
        startDate: "2025-09-20",
        endDate: "2025-09-25",
        participants: 150,
      },
    ],
  },
  "/api/projects": {
    status: 200,
    source: "mock",
    data: [
      {
        id: 42,
        title: "AI-Powered Chatbot",
        author: "Jane Doe",
        votes: 120,
      },
    ],
  },
  "/api/contributors": {
    status: 200,
    source: "mock",
    data: [
      {
        id: 7,
        username: "dev_ankita",
        points: 230,
        rank: 2,
      },
    ],
  },
  "/api/leaderboard": {
    status: 200,
    source: "mock",
    data: [
      {
        rank: 1,
        username: "coder123",
        points: 500,
      },
    ],
  },
};

const MockApiResponse = () => {
  const location = useLocation();
  
  // 🔥 FIX: Normalize the path by removing any trailing slashes to prevent 404s on exact matches
  const normalizedPath = location.pathname.replace(/\/$/, "");
  
  const response = mockResponses[normalizedPath] || {
    status: 404,
    source: "mock",
    error: "Endpoint not found",
  };

  const payload = {
    ...response,
    endpoint: `${location.pathname}${location.search}`,
    message:
      "This frontend demo returns mock API documentation data. Connect a backend service for live API responses.",
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-300 uppercase">
              Mock API Response
            </p>
            <h1 className="mt-2 text-3xl font-bold">{payload.endpoint}</h1>
          </div>
          <Link
            to="/api-docs"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Back to API Docs
          </Link>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-5 text-left text-sm leading-6 text-emerald-100 shadow-xl">
          <code>{JSON.stringify(payload, null, 2)}</code>
        </pre>
      </section>
    </main>
  );
};

export default MockApiResponse;