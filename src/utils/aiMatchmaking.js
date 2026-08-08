/**
 * aiMatchmaking.js
 * 
 * Utility for AI-driven attendee matchmaking and networking scheduling.
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

// --- Atomic Score Calculators for CodeScene ---
const calcSkillScore = (skillsA, skillsBSet) => {
  return skillsA.filter(s => skillsBSet.has(s)).length * 10;
};

const calcIndustryScore = (userA, userB) => {
  return (userA?.industry && userA.industry === userB?.industry) ? 15 : 0;
};

const calcRoleScore = (userA, userB) => {
  // e.g. Designer meets Developer
  return (userA?.role && userB?.role && userA.role !== userB.role) ? 5 : 0;
};

export const generateCompatibilityScore = (userA, userB) => {
  // In a real implementation, this would involve vector embeddings of user profiles,
  // past events attended, and explicit interests.
  const skillsA = normalizeSkills(userA?.skills);
  const skillsBSet = new Set(normalizeSkills(userB?.skills));
  
  const skillScore = calcSkillScore(skillsA, skillsBSet);
  const industryScore = calcIndustryScore(userA, userB);
  const roleScore = calcRoleScore(userA, userB);
  
  return Math.min(50 + skillScore + industryScore + roleScore, 99);
};

// --- Atomic Seed Generator ---
const generateSeed = (userA, userB, dateStr) => {
  const idA = userA?.id || "";
  const idB = userB?.id || "";
  const date = dateStr || "";
  return `${idA}:${idB}:${date}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

export const suggestMeetingSlots = (userA, userB, dateStr) => {
  // In a real implementation, this would query their synced Google/Outlook calendars
  // (Issue #5590) to find overlapping free slots.
  const slots = [
    { start: "10:00 AM", end: "10:30 AM", type: "Virtual Lounge" },
    { start: "02:00 PM", end: "02:30 PM", type: "Coffee Area" },
    { start: "04:30 PM", end: "05:00 PM", type: "Virtual Lounge" }
  ];
  
  const offset = generateSeed(userA, userB, dateStr) % slots.length;
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

// --- Atomic Data Processing Pipeline ---
const getSharedSkillCount = (candidateSkills, userSkillsNorm) => {
  const candidateNorm = normalizeSkills(candidateSkills);
  return candidateNorm.filter(skill => userSkillsNorm.includes(skill)).length;
};

const processCandidate = (candidate, currentUser, userSkillsNorm, eventId) => {
  const score = generateCompatibilityScore(currentUser || {}, candidate);
  const sharedCount = getSharedSkillCount(candidate?.skills, userSkillsNorm);

  return { 
    ...candidate, 
    matchScore: score, 
    matchReason: getMatchReason(sharedCount, eventId) 
  };
};

const sortCandidatesByScore = (a, b) => b.matchScore - a.matchScore;

export const fetchRecommendedConnections = async (currentUser, eventId) => {
  try {
    // Simulates an API call to the RAG backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userSkillsNorm = normalizeSkills(currentUser?.skills);
    
    return getMockCandidates()
      .map(c => processCandidate(c, currentUser, userSkillsNorm, eventId))
      .sort(sortCandidatesByScore);
  } catch (error) {
    console.error("Failed to fetch recommended connections:", error);
    return []; 
  }
};