import { buildCorsHeaders } from "../../auth/cors.js";
import { teamTasks, teamPins, teamChatHistory, sseClients } from "../../db/teamStore.js";

export default async function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    res.end();
    return;
  }

  // SSE handler
  if (req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      ...corsHeaders,
    });

    // Send initial snapshot
    const snapshot = {
      type: "init",
      tasks: teamTasks,
      pins: teamPins,
      chat: teamChatHistory,
    };
    res.write(`data: ${JSON.stringify(snapshot)}\n\n`);

    // Register SSE client
    sseClients.add(res);

    // Setup heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`);
      } catch (err) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
    return;
  }

  // Short-polling fallback handler
  if (req.method === "POST") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      ...corsHeaders,
    });
    res.end(JSON.stringify({
      tasks: teamTasks,
      pins: teamPins,
      chat: teamChatHistory,
    }));
    return;
  }

  // Method not allowed
  res.writeHead(405, {
    "Content-Type": "application/json",
    ...corsHeaders,
  });
  res.end(JSON.stringify({ error: "Method not allowed" }));
}
