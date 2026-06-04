import { buildCorsHeaders, corsResponse } from "../../auth/cors.js";
import { teamPins, sseClients } from "../../db/teamStore.js";

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

  const { action, id, text, tag } = req.body || {};

  if (!action) {
    return corsResponse(req, res, 400, { error: "Action is required" });
  }

  if (action === "add") {
    if (!text || !text.trim()) {
      return corsResponse(req, res, 400, { error: "Text is required for add action" });
    }
    const newPin = {
      id: `pin-${Date.now()}`,
      text: text.trim(),
      tag: tag || "Announcement",
      time: "Just now",
    };
    teamPins.unshift(newPin);
  } else if (action === "delete") {
    if (!id) {
      return corsResponse(req, res, 400, { error: "Pin ID is required for delete action" });
    }
    const index = teamPins.findIndex((p) => p.id === id);
    if (index === -1) {
      return corsResponse(req, res, 404, { error: "Pin not found" });
    }
    teamPins.splice(index, 1);
  } else {
    return corsResponse(req, res, 400, { error: "Invalid action" });
  }

  // Broadcast to all active SSE clients
  const payload = {
    type: "pins",
    pins: teamPins,
  };
  const sseData = `data: ${JSON.stringify(payload)}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(sseData);
    } catch (err) {
      sseClients.delete(client);
    }
  }

  return corsResponse(req, res, 200, { success: true, pins: teamPins });
}
