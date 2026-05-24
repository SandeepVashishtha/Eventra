/**
 * Local mock SSE server for testing useRealTimeConnection.
 * Run: node sse-mock-server.js
 * Then set REACT_APP_API_URL=http://localhost:4001 in .env.local and restart the dev server.
 */
const http = require("http");

const PORT = 4001;

const MOCK_CONTRIBUTORS = [
  { username: "alice", name: "Alice Dev", avatar: "https://avatars.githubusercontent.com/u/1?v=4", profile: "https://github.com/alice", points: 42, prs: 6 },
  { username: "bob", name: "Bob Coder", avatar: "https://avatars.githubusercontent.com/u/2?v=4", profile: "https://github.com/bob", points: 35, prs: 5 },
  { username: "carol", name: "Carol Builder", avatar: "https://avatars.githubusercontent.com/u/3?v=4", profile: "https://github.com/carol", points: 28, prs: 4 },
];

const MOCK_NAMES = ["Priya Sharma", "Arjun Mehta", "Sneha Nair", "Karan Patel", "Divya Rao"];
const MOCK_EVENTS = ["Global AI Hackathon", "React Conference 2025", "Web Dev Workshop"];

function sseHeaders(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    // Allow the React dev server origin
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
  });
}

function send(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.url === "/stream/leaderboard") {
    sseHeaders(res);
    console.log("[SSE] leaderboard client connected");

    // Send initial snapshot immediately
    send(res, MOCK_CONTRIBUTORS);

    // Then push a simulated rank change every 8 seconds
    const interval = setInterval(() => {
      const updated = MOCK_CONTRIBUTORS.map((c) => ({
        ...c,
        points: c.points + Math.floor(Math.random() * 3),
        prs: c.prs + (Math.random() > 0.7 ? 1 : 0),
      })).sort((a, b) => b.points - a.points);
      send(res, updated);
      console.log("[SSE] leaderboard update sent");
    }, 8000);

    req.on("close", () => {
      clearInterval(interval);
      console.log("[SSE] leaderboard client disconnected");
    });
    return;
  }

  if (req.url === "/stream/analytics") {
    sseHeaders(res);
    console.log("[SSE] analytics client connected");

    // Push a new check-in every 5 seconds
    const interval = setInterval(() => {
      const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const event = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      const status = Math.random() > 0.1 ? "Verified" : "Flagged";
      const checkin = { id: `sse-${Date.now()}`, name, event, time: "Just now", status };
      send(res, checkin);
      console.log(`[SSE] analytics check-in: ${name} → ${status}`);
    }, 5000);

    req.on("close", () => {
      clearInterval(interval);
      console.log("[SSE] analytics client disconnected");
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`\nSSE mock server running on http://localhost:${PORT}`);
  console.log("Streams available:");
  console.log(`  GET http://localhost:${PORT}/stream/leaderboard`);
  console.log(`  GET http://localhost:${PORT}/stream/analytics`);
  console.log("\nNext steps:");
  console.log("  1. Create .env.local with: REACT_APP_API_URL=http://localhost:4001");
  console.log("  2. Restart the React dev server (npm run dev)");
  console.log("  3. Watch leaderboard and analytics update live\n");
});
