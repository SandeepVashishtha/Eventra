export function shouldAnnounceCountdown(secondsLeft) {
  if (secondsLeft <= 0) return true;
  if (secondsLeft === 60 || secondsLeft === 300 || secondsLeft === 600 || secondsLeft === 3600) {
    return true; // Announce major intervals (1m, 5m, 10m, 1h)
  }
  return false;
}
