import { apiUtils, API_ENDPOINTS } from "../config/api";

/**
 * Normalises a raw HackathonResponse from the backend into the shape
 * expected by HackathonPage / HackathonCard.
 *
 * Backend fields  →  UI fields
 *  startDate/endDate  → status ("live" | "upcoming" | "completed")
 *  prizePool (string) → prize  (kept as-is; filter util parses digits)
 */
const normalizeHackathon = (h) => {
  const now = Date.now();
  const start = h.startDate ? new Date(h.startDate).getTime() : null;
  const end = h.endDate ? new Date(h.endDate).getTime() : null;

  let status = "upcoming";
  if (start && end) {
    if (now >= start && now <= end) status = "live";
    else if (now > end) status = "completed";
  }

  return {
    ...h,
    // computed
    status,
    // alias: filter util reads hackathon.prize
    prize: h.prize ?? h.prizePool ?? null,
    // alias: card reads hackathon.date as a fallback
    date: h.startDate ?? h.date ?? null,
    // techStack not in API yet — default to empty
    techStack: h.techStack ?? [],
  };
};

export const fetchHackathons = async () => {
  const response = await apiUtils.get(API_ENDPOINTS.HACKATHONS.LIST);
  const data = response.data;

  if (!Array.isArray(data)) {
    throw new Error("Hackathons API returned no data");
  }
  return data.map(normalizeHackathon);
};

export const hostHackathon = async (hackathonData, config) => {
  return apiUtils.post(API_ENDPOINTS.HACKATHONS.HOST, hackathonData, config);
};