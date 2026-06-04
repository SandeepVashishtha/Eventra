## Target
**File:** `src/components/Chatbot.jsx` (line 393-397)
**Category:** Security | **Level:** Intermediate

## The Vulnerability
Chatbot responses are rendered via `dangerouslySetInnerHTML` with markdown-parsed HTML. While `sanitizeMarkdown()` is used (which calls DOMPurify), the chatbot knowledge configuration at `src/config/chatbotKnowledge.js` feeds into the `getAssistantReply` function that generates response content, and conversation history is stored and tracked. Any user-controlled data that reaches the bot response pipeline (e.g. if the chatbot reflects user input, or if DOMPurify has an undiscovered bypass) creates an XSS vector.

## The Impact
An attacker who can inject content into the chatbot's response pipeline can execute arbitrary JavaScript in the context of any user who views the chatbot, leading to session hijacking, data exfiltration, or credential theft. DOMPurify bypasses are discovered periodically, and this pattern circumvents React's built-in XSS protection.

## Suggested Fix
Prefer rendering chatbot responses using React components instead of raw HTML. Parse markdown into React elements using a library like `react-markdown` instead of `marked` + `dangerouslySetInnerHTML`. If `dangerouslySetInnerHTML` must be retained, at minimum add a Content Security Policy nonce and ensure the chatbot never renders any user-supplied content.
