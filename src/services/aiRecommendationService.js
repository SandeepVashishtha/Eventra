const GROQ_API_KEY =
  process.env.REACT_APP_GROQ_API_KEY;
  console.log(GROQ_API_KEY);

export const generateAIInsights =
  async (event, profile) => {

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

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${GROQ_API_KEY}`,
          },

          body: JSON.stringify({
            model: "llama-3.1-8b-instant",

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.7,
          }),
        }
      );

     const data =
  await response.json();

console.log(data);

if (!response.ok) {

  console.error(data);

  return "Groq API request failed.";

}

return data.choices?.[0]
  ?.message?.content ||
  "No AI response generated.";

    } catch (error) {

      console.error(error);

      return "Unable to generate AI insights.";

    }

};