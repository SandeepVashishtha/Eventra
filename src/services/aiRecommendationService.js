import { apiUtils } from "../config/api";

export const generateAIInsights = async (event, profile) => {
  try {
    const prompt = `
You are an AI event recommendation assistant.

User Profile:
- Interests: ${profile.interests?.join(", ")}
- Tech Stack: ${profile.techStack?.join(", ")}
- Preferred Event Type: ${profile.eventTypes?.join(", ")}
- Skill Level: ${profile.level}

Event:
- Title: ${event.title}
- Category: ${event.category}
- Description: ${event.description}

Explain in 3 concise bullet points why this event matches the user.
`;

    // Make request to our secure backend proxy instead of exposing the API key to the frontend
    const response = await fetch("/api/ai-recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[aiRecommendationService] Server error:", data);
      return "Unable to generate AI insights. The service is currently unavailable.";
    }

    return (
      data.choices?.[0]?.message?.content ||
      "No AI response generated."
    );
  } catch (error) {
    console.error("[aiRecommendationService] Network/Parsing error:", error);
    return "Unable to connect to the recommendation service.";
  }
};