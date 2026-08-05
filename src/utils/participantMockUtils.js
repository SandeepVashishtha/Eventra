const FIRST_NAMES = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Nina", "Oscar", "Peggy", "Romeo", "Sybil", "Trent", "Victor", "Walter"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"];
const STATUSES = ["Confirmed", "Waitlisted", "Checked In", "Cancelled"];

/**
 * Generates an array of mock participants for an event.
 * @param {string|number} eventId - The ID of the event.
 * @param {number} count - The number of mock participants to generate.
 * @returns {Array} List of participant objects.
 */
export function generateMockParticipants(eventId, count = 20) {
  const participants = [];
  
  // Use eventId as a seed modifier to keep names deterministic per event (simple approach)
  let seed = String(eventId).charCodeAt(0) || 1;

  const randomInt = (max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * max);
  };

  const getStatus = (index) => {
    // 80% confirmed, 10% checked in, 5% waitlisted, 5% cancelled
    const r = randomInt(100);
    if (r < 80) return "Confirmed";
    if (r < 90) return "Checked In";
    if (r < 95) return "Waitlisted";
    return "Cancelled";
  };

  const getRandomDate = () => {
    const daysAgo = randomInt(30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[randomInt(FIRST_NAMES.length)];
    const lastName = LAST_NAMES[randomInt(LAST_NAMES.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(99)}@example.com`;
    
    participants.push({
      Name: `${firstName} ${lastName}`,
      Email: email,
      "Registration Date": getRandomDate(),
      Status: getStatus(i)
    });
  }

  return participants;
}
