import { createEvent } from 'ics';
import { getClientIp } from "../../_lib/getClientIp.js";
import { icsRateLimiter } from "../../_lib/rateLimiter.js";
// Import your database utility/repository helper to fetch event details
// e.g., import { getEventById } from '../../../lib/db'; 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rateLimitResult = icsRateLimiter.checkAsync
      ? await icsRateLimiter.checkAsync(getClientIp(req))
      : icsRateLimiter.check(getClientIp(req));
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
  } catch (rateLimitError) {
    console.error("[ics] Rate limit check failed:", rateLimitError.message);
    return res.status(500).json({ error: "Rate limiting service unavailable. Please try again later." });
  }

  const { eventId } = req.query;

  try {
    // 1. Fetch event data from your local database/repository layer
    // const event = await getEventById(eventId);
    const event = {
      title: "Sample Eventra Event",
      description: "Join us for an amazing community gathering!",
      location: "Virtual / Zoom",
      startDateTime: "2026-07-15T18:00:00Z",
      endDateTime: "2026-07-15T20:00:00Z",
    };

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Parse dates for the 'ics' library (expects arrays: [YYYY, MM, DD, HH, MM])
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    const start = [
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + 1,
      startDate.getUTCDate(),
      startDate.getUTCHours(),
      startDate.getUTCMinutes()
    ];

    const end = [
      endDate.getUTFullYear(),
      endDate.getUTCMonth() + 1,
      endDate.getUTCDate(),
      endDate.getUTCHours(),
      endDate.getUTCMinutes()
    ];

    // 3. Build the iCal event configuration
    const calEvent = {
      start,
      end,
      title: event.title,
      description: event.description,
      location: event.location,
      url: `${req.headers.origin}/events/${eventId}`,
    };

    // 4. Generate the payload and serve it with text/calendar headers
    createEvent(calEvent, (error, value) => {
      if (error) {
        return res.status(500).json({ error: 'Error generating calendar file' });
      }

      // Set headers for file download match standard RFC rules
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event_${eventId}.ics"`);
      
      return res.status(200).send(value);
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}