/**
 * Derives sponsor booth analytics from captured lead/interaction records.
 * Does not invent counts — only tallies recorded actions.
 */

/**
 * @param {Array<{ action?: string }>} leads
 * @returns {{
 *   boothVisits: number,
 *   footfall: number,
 *   jobClicks: number,
 *   chatInitiations: number,
 *   qrScans: number,
 *   engagementRate: number,
 * }}
 */
export function computeSponsorBoothMetrics(leads = []) {
  const list = Array.isArray(leads) ? leads : [];

  let boothVisits = 0;
  let jobClicks = 0;
  let chatInitiations = 0;

  for (const lead of list) {
    const action = String(lead?.action || "").trim();
    if (action === "Booth Visit") {
      boothVisits += 1;
    } else if (action === "Chat Initiated") {
      chatInitiations += 1;
    } else if (/^Applied:/i.test(action)) {
      jobClicks += 1;
    }
  }

  const qrScans = list.length;
  const engagementBase = boothVisits > 0 ? boothVisits : 0;
  const engagementRate =
    engagementBase > 0
      ? Number((((jobClicks + chatInitiations) / engagementBase) * 100).toFixed(1))
      : 0;

  return {
    boothVisits,
    footfall: boothVisits,
    jobClicks,
    chatInitiations,
    qrScans,
    engagementRate,
  };
}
