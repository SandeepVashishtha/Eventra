import { createEvent } from 'ics';

const EVENT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

function isValidObjectId(value) {
  return typeof value === 'string' && EVENT_ID_PATTERN.test(value);
}

function isValidISODate(value) {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value) && !isNaN(new Date(value).getTime());
}

function buildSafeOrigin(req) {
  const origin = req.headers.origin || req.headers.host || '';
  const allowedProtocols = ['https:', 'http:'];
  try {
    const url = new URL(origin);
    if (allowedProtocols.includes(url.protocol)) {
      return url.origin;
    }
  } catch {
    if (origin && allowedProtocols.some((p) => origin.startsWith(p))) {
      return origin;
    }
  }
  return 'https://eventra.sandeepvashishtha.in';
}

function toDateArray(date) {
  const d = new Date(date);
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ message: 'Missing eventId parameter' });
  }
  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ message: 'Invalid eventId format (expected 24-char hex string)' });
  }

  try {
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

    if (!event.title || !event.startDateTime || !event.endDateTime) {
      return res.status(400).json({ message: 'Event missing required fields (title, startDateTime, endDateTime)' });
    }
    if (!isValidISODate(event.startDateTime) || !isValidISODate(event.endDateTime)) {
      return res.status(400).json({ message: 'Event has invalid date format (expected ISO 8601)' });
    }

    const start = toDateArray(event.startDateTime);
    const end = toDateArray(event.endDateTime);

    const calEvent = {
      start,
      end,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      url: `${buildSafeOrigin(req)}/events/${eventId}`,
    };

    createEvent(calEvent, (error, value) => {
      if (error) {
        return res.status(500).json({ error: 'Error generating calendar file' });
      }

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event_${eventId}.ics"`);

      return res.status(200).send(value);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}