export function shouldAnnounceCountdown(secondsLeft) {
  if (secondsLeft <= 0) return true;
  const rounded = Math.round(secondsLeft);
  if (rounded === 60 || rounded === 300 || rounded === 600 || rounded === 3600) {
    return true; // Announce major intervals (1m, 5m, 10m, 1h)
  }
  if (rounded < 60 && rounded % 10 === 0) {
    return true; // Announce every 10s in the final minute
  }
  return false;
}
