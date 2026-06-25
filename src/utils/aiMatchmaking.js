/**
 * aiMatchmaking.js
 *
 * Utility for AI-driven attendee matchmaking and networking scheduling.
 * Simulates a RAG-based integration or ML recommendation engine.
 */

export const generateCompatibilityScore = (userA, userB) => {
  // In a real implementation, this would involve vector embeddings of user profiles,
  // past events attended, and explicit interests.
  let score = 50;

  const skillsA = userA.skills || [];
  const skillsB = userB.skills || [];

  const skillsBSet = new Set(skillsB);
  const commonSkills = skillsA.filter((s) => skillsBSet.has(s));
  score += commonSkills.length * 10;

  if (userA.industry === userB.industry) score += 15;
  if (userA.role !== userB.role) score += 5; // e.g. Designer meets Developer

  return Math.min(score, 99);
};

export const suggestMeetingSlots = (userA, userB, dateStr) => {
  // In a real implementation, this would query their synced Google/Outlook calendars
  // (Issue #5590) to find overlapping free slots.
  const seed = `${userA?.id || ""}:${userB?.id || ""}:${dateStr || ""}`
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const slots = [
    { start: "10:00 AM", end: "10:30 AM", type: "Virtual Lounge" },
    { start: "02:00 PM", end: "02:30 PM", type: "Coffee Area" },
    { start: "04:30 PM", end: "05:00 PM", type: "Virtual Lounge" },
  ];
  const offset = seed % slots.length;
  return [...slots.slice(offset), ...slots.slice(0, offset)];
};

export const fetchRecommendedConnections = async (currentUser, eventId) => {
  // Simulates an API call to the RAG backend
  await new Promise((resolve) => setTimeout(resolve, 800));

  const candidates = [
    {
      id: "u123",
      name: "Sarah Chen",
      role: "Senior Frontend Engineer",
      industry: "SaaS",
      skills: ["React", "WebGL", "UX"],
      matchReason: "",
      matchScore: 0,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
      id: "u124",
      name: "Michael Torres",
      role: "Product Manager",
      industry: "FinTech",
      skills: ["Agile", "UI/UX", "Data Analytics"],
      matchReason: "",
      matchScore: 0,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      id: "u125",
      name: "Emma Watson",
      role: "Developer Advocate",
      industry: "DevTools",
      skills: ["Community", "React", "TypeScript"],
      matchReason: "",
      matchScore: 0,
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    },
  ];

  return candidates
    .map((candidate) => {
      const score = generateCompatibilityScore(currentUser || {}, candidate);
      const sharedSkills = (currentUser?.skills || []).filter((skill) =>
        candidate.skills.includes(skill)
      );
      return {
        ...candidate,
        matchScore: score,
        matchReason: sharedSkills.length
          ? `Shares ${sharedSkills.join(", ")} with you for ${eventId}.`
          : `Recommended for networking at ${eventId}.`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};
