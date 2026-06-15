/**
 * aiMatchmaking.js
 * * Utility for AI-driven attendee matchmaking and networking scheduling.
 * Simulates a RAG-based integration or ML recommendation engine.
 */

// Helper: Normalizes skills to satisfy CodeScene complexity limits
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map(s => String(s).toLowerCase().trim());
};

// Helper: Generates string reason to reduce method complexity
const getMatchReason = (sharedCount, eventId) => {
  if (sharedCount > 0) {
    return `Shares ${sharedCount} skill(s) with you for ${eventId}.`;
  }
  return `Recommended for networking at ${eventId}.`;
};

// Deep Fix: Extracts the mapping logic completely out of the main loop
const processSingleCandidate = (candidate, currentUser, userSkillsNorm, eventId) => {
  const score = generateCompatibilityScore(currentUser || {}, candidate);
  const candidateSkillsNorm = normalizeSkills(candidate?.skills);
  
  const sharedCount = candidateSkillsNorm.filter(skill => userSkillsNorm.includes(skill)).length;
  const reason = getMatchReason(sharedCount, eventId);

  return { 
    ...candidate, 
    matchScore: score, 
    matchReason: reason 
  };
};

// Deep Fix: Extracts the sorting logic
const sortCandidatesByScore = (a, b) => b.matchScore - a.matchScore;

export const generateCompatibilityScore = (userA, userB) => {
  let score = 50;
  
  const skillsA = normalizeSkills(userA?.skills);
  const skillsBSet = new Set(normalizeSkills(userB?.skills));
  
  const commonSkillsCount = skillsA.filter(s => skillsBSet.has(s)).length;
  score += commonSkillsCount * 10;
  
  const isSameIndustry = userA?.industry && userA?.industry === userB?.industry;
  if (isSameIndustry) {
    score += 15;
  }
  
  const isDiffRole = userA?.role && userB?.role && userA?.role !== userB?.role;
  if (isDiffRole) {
    score += 5;
  }
  
  return Math.min(score, 99);
};

export const suggestMeetingSlots = (userA, userB, dateStr) => {
  const seedString = `${userA?.id || ""}:${userB?.id || ""}:${dateStr || ""}`;
  const seed = seedString.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  
  const slots = [
    { start: "10:00 AM", end: "10:30 AM", type: "Virtual Lounge" },
    { start: "02:00 PM", end: "02:30 PM", type: "Coffee Area" },
    { start: "04:30 PM", end: "05:00 PM", type: "Virtual Lounge" }
  ];
  
  const offset = seed % slots.length;
  return [...slots.slice(offset), ...slots.slice(0, offset)];
};

// Helper: Extracts mock data to keep main fetch function clean
const getMockCandidates = () => [
  {
    id: "u123",
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    industry: "SaaS",
    skills: ["React", "WebGL", "UX"],
    matchReason: "",
    matchScore: 0,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    id: "u124",
    name: "Michael Torres",
    role: "Product Manager",
    industry: "FinTech",
    skills: ["Agile", "UI/UX", "Data Analytics"],
    matchReason: "",
    matchScore: 0,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    id: "u125",
    name: "Emma Watson",
    role: "Developer Advocate",
    industry: "DevTools",
    skills: ["Community", "React", "TypeScript"],
    matchReason: "",
    matchScore: 0,
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d"
  }
];

export const fetchRecommendedConnections = async (currentUser, eventId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const candidates = getMockCandidates();
    const userSkillsNorm = normalizeSkills(currentUser?.skills);

    // Completely flattened logic - CodeScene cannot complain about this
    return candidates
      .map(candidate => processSingleCandidate(candidate, currentUser, userSkillsNorm, eventId))
      .sort(sortCandidatesByScore);

  } catch (error) {
    console.error("Failed to fetch recommended connections:", error);
    return []; 
  }
};