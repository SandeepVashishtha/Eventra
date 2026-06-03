import { buildCorsHeaders, corsResponse } from "../../auth/cors.js";
import { teamChatHistory, sseClients } from "../../db/teamStore.js";

export default async function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const { text, sender } = req.body || {};

  if (!text || !text.trim()) {
    return corsResponse(req, res, 400, { error: "Text is required" });
  }

  const newMsg = {
    id: Date.now(),
    sender: sender || "Teammate",
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  teamChatHistory.push(newMsg);

  // Broadcast to all active SSE clients
  const payload = {
    type: "chat",
    chat: teamChatHistory,
  };
  const sseData = `data: ${JSON.stringify(payload)}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(sseData);
    } catch (err) {
      sseClients.delete(client);
    }
  }

  return corsResponse(req, res, 200, { success: true, chat: teamChatHistory });
}
