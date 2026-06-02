/**
 * aiAssistant.js
 * 
 * Core logic for the RAG-based AI assistant.
 * Handles event indexing simulation and conversational discovery.
 */

const SAMPLE_KNOWLEDGE_BASE = [
  "Eventra is a community-driven platform for builders and organizers.",
  "Hackathons are usually beginner-friendly and offer mentorship.",
  "Web Development events often feature React, Next.js, and Tailwind CSS workshops.",
  "The Networking Hub (Issue #5601) allows for smart attendee matchmaking.",
  "Organizers can use the Analytics Dashboard (#5454) to track real-time trends."
];

/**
 * Simulates a RAG retrieval step: finding relevant document chunks
 */
export const retrieveContext = (query) => {
  const normalized = query.toLowerCase();
  return SAMPLE_KNOWLEDGE_BASE.filter(doc => 
    normalized.split(" ").some(word => doc.toLowerCase().includes(normalized))
  ).join("\n");
};

/**
 * Simulates an AI response generation using RAG
 */
export const generateAIResponse = async (userQuery, events) => {
  // Simulating latency
  await new Promise(resolve => setTimeout(resolve, 1200));

  const context = retrieveContext(userQuery);
  const q = userQuery.toLowerCase();

  // Simple rule-based logic for demo (simulating LLM decision tree)
  if (q.includes("hackathon") || q.includes("build")) {
    const hackathons = events.filter(e => e.category === "Hackathon" || e.type === "Hackathon");
    return {
      message: `Based on your interest in hackathons, I found ${hackathons.length} upcoming events. ${context}`,
      suggestions: hackathons.slice(0, 2)
    };
  }

  if (q.includes("how") || q.includes("what is")) {
    return {
      message: `I found some information for you: ${context || "Eventra is a platform where you can discover and host amazing tech events."}`,
      suggestions: []
    };
  }

  return {
    message: "I'm your Eventra Intelligent Assistant! Ask me about upcoming events, hackathons, or how to use the platform. ✨",
    suggestions: []
  };
};
