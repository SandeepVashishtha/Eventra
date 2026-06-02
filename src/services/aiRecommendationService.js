import { apiUtils } from "../config/api";

export const generateAIInsights = async (event, profile) => {
  try {
    // 🔥 FIX 1: Added logical OR fallbacks to prevent "undefined" from polluting the AI prompt
    const prompt = `
You are an AI event recommendation assistant.

User Profile:
- Interests: ${profile.interests?.join(", ") || "None specified"}
- Tech Stack: ${profile.techStack?.join(", ") || "None specified"}
- Preferred Event Type: ${profile.eventTypes?.join(", ") || "Any"}
- Skill Level: ${profile.level || "Not specified"}

Event:
- Title: ${event.title || "Unknown"}
- Category: ${event.category || "General"}
- Description: ${event.description || "No description available"}

Explain in 3 concise bullet points why this event matches the user.
`;

    // Make request to our secure backend proxy instead of exposing the API key to the frontend
    // 🔥 FIX 2: Replaced raw fetch with apiUtils to ensure JWT Auth tokens and interceptors are applied
    const response = await apiUtils.post("/api/ai-recommendations", { prompt });

    const data = await response.json();

    return (
      data.choices?.[0]?.message?.content ||
      "No AI response generated."
    );
  } catch (error) {
    console.error("[aiRecommendationService] Request failed:", error);
    return "Unable to generate AI insights. The service is currently unavailable.";
  }
};