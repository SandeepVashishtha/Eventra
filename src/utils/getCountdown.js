export function getCountdown(eventDate) {
  if (!eventDate) {
    return { status: "UPCOMING", text: "Date TBD" };
  }

  const now = new Date().getTime();
  const target = new Date(eventDate).getTime();

  if (isNaN(target)) {
    return { status: "UPCOMING", text: "Date TBD" };
  }

  const diff = target - now;

  if (diff <= 0) {
    return {
      status: "LIVE",
      text: "Live Now",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return {
    status: "UPCOMING",
    text:
      days > 0
        ? `Starts in: ${days} Days ${hours} Hours`
        : `Starts in: ${hours} Hours ${minutes} Minutes`,
  };
}