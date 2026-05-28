// serverless backend endpoint for AI recommendations
// Secures the Groq API key from frontend exposure

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // We look for GROQ_API_KEY on the server. As a fallback for local testing
  // while the env var is renamed, we check REACT_APP_GROQ_API_KEY.
  const apiKey = process.env.GROQ_API_KEY || process.env.REACT_APP_GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on the server." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Groq Proxy API] Error:", data);
      return res.status(response.status).json({ error: "Groq API request failed.", details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[Groq Proxy API] Request Failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
