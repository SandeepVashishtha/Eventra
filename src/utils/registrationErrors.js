/**
 * Derives a user-facing error message from a failed registration API response.
 */
export const getRegistrationFailureMessage = (error) => {
  const message = error?.data?.message || error?.data?.error || error?.message || "";
  const normalizedMessage = message.toLowerCase();

  if (
    error?.status === 429 ||
    error?.name === "RateLimitError" ||
    /too many requests|rate limit/.test(normalizedMessage)
  ) {
    return "Too many registration attempts. Please wait a moment and try again.";
  }

  if (error?.status === 409 && /already registered|duplicate/.test(normalizedMessage)) {
    return "You are already registered for this event.";
  }

  if (
    error?.status === 409 ||
    error?.status === 423 ||
    /capacity|full|sold out|max(?:imum)? capacity/.test(normalizedMessage)
  ) {
    return "This event has reached maximum capacity. Please choose another event.";
  }

  if (/conflict/.test(normalizedMessage)) {
    return "Registration could not be completed because the server reported a conflict.";
  }

  return message || "Registration failed. Please try again.";
};
