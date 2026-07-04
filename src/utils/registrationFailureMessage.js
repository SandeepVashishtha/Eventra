export const getRegistrationFailureMessage = (error) => {
  const message = error?.data?.message || error?.data?.error || error?.message || "";
  const normalizedMessage = message.toLowerCase();

  if (error?.status === 409 && /already registered|duplicate/.test(normalizedMessage)) {
    return "You are already registered for this event.";
  }

  if (error?.status === 429) {
    const retryAfterSeconds = Number(error?.data?.retryAfter || error?.retryAfter || error?.headers?.["retry-after"]);
    const waitMessage = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? `Please wait about ${Math.ceil(retryAfterSeconds)} seconds and try again.`
      : "Please wait a moment and try again.";
    return `Too many requests. ${waitMessage}`;
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

export default getRegistrationFailureMessage;
